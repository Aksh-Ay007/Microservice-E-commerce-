import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class NotificationService {
  private prisma = new PrismaClient();

  async getUserNotifications(userId: string, role: string) {
    try {
      const notifications = await this.prisma.notifications.findMany({
        where: { receiverId: userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

      return {
        success: true,
        notifications,
        unreadCount: notifications.filter(n => n.status === 'Unread').length,
      };
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  }

  async createNotification(data: {
    creatorId: string;
    receiverId: string;
    title: string;
    message: string;
    type?: string;
    priority?: string;
    redirect_link?: string;
  }) {
    try {
      const notification = await this.prisma.notifications.create({
        data: {
          creatorId: data.creatorId,
          receiverId: data.receiverId,
          title: data.title,
          message: data.message,
          type: data.type || 'general',
          priority: data.priority || 'normal',
          redirect_link: data.redirect_link,
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async markAsRead(notificationId: string) {
    try {
      return await this.prisma.notifications.update({
        where: { id: notificationId },
        data: { status: 'Read' },
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead(userId: string) {
    try {
      return await this.prisma.notifications.updateMany({
        where: { receiverId: userId, status: 'Unread' },
        data: { status: 'Read' },
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId: string) {
    try {
      return await this.prisma.notifications.delete({
        where: { id: notificationId },
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  async getNotificationStats() {
    try {
      const [total, unread, byType, byPriority] = await Promise.all([
        this.prisma.notifications.count(),
        this.prisma.notifications.count({ where: { status: 'Unread' } }),
        this.prisma.notifications.groupBy({
          by: ['type'],
          _count: { type: true },
        }),
        this.prisma.notifications.groupBy({
          by: ['priority'],
          _count: { priority: true },
        }),
      ]);

      return {
        total,
        unread,
        byType: byType.reduce((acc, item) => {
          acc[item.type] = item._count.type;
          return acc;
        }, {}),
        byPriority: byPriority.reduce((acc, item) => {
          acc[item.priority] = item._count.priority;
          return acc;
        }, {}),
      };
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      throw error;
    }
  }
}