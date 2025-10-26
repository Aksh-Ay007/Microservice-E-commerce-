import prisma from "@packages/libs/prisma";
import { ValidationError } from "../../../../packages/error-handler";
import { imagekit } from "../../../../packages/libs/imagekit";
import { NextFunction, Request, Response } from 'express';

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
    res.status(500).json({
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

    if (receiverId === "all") {
      // Mark all notifications as read
      await prisma.notifications.updateMany({
        where: { status: "Unread" },
        data: { status: "Read" },
      });
    } else {
      // Mark specific user's notifications as read
      await prisma.notifications.updateMany({
        where: { receiverId, status: "Unread" },
        data: { status: "Read" },
      });
    }

    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
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

// ========================================
// DASHBOARD ANALYTICS ENDPOINTS
// ========================================

// Get dashboard statistics for Admin
export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get current date and date ranges
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);
    const last30Days = new Date(today);
    last30Days.setDate(last30Days.getDate() - 30);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Execute all queries in parallel
    const [
      totalUsers,
      totalSellers,
      totalProducts,
      totalEvents,
      totalOrders,
      totalRevenue,
      todayOrders,
      yesterdayOrders,
      todayRevenue,
      yesterdayRevenue,
      last7DaysOrders,
      last7DaysRevenue,
      last30DaysOrders,
      last30DaysRevenue,
      thisMonthOrders,
      thisMonthRevenue,
      lastMonthOrders,
      lastMonthRevenue,
      ordersByStatus,
      recentOrders,
      topProducts,
    ] = await Promise.all([
      // Total counts
      prisma.users.count({ where: { role: "user" } }),
      prisma.sellers.count({ where: { isDeleted: false } }),
      prisma.products.count({ where: { isDeleted: false } }),
      prisma.products.count({
        where: { starting_date: { not: null }, isDeleted: false },
      }),
      prisma.orders.count(),
      prisma.orders.aggregate({
        _sum: { total: true },
      }),

      // Today stats
      prisma.orders.count({
        where: { createdAt: { gte: today } },
      }),
      prisma.orders.count({
        where: {
          createdAt: {
            gte: yesterday,
            lt: today,
          },
        },
      }),
      prisma.orders.aggregate({
        where: { createdAt: { gte: today } },
        _sum: { total: true },
      }),
      prisma.orders.aggregate({
        where: {
          createdAt: {
            gte: yesterday,
            lt: today,
          },
        },
        _sum: { total: true },
      }),

      // Last 7 days stats
      prisma.orders.count({
        where: { createdAt: { gte: last7Days } },
      }),
      prisma.orders.aggregate({
        where: { createdAt: { gte: last7Days } },
        _sum: { total: true },
      }),

      // Last 30 days stats
      prisma.orders.count({
        where: { createdAt: { gte: last30Days } },
      }),
      prisma.orders.aggregate({
        where: { createdAt: { gte: last30Days } },
        _sum: { total: true },
      }),

      // This month stats
      prisma.orders.count({
        where: { createdAt: { gte: thisMonthStart } },
      }),
      prisma.orders.aggregate({
        where: { createdAt: { gte: thisMonthStart } },
        _sum: { total: true },
      }),

      // Last month stats
      prisma.orders.count({
        where: {
          createdAt: {
            gte: lastMonthStart,
            lt: lastMonthEnd,
          },
        },
      }),
      prisma.orders.aggregate({
        where: {
          createdAt: {
            gte: lastMonthStart,
            lt: lastMonthEnd,
          },
        },
        _sum: { total: true },
      }),

      // Orders by status
      prisma.orders.groupBy({
        by: ["status"],
        _count: { status: true },
      }),

      // Recent orders
      prisma.orders.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { name: true, email: true },
          },
          shop: {
            select: { name: true },
          },
        },
      }),

      // Top products by sales
      prisma.products.findMany({
        where: { isDeleted: false },
        take: 10,
        orderBy: { totalSales: "desc" },
        select: {
          id: true,
          title: true,
          totalSales: true,
          sale_price: true,
          images: {
            select: { url: true },
            take: 1,
          },
        },
      }),
    ]);

    // Calculate percentage changes
    const ordersChange =
      yesterdayOrders > 0
        ? ((todayOrders - yesterdayOrders) / yesterdayOrders) * 100
        : todayOrders > 0
        ? 100
        : 0;

    const revenueChange =
      (yesterdayRevenue._sum.total || 0) > 0
        ? ((todayRevenue._sum.total - (yesterdayRevenue._sum.total || 0)) /
            (yesterdayRevenue._sum.total || 0)) *
          100
        : (todayRevenue._sum.total || 0) > 0
        ? 100
        : 0;

    // Prepare response
    const response = {
      success: true,
      data: {
        overview: {
          totalUsers,
          totalSellers,
          totalProducts,
          totalEvents,
          totalOrders,
          totalRevenue: totalRevenue._sum.total || 0,
        },
        today: {
          orders: todayOrders,
          revenue: todayRevenue._sum.total || 0,
        },
        yesterday: {
          orders: yesterdayOrders,
          revenue: yesterdayRevenue._sum.total || 0,
        },
        changes: {
          ordersChange: parseFloat(ordersChange.toFixed(2)),
          revenueChange: parseFloat(revenueChange.toFixed(2)),
        },
        last7Days: {
          orders: last7DaysOrders,
          revenue: last7DaysRevenue._sum.total || 0,
        },
        last30Days: {
          orders: last30DaysOrders,
          revenue: last30DaysRevenue._sum.total || 0,
        },
        thisMonth: {
          orders: thisMonthOrders,
          revenue: thisMonthRevenue._sum.total || 0,
        },
        lastMonth: {
          orders: lastMonthOrders,
          revenue: lastMonthRevenue._sum.total || 0,
        },
        ordersByStatus: ordersByStatus.reduce((acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        }, {} as Record<string, number>),
        recentOrders: recentOrders.map((order) => ({
          id: order.id,
          customer: order.user.name,
          shop: order.shop.name,
          total: order.total,
          status: order.status,
          createdAt: order.createdAt,
        })),
        topProducts,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    next(error);
  }
};

