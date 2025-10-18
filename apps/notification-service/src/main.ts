import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for WebSocket connections
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:3002',
    ],
    credentials: true,
  });

  await app.listen(6009);
  console.log('Notification service running on port 6009');
}
bootstrap();