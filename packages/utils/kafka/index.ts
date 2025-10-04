import { Kafka } from "kafkajs";

const username = process.env.KAFKA_API_KEY!;
const password = process.env.KAFKA_API_SECRET!;

console.log("Kafka credentials loaded:", {
  username: username ? "***" + username.slice(-4) : "Missing",
  password: password ? "***" + password.slice(-4) : "Missing",
});

export const kafka = new Kafka({
  clientId: "kafka-service",
  brokers: ["pkc-619z3.us-east1.gcp.confluent.cloud:9092"],
  ssl: true,
  sasl: {
    mechanism: "plain",
    username,
    password,
  },
});
