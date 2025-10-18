import prisma from "@packages/libs/prisma"; // Adjust the import path as necessary
import bcrypt from "bcryptjs";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import Stripe from "stripe";
import {
  AuthError,
  NotFoundError,
  ValidationError,
} from "../../../../packages/error-handler";
import { setCookie } from "../utills/cookies/setCookie";
import {
  checkOtpRegistration,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
  varifyOtp,
} from "./../utills/sellerAuth.helper";

import { NextFunction, Request, Response } from "express";
import { imagekit } from "../../../../packages/libs/imagekit";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

// 2. Fix refreshToken controller - inconsistent cookie handling
export const refreshToken = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken =
      req.cookies["refresh_token"] || req.cookies["seller_refresh_token"];

    if (!refreshToken) {
      return next(new ValidationError("Unauthorized: No refresh token."));
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as { id: string; role: string };

    if (!decoded || !decoded.id || !decoded.role) {
      return next(new JsonWebTokenError("Forbidden! Invalid refresh token."));
    }

    let account;

    if (decoded.role === "user") {
      account = await prisma.users.findUnique({
        where: { id: decoded.id },
      });
    } else if (decoded.role === "seller") {
      account = await prisma.sellers.findUnique({
        where: { id: decoded.id },
        include: {
          shop: true,
        },
      });
    }

    if (!account) {
      return next(new AuthError("Forbidden! User/Seller not found"));
    }

    const newAccessToken = jwt.sign(
      {
        id: decoded.id,
        role: decoded.role,
      },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" }
    );

    // Generate new refresh token as well for security
    const newRefreshToken = jwt.sign(
      {
        id: decoded.id,
        role: decoded.role,
      },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "7d" }
    );

    // Set cookies based on role
    if (decoded.role === "user") {
      setCookie(res, "access_token", newAccessToken);
      setCookie(res, "refresh_token", newRefreshToken);
    } else if (decoded.role === "seller") {
      setCookie(res, "seller_access_token", newAccessToken);
      setCookie(res, "seller_refresh_token", newRefreshToken);
    }

    req.role = decoded.role;

    return res.status(200).json({ success: true });
  } catch (error) {
    return next(error);
  }
};

//register a new Seller

export const registerSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, "seller");

    const { name, email } = req.body;

    const exisitingSeller = await prisma.sellers.findUnique({
      where: { email },
    });

    if (exisitingSeller) {
      throw new ValidationError("Seller already exisits with this email!");
    }

    await checkOtpRegistration(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(name, email, "seller-activation");

    res
      .status(200)
      .json({ message: "OTP sent to email..please verify your account" });
  } catch (error) {
    next(error);
  }
};

//verify seller with otp

export const verifySeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password, name, phone_number, country } = req.body;

    if (!email || !otp || !password || !name || !phone_number || !country) {
      return next(new ValidationError("all fields are required"));
    }

    const exisitingSeller = await prisma.sellers.findUnique({
      where: { email },
    });

    if (exisitingSeller) {
      return next(
        new ValidationError("Seller already exisits with this email!")
      );
    }

    await varifyOtp(email, otp, next);
    const hashedPassword = await bcrypt.hash(password, 10);

    const seller = await prisma.sellers.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone_number,
        country,
      },
    });

    res
      .status(201)
      .json({ seller, message: "Seller registered successfully!" });
  } catch (error) {
    next(error);
  }
};

//creating a new shop

export const createShop = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, bio, address, opening_hours, website, category, sellerId } =
      req.body;

    if (
      !name ||
      !bio ||
      !address ||
      !opening_hours ||
      !website ||
      !category ||
      !sellerId
    ) {
      return next(new ValidationError("all fields are required"));
    }
    const shopData = {
      name,
      bio,
      address,
      opening_hours,
      website,
      category,
      sellerId,
    };

    if (website && website.trim() !== "") {
      shopData.website = website;
    }

    const shop = await prisma.shops.create({
      data: shopData,
    });

    res.status(201).json({
      success: true,
      shop,
    });
  } catch (error) {
    next(error);
  }
};

//create stripe connect account link

export const createStripeConnectLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sellerId } = req.body;

    if (!sellerId) {
      return next(new ValidationError("seller id is required.."));
    }
    const seller = await prisma.sellers.findUnique({
      where: {
        id: sellerId,
      },
    });

    if (!seller) {
      return next(new ValidationError("Seller is not availbale with this id"));
    }

    const account = await stripe.accounts.create({
      type: "express",
      email: seller?.email,
      country: "GB",
      capabilities: {
        card_payments: {
          requested: true,
        },
        transfers: {
          requested: true,
        },
      },
    });

    await prisma.sellers.update({
      where: {
        id: sellerId,
      },
      data: {
        stripeId: account.id,
      },
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `http://localhost:3000/success`,
      return_url: `http://localhost:3000/success`,
      type: "account_onboarding",
    });

    res.status(201).json({
      success: true,
      account,
      url: accountLink.url,
    });
  } catch (error) {
    return next(error);
  }
};

