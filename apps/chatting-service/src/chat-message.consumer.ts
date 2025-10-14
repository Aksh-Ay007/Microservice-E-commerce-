import prisma from "@packages/libs/prisma";
import { Consumer, EachMessagePayload } from "kafkajs";
import { incrementUnseenCount } from "../../../packages/libs/redis/message.redis";
import { kafka } from "../../../packages/utils/kafka";

interface BufferedMessage {
  conversationId: string;
  senderId: string;
  senderType: string;
  content: string;
  createdAt: string;
}

const TOPIC = "chat.new_message";
const GROUP_ID = "chat_message-db-writer";
const BATCH_INTERVAL_MS = 3000; // 3 seconds

let buffer: BufferedMessage[] = [];
let flushTimer: NodeJS.Timeout | null = null;

export async function startConsumer() {
  const consumer: Consumer = kafka.consumer({ groupId: GROUP_ID });
  await consumer.connect();
  await consumer.subscribe({ topic: TOPIC, fromBeginning: false });
  console.log(`Kafka consumer connected and subscribed to "${TOPIC}" ,`);

  //start consuming messages

  await consumer.run({
    eachMessage: async ({ message }: EachMessagePayload) => {
      if (!message.value) return;

      try {
        const parsed: BufferedMessage = JSON.parse(message.value.toString());
        buffer.push(parsed);

        if (buffer.length === 1 && !flushTimer) {
          flushTimer = setTimeout(flushBufferToDb, BATCH_INTERVAL_MS);
        }
      } catch (error) {
        console.error("Error parsing kafka message:", error);
      }
    },
  });
}

//flush the buffer to db

async function flushBufferToDb() {
  const toInsert = buffer.splice(0, buffer.length);

  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }

  if (toInsert.length === 0) return;

  try {
    const prismaPayload = toInsert.map((msg) => ({
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      senderType: msg.senderType,
      content: msg.content,
      createdAt: new Date(msg.createdAt),
    }));

    await prisma.message.createMany({
      data: prismaPayload,
    });

    //redis unseen counter (only if db insert successful)

    for (const msg of prismaPayload) {
      const receiverType = msg.senderType === "user" ? "seller" : "user";

      await incrementUnseenCount(receiverType, msg.conversationId);
    }

    console.log(
      `Flushed ${prismaPayload.length} messages to the db and Redis.`
    );
  } catch (error) {
    console.error("Error inserting messages to DB:", error);
    buffer.unshift(...toInsert);
    if (!flushTimer) {
      flushTimer = setTimeout(flushBufferToDb, BATCH_INTERVAL_MS);
    }
  }
}
