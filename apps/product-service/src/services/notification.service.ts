import prisma from "@packages/libs/prisma";

export interface CreateNotificationData {
  creatorId: string;
  receiverId: string;
  title: string;
  message: string;
  type?: 'order' | 'product' | 'system' | 'general';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  redirect_link?: string;
}

export class NotificationService {
  static async createNotification(data: CreateNotificationData) {
    try {
      const notification = await prisma.notifications.create({
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
            select: { id: true, name: true, email: true, role: true },
          },
        },
      });
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  static async notifyAdminsAboutNewEvent(eventData: {
    title: string;
    sellerName: string;
    shopName: string;
    eventId: string;
  }) {
    try {
      // Get all admin users
      const admins = await prisma.users.findMany({
        where: { role: 'admin' },
        select: { id: true },
      });

      // Create notifications for all admins
      const notifications = await Promise.all(
        admins.map(admin =>
          this.createNotification({
            creatorId: 'system', // System-generated notification
            receiverId: admin.id,
            title: 'New Event Created',
            message: `A new event "${eventData.title}" has been created by ${eventData.sellerName} from ${eventData.shopName}`,
            type: 'product',
            priority: 'normal',
            redirect_link: `/admin/events/${eventData.eventId}`,
          })
        )
      );

      return notifications;
    } catch (error) {
      console.error('Error notifying admins about new event:', error);
      throw error;
    }
  }

  static async notifySellerAboutEventStatus(eventData: {
    title: string;
    sellerId: string;
    status: 'approved' | 'rejected' | 'updated';
    eventId: string;
  }) {
    try {
      const statusMessages = {
        approved: 'Your event has been approved and is now live!',
        rejected: 'Your event has been rejected. Please review and resubmit.',
        updated: 'Your event has been updated by admin.',
      };

      return await this.createNotification({
        creatorId: 'system',
        receiverId: eventData.sellerId,
        title: `Event ${eventData.status.charAt(0).toUpperCase() + eventData.status.slice(1)}`,
        message: `Event "${eventData.title}" - ${statusMessages[eventData.status]}`,
        type: 'product',
        priority: eventData.status === 'rejected' ? 'high' : 'normal',
        redirect_link: `/seller/events/${eventData.eventId}`,
      });
    } catch (error) {
      console.error('Error notifying seller about event status:', error);
      throw error;
    }
  }
}