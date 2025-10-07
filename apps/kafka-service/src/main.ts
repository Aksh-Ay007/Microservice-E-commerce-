console.log("=== Kafka Service Started ===");
process.stdout.write("=== Kafka Service Started (stdout) ===\n");

import { kafka } from "@packages/utils/kafka";
import { updateUserAnalytics } from "./services/analytics.service";

const consumer = kafka.consumer({ groupId: "users-events-group" });

const eventQueue: any[] = [];

const processQueue = async () => {
  if (eventQueue.length === 0) return;

  const events = [...eventQueue];
  eventQueue.length = 0;

  for (const event of events) {
    if (event.action === "shop_visit") {
      // update the shop visit count in the database
    }

    const validActions = [
      "add_to_wishlist",
      "add_to_cart",
      "product_view",
      "remove_from_cart",
      "remove_from_wishlist",
    ];

    if (!event.action || !validActions.includes(event.action)) {

      continue;
    }
    try {
      await updateUserAnalytics(event);
    } catch (error) {
      console.error("Error processing event:", error);
    }
  }
};

setInterval(processQueue, 3000); // Process the queue every 3 seconds

export const consumeKafkaMessages = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: "users-events", fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;
        try {
          const event = JSON.parse(message.value.toString());
          eventQueue.push(event);
        } catch (error) {
          console.error("Failed to parse Kafka message:", error);
        }
      },
    });

  } catch (err) {
    console.error("Kafka consumer failed to start:", err);
    process.exit(1);
  }
};

consumeKafkaMessages();
