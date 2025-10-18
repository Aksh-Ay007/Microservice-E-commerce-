import { WebSocket } from 'ws';
import prisma from '@packages/libs/prisma';

interface NotificationData {
  id: string;
  receiverId: string;
  title: string;
  message: string;
  type: 'order' | 'product' | 'system' | 'general';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: string;
  creator: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  redirect_link?: string;
}

class NotificationService {
  private static instance: NotificationService;
  private connections: Map<string, WebSocket> = new Map();

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  addConnection(userId: string, ws: WebSocket) {
    this.connections.set(userId, ws);
    console.log(`User ${userId} connected to notifications`);
  }

  removeConnection(userId: string) {
    this.connections.delete(userId);
    console.log(`User ${userId} disconnected from notifications`);
  }

  async sendNotification(notificationData: NotificationData) {
    const ws = this.connections.get(notificationData.receiverId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify({
          type: 'notification',
          data: notificationData
        }));
        console.log(`Notification sent to user ${notificationData.receiverId}`);
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    }
  }

  async broadcastToAdmins(notificationData: Omit<NotificationData, 'receiverId'>) {
    try {
      const admins = await prisma.users.findMany({
        where: { role: 'admin' },
        select: { id: true }
      });

      for (const admin of admins) {
        const ws = this.connections.get(admin.id);
        if (ws && ws.readyState === WebSocket.OPEN) {
          try {
            ws.send(JSON.stringify({
              type: 'notification',
              data: { ...notificationData, receiverId: admin.id }
            }));
          } catch (error) {
            console.error(`Error sending notification to admin ${admin.id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error broadcasting to admins:', error);
    }
  }

  async broadcastToSellers(notificationData: Omit<NotificationData, 'receiverId'>) {
    try {
      const sellers = await prisma.sellers.findMany({
        select: { id: true }
      });

      for (const seller of sellers) {
        const ws = this.connections.get(seller.id);
        if (ws && ws.readyState === WebSocket.OPEN) {
          try {
            ws.send(JSON.stringify({
              type: 'notification',
              data: { ...notificationData, receiverId: seller.id }
            }));
          } catch (error) {
            console.error(`Error sending notification to seller ${seller.id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error broadcasting to sellers:', error);
    }
  }

  getConnectionCount(): number {
    return this.connections.size;
  }

  getConnectedUsers(): string[] {
    return Array.from(this.connections.keys());
  }
}

export default NotificationService;