import { errorMiddleware } from "@packages/error-handler/error-middleware";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import router from "./routes/auth.router";
const swaggerDocument = require("./swagger.json");

const app = express();

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ["http://localhost:3000"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send({ message: "Welcome to auth-services!" });
});

//swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/api-docs.json", (req, res) => {
  res.json(swaggerDocument);
});

//Routes
app.use("/api", router);

// Error middleware should be last
app.use(errorMiddleware);

// Validate required environment variables
const requiredEnvVars = ['ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET', 'DATABASE_URL'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

let port = process.env.PORT || 6001;

const server = app.listen(port, () => {
  console.log(`✅ Auth service is running at http://localhost:${port}/api`);
  console.log(`📚 Swagger UI is available at http://localhost:${port}/api-docs`);
});

server.on("error", (err) => {
  console.error("server error", err);
});
