import { io, Socket } from 'socket.io-client';

class NotificationService {
  private socket: Socket | null = null;
  private isConnected = false;

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    try {
      this.socket = io(process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:6009', {
        withCredentials: true,
      });

      this.socket.on('connect', () => {
        console.log('✅ Connected to notification service');
        this.isConnected = true;
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Disconnected from notification service');
        this.isConnected = false;
      });

      this.socket.on('error', (error) => {
        console.error('❌ Notification service error:', error);
      });
    } catch (error) {
      console.error('❌ Failed to initialize notification service:', error);
    }
  }

  async sendNotificationToAdmins(notification: {
    title: string;
    message: string;
    type?: string;
    priority?: string;
    redirect_link?: string;
  }) {
    if (!this.isConnected || !this.socket) {
      console.warn('⚠️ Notification service not connected, skipping notification');
      return;
    }

    try {
      this.socket.emit('sendNotificationToAdmins', notification);
      console.log('✅ Notification sent to admins:', notification.title);
    } catch (error) {
      console.error('❌ Error sending notification to admins:', error);
    }
  }

  async sendNotificationToUser(userId: string, notification: {
    title: string;
    message: string;
    type?: string;
    priority?: string;
    redirect_link?: string;
  }) {
    if (!this.isConnected || !this.socket) {
      console.warn('⚠️ Notification service not connected, skipping notification');
      return;
    }

    try {
      this.socket.emit('sendNotificationToUser', { userId, notification });
      console.log('✅ Notification sent to user:', userId, notification.title);
    } catch (error) {
      console.error('❌ Error sending notification to user:', error);
    }
  }
}

export default new NotificationService();