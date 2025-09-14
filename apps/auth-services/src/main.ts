import express from 'express';
import cors from 'cors';
import { errorMiddleware } from '@packages/error-handler/error-middleware';
import cookieParser from 'cookie-parser';
import router from './routes/auth.router';
import swaggerUi from 'swagger-ui-express';
const swaggerDocument = require('./swagger.json');

const app = express();

app.use(cors({
  origin: ['http://localhost:3000'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send({ 'message': 'Hello everyon e testing auth-services!' });
});

//swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/api-docs.json', (req, res) => {
  res.json(swaggerDocument);
});

//Routes
app.use('/api', router);

// Error middleware should be last
app.use(errorMiddleware);

let port = process.env.PORT || 6001;

const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
  console.log(`Swagger UI is available at http://localhost:${port}/docs`);
});

server.on('error', err => {
  console.error("server error", err);
});