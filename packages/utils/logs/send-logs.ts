import { kafka } from "@packages/utils/kafka";

const producer = kafka.producer();

export async function sendLog({
  type = "info",
  message,
  source = "unknown-service",
}: {
  type?: "info" | "error" | "warning" | "success" | "debug";
  message: string;
  source?: string;
}) {
  const logPayload = {
    type,
    message,
    source,
    timestamp: new Date().toISOString(),
  };
  await producer.connect();
  await producer.send({
    topic: "logs",
    messages: [
      {
        value: JSON.stringify(logPayload),
      },
    ],
  });
  await producer.disconnect();
}