//login seller

export const loginSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ValidationError("Email and password are required..!"));
    }

    const seller = await prisma.sellers.findUnique({ where: { email } });

    if (!seller) {
      return next(new AuthError("seller does not exists!"));
    }

    const isMatch = await bcrypt.compare(password, seller.password!);

    if (!isMatch) {
      return next(new AuthError("invalid email or password"));
    }

    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    const accessToken = jwt.sign(
      {
        id: seller.id.toString(),
        role: "seller",
      },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      {
        id: seller.id,
        role: "seller",
      },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "7d" }
    );

    //we have to store the refresh and access token in an http secure cokkie

    setCookie(res, "seller_refresh_token", refreshToken);
    setCookie(res, "seller_access_token", accessToken);

    res.status(200).json({
      message: "Login successfull!",
      user: { id: seller.id, email: seller.email, name: seller.name },
    });
  } catch (error) {
    return next(error);
  }
};

//get logged in Seller

// Update getSeller to include shop with avatar and banner
export const getSeller = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const seller = req.seller;

    // Fetch seller with shop and images
    const sellerWithShop = await prisma.sellers.findUnique({
      where: { id: seller.id },
      include: {
        shop: {
          include: {
            avatar: true,
            coverBanner: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      seller: sellerWithShop,
    });
  } catch (error) {
    next(error);
  }
};

//logout seller

export const logOutSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.clearCookie("seller_access_token");
  res.clearCookie("seller_refresh_token");
  res.status(200).json({ message: "Logged out successfully" });
};

// get seller products by shop id (public)
export const getSellerProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params as { id?: string };
    const page = parseInt(String(req.query.page || "1"));
    const limit = parseInt(String(req.query.limit || "10"));

    if (!id) {
      return next(new ValidationError("shop id is required"));
    }

    const skip = (page - 1) * limit;

    const baseFilter: any = {
      shopId: id,
      isDeleted: false,
      status: "Active",
    };

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: baseFilter,
        include: { images: true, Shop: true },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.products.count({ where: baseFilter }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      products,
      pagination: { total, page, totalPages },
    });
  } catch (error) {
    next(error);
  }
};

// get seller events by shop id (public)
export const getSellerEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params as { id?: string };
    const page = parseInt(String(req.query.page || "1"));
    const limit = parseInt(String(req.query.limit || "10"));

    if (!id) {
      return next(new ValidationError("shop id is required"));
    }

    const skip = (page - 1) * limit;

    const filters: any = {
      shopId: id,
      starting_date: { not: null },
      ending_date: { not: null },
      isDeleted: false,
      status: "Active",
    };

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: filters,
        include: { images: true, Shop: true },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.products.count({ where: filters }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      products,
      pagination: { total, page, totalPages },
    });
  } catch (error) {
    next(error);
  }
};

// check if current user is following a shop
export const isFollowingShop = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params as { id?: string };
    const userId = req.user?.id;

    if (!id) {
      return next(new ValidationError("shop id is required"));
    }

    if (!userId) {
      return next(new AuthError("Unauthorized access"));
    }

    const followRecord = await prisma.followers.findFirst({
      where: { userId, shopsId: id },
    });

    // Keep shape compatible with frontend usage: `res.data.isFollowing !== null`
    return res.status(200).json({ isFollowing: followRecord || null });
  } catch (error) {
    next(error);
  }
};

// follow a shop
export const followShop = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shopId } = req.body as { shopId?: string };
    const userId = req.user?.id;

    if (!shopId) {
      return next(new ValidationError("shopId is required"));
    }
    if (!userId) {
      return next(new AuthError("Unauthorized access"));
    }

    // Ensure shop exists
    const shop = await prisma.shops.findUnique({ where: { id: shopId } });
    if (!shop) {
      return next(new NotFoundError("Shop not found"));
    }

    const existing = await prisma.followers.findFirst({
      where: { userId, shopsId: shopId },
    });
    if (existing) {
      return res
        .status(200)
        .json({ success: true, message: "Already following" });
    }

    await prisma.followers.create({
      data: { userId, shopsId: shopId },
    });

    return res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
};

// unfollow a shop
export const unfollowShop = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shopId } = req.body as { shopId?: string };
    const userId = req.user?.id;

    if (!shopId) {
      return next(new ValidationError("shopId is required"));
    }
    if (!userId) {
      return next(new AuthError("Unauthorized access"));
    }

    const existing = await prisma.followers.findFirst({
      where: { userId, shopsId: shopId },
      select: { id: true },
    });

    if (!existing) {
      return res.status(200).json({ success: true, message: "Not following" });
    }

    await prisma.followers.delete({ where: { id: existing.id } });

    return res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

