const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "test-producer",
  brokers: ["pkc-619z3.us-east1.gcp.confluent.cloud:9092"], // <-- your real broker
  sasl: {
    mechanism: "plain",
    username: "HIHGIKTQ4VDSMP7E",
    password:
      "cflteavc1HMV+fq8J+nNsBi13XRet/hYVpsuStIQuRWmMp/R5wIV0YBt3m0GoUxQ",
  }, // <-- your real credentials
  ssl: true,
});

const producer = kafka.producer();

async function run() {
  await producer.connect();
  await producer.send({
    topic: "users-events",
    messages: [
      {
        value: JSON.stringify({
          action: "add_to_cart",
          userId: "test",
          productId: "test",
          shopId: "test",
        }),
      },
    ],
  });
  await producer.disconnect();
  console.log("Test message sent!");
}

run().catch(console.error);
