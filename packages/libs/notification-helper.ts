
import prisma from "./prisma";

export interface CreateNotificationData {
  receiverId: string;
  creatorId: string;
  title: string;
  message: string;
  type?: "order" | "product" | "system" | "general";
  priority?: "low" | "normal" | "high" | "urgent";
  redirect_link?: string;
}

export const createNotification = async (data: CreateNotificationData) => {
  try {
    const notification = await prisma.notifications.create({
      data: {
        receiverId: data.receiverId,
        creatorId: data.creatorId,
        title: data.title,
        message: data.message,
        type: data.type || "general",
        priority: data.priority || "normal",
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
    console.error("Error creating notification:", error);
    throw error;
  }
};

export const createProductNotification = async (
  productId: string,
  sellerId: string,
  productTitle: string,
  isEvent: boolean = false
) => {
  try {
    // Get all admin users to notify
    const admins = await prisma.users.findMany({
      where: { role: "admin" },
      select: { id: true },
    });

    // Create notifications for all admins
    const notifications = await Promise.all(
      admins.map((admin) =>
        createNotification({
          receiverId: admin.id,
          creatorId: sellerId,
          title: `New ${isEvent ? "Event" : "Product"} Created`,
          message: `A new ${
            isEvent ? "event" : "product"
          } "${productTitle}" has been created and is pending review.`,
          type: "product",
          priority: "normal",
          redirect_link: isEvent ? `/dashboard/events` : `/dashboard/products`,
        })
      )
    );

    return notifications;
  } catch (error) {
    console.error("Error creating product notification:", error);
    throw error;
  }
};

export const createOrderNotification = async (
  orderId: string,
  sellerId: string,
  userId: string,
  orderTotal: number
) => {
  try {
    // Notify seller about new order
    const sellerNotification = await createNotification({
      receiverId: sellerId,
      creatorId: userId,
      title: "New Order Received",
      message: `You have received a new order worth $${orderTotal.toFixed(2)}`,
      type: "order",
      priority: "high",
      redirect_link: `/dashboard/orders/${orderId}`,
    });

    return sellerNotification;
  } catch (error) {
    console.error("Error creating order notification:", error);
    throw error;
  }
};

export const createSystemNotification = async (
  receiverId: string,
  title: string,
  message: string,
  priority: "low" | "normal" | "high" | "urgent" = "normal"
) => {
  try {
    // Use system user ID (you might want to create a dedicated system user)
    const systemUserId = "system"; // Replace with actual system user ID

    const notification = await createNotification({
      receiverId,
      creatorId: systemUserId,
      title,
      message,
      type: "system",
      priority,
    });

    return notification;
  } catch (error) {
    console.error("Error creating system notification:", error);
    throw error;
  }
};