// Add these functions to your seller.controller.ts

// Update seller avatar
export const updateSellerAvatar = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("🚀 Starting seller avatar upload...");
    console.log("Request body:", req.body);
    console.log("Seller from request:", req.seller);

    const sellerId = req.seller?.id;
    const { fileName } = req.body;

    if (!sellerId) {
      console.log("❌ No seller ID found");
      return res.status(401).json({ error: "Seller not authenticated" });
    }

    if (!fileName) {
      console.log("❌ No fileName provided");
      return res
        .status(400)
        .json({ error: "File name (Base64 image) is required" });
    }

    console.log("✅ Seller authenticated, proceeding with upload...");

    // Upload to ImageKit
    console.log("📤 Uploading to ImageKit...");
    const uploadResponse = await imagekit.upload({
      file: fileName,
      fileName: `seller-avatar-${sellerId}-${Date.now()}.jpg`,
      folder: "/seller-avatars",
    });

    console.log("✅ ImageKit upload successful:", uploadResponse);

    // Find existing seller
    console.log("🔍 Finding existing seller...");
    const existingSeller = await prisma.sellers.findUnique({
      where: { id: sellerId },
      select: { id: true, shop: { select: { avatarId: true } } },
    });

    console.log("✅ Seller found:", existingSeller);

    // Delete old avatar if exists
    if (existingSeller?.shop?.avatarId) {
      console.log("🗑️ Deleting old avatar...");
      try {
        const oldImage = await prisma.images.findUnique({
          where: { id: existingSeller.shop.avatarId },
        });
        if (oldImage?.file_id) {
          await imagekit.deleteFile(oldImage.file_id);
          console.log("✅ Old image deleted from ImageKit");
        }
        await prisma.images.delete({
          where: { id: existingSeller.shop.avatarId },
        });
        console.log("✅ Old image deleted from database");
      } catch (err) {
        console.warn("⚠️ Old avatar cleanup failed:", err);
      }
    }

    // Create new image record
    console.log("💾 Creating new image record...");
    const newImage = await prisma.images.create({
      data: {
        file_id: uploadResponse.fileId,
        url: uploadResponse.url,
        type: "avatar",
      },
    });

    console.log("✅ New image created:", newImage);

    // Update shop's avatarId
    console.log("🔄 Updating shop's avatarId...");
    await prisma.shops.update({
      where: { sellerId: sellerId },
      data: { avatarId: newImage.id },
    });

    console.log("✅ Shop updated successfully");

    return res.status(200).json({
      success: true,
      message: "Avatar updated successfully",
      avatarUrl: uploadResponse.url,
    });
  } catch (error: any) {
    console.error("❌ updateSellerAvatar error:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    return res.status(500).json({
      error: "Avatar upload failed",
      message: error.message,
      details: error.toString(),
    });
  }
};

// Update seller banner
export const updateSellerBanner = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("🚀 Starting seller banner upload...");
    console.log("Request body:", req.body);
    console.log("Seller from request:", req.seller);

    const sellerId = req.seller?.id;
    const { fileName } = req.body;

    if (!sellerId) {
      console.log("❌ No seller ID found");
      return res.status(401).json({ error: "Seller not authenticated" });
    }

    if (!fileName) {
      console.log("❌ No fileName provided");
      return res
        .status(400)
        .json({ error: "File name (Base64 image) is required" });
    }

    console.log("✅ Seller authenticated, proceeding with upload...");

    // Upload to ImageKit
    console.log("📤 Uploading to ImageKit...");
    const uploadResponse = await imagekit.upload({
      file: fileName,
      fileName: `seller-banner-${sellerId}-${Date.now()}.jpg`,
      folder: "/seller-banners",
    });

    console.log("✅ ImageKit upload successful:", uploadResponse);

    // Find existing seller
    console.log("🔍 Finding existing seller...");
    const existingSeller = await prisma.sellers.findUnique({
      where: { id: sellerId },
      select: { id: true, shop: { select: { bannerId: true } } },
    });

    console.log("✅ Seller found:", existingSeller);

    // Delete old banner if exists
    if (existingSeller?.shop?.bannerId) {
      console.log("🗑️ Deleting old banner...");
      try {
        const oldImage = await prisma.images.findUnique({
          where: { id: existingSeller.shop.bannerId },
        });
        if (oldImage?.file_id) {
          await imagekit.deleteFile(oldImage.file_id);
          console.log("✅ Old image deleted from ImageKit");
        }
        await prisma.images.delete({
          where: { id: existingSeller.shop.bannerId },
        });
        console.log("✅ Old image deleted from database");
      } catch (err) {
        console.warn("⚠️ Old banner cleanup failed:", err);
      }
    }

    // Create new image record
    console.log("💾 Creating new image record...");
    const newImage = await prisma.images.create({
      data: {
        file_id: uploadResponse.fileId,
        url: uploadResponse.url,
        type: "banner",
      },
    });

    console.log("✅ New image created:", newImage);

    // Update shop's bannerId
    console.log("🔄 Updating shop's bannerId...");
    await prisma.shops.update({
      where: { sellerId: sellerId },
      data: { bannerId: newImage.id },
    });

    console.log("✅ Shop updated successfully");

    return res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      bannerUrl: uploadResponse.url,
    });
  } catch (error: any) {
    console.error("❌ updateSellerBanner error:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    return res.status(500).json({
      error: "Banner upload failed",
      message: error.message,
      details: error.toString(),
    });
  }
};