// Get sales analytics for charts
export const getSalesAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { period = "7d" } = req.query; // 7d, 30d, 1y
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "7d":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "30d":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "1y":
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
    }

    // Get orders for the period
    const orders = await prisma.orders.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        total: true,
        createdAt: true,
        status: true,
      },
    });

    // Group by date
    const salesByDate = orders.reduce((acc, order) => {
      const date = order.createdAt.toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          revenue: 0,
          orders: 0,
          paid: 0,
          pending: 0,
          failed: 0,
        };
      }
      acc[date].revenue += order.total;
      acc[date].orders += 1;
      if (order.status === "Paid" || order.status === "Delivered") {
        acc[date].paid += 1;
      } else if (order.status === "Pending") {
        acc[date].pending += 1;
      } else {
        acc[date].failed += 1;
      }
      return acc;
    }, {} as Record<string, any>);

    const salesData = Object.values(salesByDate).sort((a: any, b: any) =>
      a.date.localeCompare(b.date)
    );

    res.status(200).json({
      success: true,
      data: salesData,
    });
  } catch (error) {
    console.error("Error fetching sales analytics:", error);
    next(error);
  }
};



// Get user analytics with device stats
export const getUserAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Fetch all user analytics records
    const userAnalyticsData = await prisma.userAnalytics.findMany({
      select: {
        device: true,
        country: true,
        city: true,
        createdAt: true,
      },
    });

    // --- DEVICE STATS ---
    const deviceStats: Record<string, number> = {};

    userAnalyticsData.forEach((record) => {
      if (record.device) {
        const deviceString = record.device.toLowerCase();
        let deviceType = "Desktop";

        if (
          deviceString.includes("mobile") ||
          deviceString.includes("phone") ||
          deviceString.includes("android") ||
          deviceString.includes("ios")
        ) {
          deviceType = "Phone";
        } else if (
          deviceString.includes("tablet") ||
          deviceString.includes("ipad")
        ) {
          deviceType = "Tablet";
        }

        deviceStats[deviceType] = (deviceStats[deviceType] || 0) + 1;
      }
    });

    const deviceData = Object.entries(deviceStats).map(([name, value]) => ({
      name,
      value,
    }));

    // Default if no records found
    if (deviceData.length === 0) {
      deviceData.push(
        { name: "Phone", value: 0 },
        { name: "Tablet", value: 0 },
        { name: "Desktop", value: 0 }
      );
    }

    // --- USER GROWTH BY DATE ---
    const usersByDate = userAnalyticsData.reduce((acc, record) => {
      const date = record.createdAt.toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const usersData = Object.entries(usersByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // --- RESPONSE ---
    res.status(200).json({
      success: true,
      data: {
        deviceStats: deviceData,
        userGrowth: usersData,
        totalRecords: userAnalyticsData.length,
      },
    });
  } catch (error) {
    console.error("Error fetching user analytics:", error);
    next(error);
  }
};


// Get product analytics
export const getProductAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [
      totalProducts,
      activeProducts,
      pendingProducts,
      productsByCategory,
      topSellingProducts,
    ] = await Promise.all([
      prisma.products.count({ where: { isDeleted: false } }),
      prisma.products.count({ where: { isDeleted: false, status: "Active" } }),
      prisma.products.count({ where: { isDeleted: false, status: "Pending" } }),
      prisma.products.groupBy({
        by: ["category"],
        where: { isDeleted: false },
        _count: { category: true },
      }),
      prisma.products.findMany({
        where: { isDeleted: false },
        take: 10,
        orderBy: { totalSales: "desc" },
        select: {
          id: true,
          title: true,
          category: true,
          totalSales: true,
          sale_price: true,
          stock: true,
          images: {
            select: { url: true },
            take: 1,
          },
          Shop: {
            select: { name: true },
          },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        activeProducts,
        pendingProducts,
        productsByCategory: productsByCategory.map((item) => ({
          category: item.category,
          count: item._count.category,
        })),
        topSellingProducts,
      },
    });
  } catch (error) {
    console.error("Error fetching product analytics:", error);
    next(error);
  }
};
