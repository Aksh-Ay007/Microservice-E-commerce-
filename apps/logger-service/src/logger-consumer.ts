import { kafka } from "../../../packages/utils/kafka";
import { clients } from "./main";

const consumer = kafka.consumer({ groupId: "log-events-group" });

const logQueue: string[] = [];

const proccessLogs = () => {
  if (logQueue.length > 0) return;

  console.log(`Processing ${logQueue.length} log in batch`);

  const logs = [...logQueue];
  logQueue.length = 0;

  clients.forEach((clients) => {
    logs.forEach((log) => {
      clients.send(log);
    });
  });
};

setInterval(proccessLogs, 3000);

//log message from kafka

export const consumeKafkaMessages = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "logs", fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;

      const log = message.value.toString();
      logQueue.push(log);
    },
  });
};


consumeKafkaMessages();
