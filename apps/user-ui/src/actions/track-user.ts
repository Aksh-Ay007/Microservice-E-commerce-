"use server";

import { kafka } from "packages/utils/kafka";

// Create producer once and reuse it
const producer = kafka.producer();
let isConnected = false;

async function ensureProducerConnected() {
  if (!isConnected) {
    await producer.connect();
    isConnected = true;
  }
}

export async function sendkafkaEvent(eventData: {
  userId?: string;
  productId?: string;
  shopId?: string;
  action?: string;
  device?: string;
  country?: string;
  city?: string;
}) {
  try {
    await ensureProducerConnected();
    await producer.send({
      topic: "users-events",
      messages: [{ value: JSON.stringify(eventData) }],
    });
    console.log("Kafka event sent:", eventData.action);
  } catch (error) {
    console.error("Error sending Kafka event:", error);
    // Retry connection on error
    isConnected = false;
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  if (isConnected) {
    await producer.disconnect();
  }
});
