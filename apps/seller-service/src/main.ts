import  cookieParser  from 'cookie-parser';
import  cors  from 'cors';
import { errorMiddleware } from '@packages/error-handler/error-middleware';

import express from 'express';
import router from './routes/seller.router';

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());


app.get('/', (req, res) => {
  res.send({ message: 'Welcome to seller-service!' });
});

//Routes
app.use("/api", router);

app.use(errorMiddleware)

const port = process.env.PORT || 6004;
const server = app.listen(port, () => {
 console.log(`Seller service is running at http://localhost:${port}/api`);
});
server.on('error', console.error);
