import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationService } from './notification.service';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
    ],
    credentials: true,
  },
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId
  private connectedAdmins = new Map<string, string>(); // adminId -> socketId

  constructor(private notificationService: NotificationService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    
    // Remove from connected users/admins
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        break;
      }
    }
    
    for (const [adminId, socketId] of this.connectedAdmins.entries()) {
      if (socketId === client.id) {
        this.connectedAdmins.delete(adminId);
        break;
      }
    }
  }

  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() data: { userId: string; role: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { userId, role } = data;
    
    if (role === 'admin') {
      this.connectedAdmins.set(userId, client.id);
      console.log(`Admin ${userId} joined notifications`);
    } else {
      this.connectedUsers.set(userId, client.id);
      console.log(`User ${userId} joined notifications`);
    }
    
    client.emit('joined', { success: true });
  }

  @SubscribeMessage('getNotifications')
  async handleGetNotifications(
    @MessageBody() data: { userId: string; role: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const notifications = await this.notificationService.getUserNotifications(
        data.userId,
        data.role
      );
      client.emit('notifications', notifications);
    } catch (error) {
      client.emit('error', { message: 'Failed to fetch notifications' });
    }
  }

  // Method to send notification to specific user
  sendNotificationToUser(userId: string, notification: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('newNotification', notification);
    }
  }

  // Method to send notification to all admins
  sendNotificationToAdmins(notification: any) {
    this.connectedAdmins.forEach((socketId) => {
      this.server.to(socketId).emit('newNotification', notification);
    });
  }

  // Method to send notification to specific admin
  sendNotificationToAdmin(adminId: string, notification: any) {
    const socketId = this.connectedAdmins.get(adminId);
    if (socketId) {
      this.server.to(socketId).emit('newNotification', notification);
    }
  }

  // Method to broadcast to all connected users
  broadcastNotification(notification: any) {
    this.server.emit('newNotification', notification);
  }
}