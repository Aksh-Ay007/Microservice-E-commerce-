import { errorMiddleware } from "@packages/error-handler/error-middleware";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import router from './routes/product-router';
// import swaggerUi from "swagger-ui-express";
// const swaggerDocument = require("./swagger.json");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb"}));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send({ message: "Hello everyon is testing product-services!" });
});

//swagger
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// // app.get("/api-docs.json", (req, res) => {
//   res.json(swaggerDocument);
// });

//Routes
 app.use("/api", router);

// Error middleware should be last
app.use(errorMiddleware);

let port = process.env.PORT || 6002;

const server = app.listen(port, () => {
  console.log(`Product service is running at http://localhost:${port}/api`);
  console.log(`Swagger UI is available at http://localhost:${port}/docs`);
});

server.on("error", (err) => {
  console.error("server error", err);
});
