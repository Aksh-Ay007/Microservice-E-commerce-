import { Kafka, logLevel } from "kafkajs";

const username = process.env.KAFKA_API_KEY!;
const password = process.env.KAFKA_API_SECRET!;
const broker = process.env.KAFKA_BROKER!;

console.log("✅ Kafka credentials loaded:", {
  username: "***" + username.slice(-4),
  password: "***" + password.slice(-4),
  broker,
});

export const kafka = new Kafka({
  clientId: "kafka-service",
  brokers: [broker],
  ssl: {
    rejectUnauthorized: true, // enforce TLS validation
  },
  sasl: {
    mechanism: "plain", // required for Confluent Cloud
    username,
    password,
  },
  connectionTimeout: 10000,
  authenticationTimeout: 10000,
  logLevel: logLevel.INFO,
});
