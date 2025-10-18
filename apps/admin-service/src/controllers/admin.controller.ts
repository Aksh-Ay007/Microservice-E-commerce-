import prisma from "@packages/libs/prisma";
import { NextFunction, Request, Response } from "express";
import { ValidationError } from "../../../../packages/error-handler";
import { imagekit } from "../../../../packages/libs/imagekit";

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // ✅ Admin sees all products, even inactive ones
    const baseFilter = {
      isDeleted: false,
    };

    const [products, totalProducts] = await Promise.all([
      prisma.products.findMany({
        where: baseFilter,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          sale_price: true,
          stock: true,
          createdAt: true,
          ratings: true,
          category: true,
          images: {
            select: { url: true },
            take: 1,
          },
          Shop: {
            select: {
              name: true,
            },
          },
        }, // ✅ This closing bracket was missing
      }),

      prisma.products.count({ where: baseFilter }),
    ]);

    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      success: true,
      data: products,
      meta: {
        totalProducts,
        currentPage: page,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Admin getAllProducts error:", error);
    next(error);
  }
};

export const getAllEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // ✅ Admin sees all products, even inactive ones
    const baseFilter = {
      starting_date: {
        not: null,
      },
      isDeleted: false, // optional, keep consistent with products
    };

    const [events, totalEvents] = await Promise.all([
      prisma.products.findMany({
        where: baseFilter,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          sale_price: true,
          stock: true,
          starting_date: true, // ✅ added
          ending_date: true, // ✅ added
          createdAt: true,
          ratings: true,
          category: true,
          images: {
            select: { url: true },
            take: 1,
          },
          Shop: {
            select: { name: true },
          },
        },
      }),
      prisma.products.count({ where: baseFilter }),
    ]);

    const totalPages = Math.ceil(totalEvents / limit);

    res.status(200).json({
      success: true,
      data: events,
      meta: {
        totalEvents,
        currentPage: page,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Admin getallEvents error:", error);
    next(error);
  }
};

export const getAllAdmins = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const admins = await prisma.users.findMany({
      where: { role: "admin" },
    });

    res.status(200).json({
      success: true,
      data: admins,
    });
  } catch (error) {
    next(error);
  }
};

export const addNewAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, role } = req.body;

    const isUser = await prisma.users.findUnique({ where: { email } });

    if (!isUser) {
      return next(new ValidationError("admin not found", 400));
    }

    const updateRole = await prisma.users.update({
      where: { email },
      data: { role },
    });

    res.status(200).json({
      success: true,
      data: updateRole,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [users, totalUsers] = await Promise.all([
      prisma.users.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),

      prisma.users.count(),
    ]);

    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      success: true,
      data: users,
      meta: {
        totalUsers,
        currentPage: page,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllSellers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [sellers, totalSellers] = await Promise.all([
      prisma.sellers.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          shop: {
            select: {
              name: true,
              avatar: true,
              address: true,
            },
          },
        },
      }),

      prisma.sellers.count(),
    ]);

    const totalPages = Math.ceil(totalSellers / limit);

    res.status(200).json({
      success: true,
      data: sellers,
      meta: {
        totalSellers,
        currentPage: page,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCustomizations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const config = await prisma.site_config.findFirst();

    return res.status(200).json({
      categories: config?.categories || [],
      subCategories: config?.subCategories || [],
      logo: config?.logo || null,
      banner: config?.banner || null,
    });
  } catch (error) {
    return next(error);
  }
};

// ========================================
// HELPER FUNCTION
// ========================================
export const updateSiteConfig = async (data: any) => {
  try {
    const siteConfig = await prisma.site_config.findFirst();

    if (!siteConfig) {
      // create first record if missing
      return await prisma.site_config.create({
        data,
      });
    }

    return await prisma.site_config.update({
      where: { id: siteConfig.id },
      data,
    });
  } catch (error) {
    console.error("❌ updateSiteConfig error:", error);
    throw error;
  }
};

// ========================================
// ADD CATEGORY
// ========================================
export const addCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category } = req.body;

    if (!category || !category.trim()) {
      return next(new ValidationError("Category name is required", 400));
    }

    const config = await prisma.site_config.findFirst();
    const existing = config?.categories || [];

    if (existing.includes(category)) {
      return next(new ValidationError("Category already exists", 400));
    }

    await updateSiteConfig({
      categories: [...existing, category],
      subCategories: {
        ...(config?.subCategories as Record<string, string[]>),
        [category]: [],
      },
    });

    res.status(200).json({
      success: true,
      message: "Category added successfully",
      category,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// ADD SUBCATEGORY
// ========================================
export const addSubCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category, subCategory } = req.body;

    if (!category || !subCategory) {
      return next(
        new ValidationError("Category and subcategory are required", 400)
      );
    }

    const config = await prisma.site_config.findFirst();
    const allSubs = (config?.subCategories as Record<string, string[]>) || {};
    const current = allSubs[category] || [];

    if (current.includes(subCategory)) {
      return next(new ValidationError("Subcategory already exists", 400));
    }

    const updatedSubs = {
      ...allSubs,
      [category]: [...current, subCategory],
    };

    await updateSiteConfig({ subCategories: updatedSubs });

    res.status(200).json({
      success: true,
      message: "Subcategory added successfully",
      subCategory,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadLogo = async (req: any, res: Response): Promise<void> => {
  try {
    console.log("✅ uploadLogo started, body:", req.body);

    const { fileName } = req.body;
    if (!fileName) {
      console.log("❌ Missing fileName");
      res.status(400).json({ error: "Logo image is required" });
      return; // 👈 add this so all code paths end with return
    }

    const uploadRes = await imagekit.upload({
      file: fileName,
      fileName: `logo_${Date.now()}.png`,
      folder: "/photo",
    });

    console.log("✅ imagekit upload success:", uploadRes.url);

    const updateRes = await updateSiteConfig({ logo: uploadRes.url });
    console.log("✅ updateSiteConfig success:", updateRes);

    res.status(200).json({
      success: true,
      message: "Logo uploaded successfully",
      logo: uploadRes.url,
    });
    return; // 👈 also return here
  } catch (error: any) {
    console.error("❌ uploadLogo full error:", error);
    res.status(500).json({
      error: error.message || "something went wrong please try again later",
    });
  }
};

// ✅ Upload Banner Controller
export const uploadBanner = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileName } = req.body;
    if (!fileName) throw new ValidationError("Banner image is required");

    const uploadRes = await imagekit.upload({
      file: fileName,
      fileName: `banner_${Date.now()}.png`,
      folder: "/photo",
    });

    await updateSiteConfig({ banner: uploadRes.url });

    res.status(200).json({
      success: true,
      message: "Banner uploaded successfully",
      banner: uploadRes.url,
    });
  } catch (error) {
    console.error("❌ uploadBanner error:", error);
    res.status(500).json({ success: false, message: "Banner upload failed" });
  }
};

