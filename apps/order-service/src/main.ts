import bodyParser from 'body-parser';
import { errorMiddleware } from "@packages/error-handler/error-middleware";
import cookieParser from "cookie-parser";
import cors from "cors";

import express from "express";
import router from './routes/order.route';
import { createOrder } from './controllers/order.controller';

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);


app.post("/api/create-order", bodyParser.raw({type:"application/json"}),(req,res,next)=>{
  (req as any).rawBody=req.body;
  next();

},
createOrder

);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send({ message: "Welcome to order-service!" });
});

app.use("/api",router)

app.use(errorMiddleware);

const port = process.env.PORT || 6003;

 const server = app.listen(port, () => {
   console.log(`Order service is running at http://localhost:${port}/api`);

 });

server.on("error", (err) => {
  console.error("server error", err);
});
