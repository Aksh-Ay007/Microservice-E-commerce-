import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "@packages/error-handler/error-middleware";
import router from "./routes/order.route";
import { createOrder } from "./controllers/order.controller";

const app = express();

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ["http://localhost:3000"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);

app.use(cookieParser());

// ✅ 1. Stripe webhook endpoint — raw body (for signature)
app.post(
  "/api/create-order",
  bodyParser.raw({ type: "application/json" }),
  (req, res, next) => {
    (req as any).rawBody = req.body;
    next();
  },
  createOrder
);

// ✅ 2. Enable JSON parser for *other* normal routes (AFTER webhook)
app.use(express.json());

// ✅ 3. Normal API routes for your app
app.use("/api", router);

app.get("/", (req, res) => {
  res.send({ message: "Welcome to order-service!" });
});

app.use(errorMiddleware);

const port = process.env.PORT || 6003;

const server = app.listen(port, () => {
  console.log(`✅ Order service is running at http://localhost:${port}/api`);
});

server.on("error", (err) => {
  console.error("❌ Server error", err);
});