export const updateSellerProfile = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller?.id;
    const {
      name,
      email,
      phone_number,
      country,
      bio,
      address,
      opening_hours,
      website,
      category,
    } = req.body;

    if (!sellerId) {
      return res.status(401).json({ error: "Seller not authenticated" });
    }

    // Update seller info
    const updatedSeller = await prisma.sellers.update({
      where: { id: sellerId },
      data: {
        name: name || undefined,
        email: email || undefined,
        phone_number: phone_number || undefined,
        country: country || undefined,
      },
    });

    // Update shop info
    await prisma.shops.update({
      where: { sellerId: sellerId },
      data: {
        bio: bio || undefined,
        address: address || undefined,
        opening_hours: opening_hours || undefined,
        website: website || undefined,
        category: category || undefined,
      },
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      seller: updatedSeller,
    });
  } catch (error: any) {
    console.error("❌ updateSellerProfile error:", error);
    return next(error);
  }
};

export const getSellerDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params as { id?: string };

    if (!id) {
      return next(new ValidationError("shop id is required"));
    }

    const shop = await prisma.shops.findUnique({
      where: { id },
      include: {
        // ✅ Include avatar and coverBanner relations
        avatar: true,
        coverBanner: true,
        sellers: {
          select: {
            id: true,
            name: true,
            email: true,
            phone_number: true,
            country: true,
            stripeId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!shop) {
      return next(new NotFoundError("Shop not found"));
    }

    const followersCount = await prisma.followers.count({
      where: { shopsId: id },
    });

    // ✅ Return the shop with proper structure
    return res.status(200).json({
      shop,
      followersCount,
      // ✅ Add direct access for convenience
      avatarUrl: shop.avatar?.url || null,
      bannerUrl: shop.coverBanner?.url || null,
    });
  } catch (error) {
    next(error);
  }
};

//fetching notification with pagination and filters
export const sellerNotification = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller.id;
    const { page = 1, limit = 10, status, type, priority, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { receiverId: sellerId };
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

    res.status(200).json({
      success: true,
      notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get seller notification statistics
export const getSellerNotificationStats = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller.id;

    const [total, unread, byType, byPriority] = await Promise.all([
      prisma.notifications.count({ where: { receiverId: sellerId } }),
      prisma.notifications.count({ 
        where: { receiverId: sellerId, status: "Unread" } 
      }),
      prisma.notifications.groupBy({
        by: ["type"],
        where: { receiverId: sellerId },
        _count: { type: true },
      }),
      prisma.notifications.groupBy({
        by: ["priority"],
        where: { receiverId: sellerId },
        _count: { priority: true },
      }),
    ]);

    res.json({
      success: true,
      total,
      unread,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = item._count.type;
        return acc;
      }, {} as any),
      byPriority: byPriority.reduce((acc, item) => {
        acc[item.priority] = item._count.priority;
        return acc;
      }, {} as any),
    });
  } catch (error) {
    console.error("Error fetching seller notification stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notification statistics",
    });
  }
};

// Mark seller notification as read
export const markSellerNotificationAsRead = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const sellerId = req.seller.id;

    const notification = await prisma.notifications.findFirst({
      where: { id, receiverId: sellerId },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    const updatedNotification = await prisma.notifications.update({
      where: { id },
      data: { status: "Read" },
    });

    res.json({ success: true, data: updatedNotification });
  } catch (error) {
    console.error("Error marking seller notification as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
    });
  }
};

// Delete seller notification
export const deleteSellerNotification = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const sellerId = req.seller.id;

    const notification = await prisma.notifications.findFirst({
      where: { id, receiverId: sellerId },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    await prisma.notifications.delete({
      where: { id },
    });

    res.json({ success: true, message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting seller notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
    });
  }
};

// Mark all seller notifications as read
export const markAllSellerNotificationsAsRead = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller.id;

    await prisma.notifications.updateMany({
      where: { receiverId: sellerId, status: "Unread" },
      data: { status: "Read" },
    });

    res.json({ 
      success: true, 
      message: "All notifications marked as read" 
    });
  } catch (error) {
    console.error("Error marking all seller notifications as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
    });
  }
};