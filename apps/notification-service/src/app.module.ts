import { Module } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { NotificationService } from './notification.service';

@Module({
  providers: [NotificationGateway, NotificationService],
})
export class AppModule {}