// ========================================
// NOTIFICATIONS CONTROLLERS
// ========================================

export const getAllNotifications = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status, type, priority, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (priority) where.priority = priority;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: "insensitive" } },
        { message: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const [notifications, total] = await Promise.all([
      prisma.notifications.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        include: {
          creator: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      }),
      prisma.notifications.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch notifications" });
  }
};

// Get notification statistics
export const getNotificationStats = async (req: Request, res: Response) => {
  try {
    const [total, unread, byType, byPriority] = await Promise.all([
      prisma.notifications.count(),
      prisma.notifications.count({ where: { status: "Unread" } }),
      prisma.notifications.groupBy({
        by: ["type"],
        _count: { type: true },
      }),
      prisma.notifications.groupBy({
        by: ["priority"],
        _count: { priority: true },
      }),
    ]);

    res.json({
      success: true,
      data: {
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
      },
    });
  } catch (error) {
    console.error("Error fetching notification stats:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch notification statistics",
      });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notifications.update({
      where: { id },
      data: { status: "Read" },
    });

    res.json({ success: true, data: notification });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to mark notification as read" });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (
  req: Request,
  res: Response
) => {
  try {
    const { receiverId } = req.body;

    await prisma.notifications.updateMany({
      where: { receiverId, status: "Unread" },
      data: { status: "Read" },
    });

    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to mark all notifications as read",
      });
  }
};

// Delete notification
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.notifications.delete({
      where: { id },
    });

    res.json({ success: true, message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete notification" });
  }
};

// Get user notifications
export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const { receiverId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { receiverId };
    if (status) where.status = status;

    const [notifications, total] = await Promise.all([
      prisma.notifications.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        include: {
          creator: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      }),
      prisma.notifications.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch user notifications" });
  }
};

// Create notification
export const createNotification = async (req: Request, res: Response) => {
  try {
    const {
      receiverId,
      title,
      message,
      type = "general",
      priority = "normal",
      redirect_link,
    } = req.body;
    const creatorId = req.user?.id; // Assuming you have user info in req.user

    const notification = await prisma.notifications.create({
      data: {
        creatorId,
        receiverId,
        title,
        message,
        type,
        priority,
        redirect_link,
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    console.error("Error creating notification:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create notification" });
  }
};
