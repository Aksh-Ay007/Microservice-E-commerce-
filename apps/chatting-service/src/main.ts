

import cookieParser from "cookie-parser";
import express from "express";
import { startConsumer } from "./chat-message.consumer";
import router from "./routes/chat.routes";
import { createWebSocketServer } from "./websocket";

const app = express();


app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send({ message: "Welcome to chatting-service!" });
});

//routes

app.use("/api", router);

const port = process.env.PORT || 6006;
const server = app.listen(port, () => {
  console.log(`chat service is running at http://localhost:${port}/api`);
});

//WebSocket server

createWebSocketServer(server);

//start kafka Consumer

startConsumer().catch((error: any) => {
  console.error("Error starting Kafka consumer:", error);
});

server.on("error", console.error);
