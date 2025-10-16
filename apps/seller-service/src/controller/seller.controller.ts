import prisma from "@packages/libs/prisma"; // Adjust the import path as necessary
import bcrypt from "bcryptjs";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import Stripe from "stripe";
import { AuthError, NotFoundError, ValidationError } from "../../../../packages/error-handler";
import { setCookie } from "../utills/cookies/setCookie";
import {
  checkOtpRegistration,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
  varifyOtp,
} from "./../utills/sellerAuth.helper";

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

import { NextFunction, Request, Response } from "express";

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

export const getSeller = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const seller = req.seller;

    res.status(200).json({
      success: true,
      seller,
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





// get seller details by shop id
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

    return res.status(200).json({ shop, followersCount });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// 2. GET SELLER PRODUCTS (with pagination)
// ============================================================
export const getSellerProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shopId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!shopId) {
      return next(new ValidationError("Shop ID is required"));
    }

    // Verify shop exists
    const shop = await prisma.shops.findUnique({
      where: { id: shopId },
    });

    if (!shop) {
      return next(new NotFoundError("Shop not found"));
    }

    const skip = (page - 1) * limit;

    // Get products for the shop (exclude events - products without dates)
    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: {
          shopId: shopId,
          isDeleted: false,
          status: "Active",
          starting_date: null, // Only regular products, not events
          ending_date: null,
        },
        include: {
          images: true,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.products.count({
        where: {
          shopId: shopId,
          isDeleted: false,
          status: "Active",
          starting_date: null,
          ending_date: null,
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// 3. GET SELLER EVENTS (with pagination)
// ============================================================
export const getSellerEvents = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shopId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!shopId) {
      return next(new ValidationError("Shop ID is required"));
    }

    // Verify shop exists
    const shop = await prisma.shops.findUnique({
      where: { id: shopId },
    });

    if (!shop) {
      return next(new NotFoundError("Shop not found"));
    }

    const skip = (page - 1) * limit;

    // Get events (products with start and end dates) for the shop
    const [events, total] = await Promise.all([
      prisma.products.findMany({
        where: {
          shopId: shopId,
          isDeleted: false,
          status: "Active",
          starting_date: { not: null },
          ending_date: { not: null },
        },
        include: {
          images: true,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.products.count({
        where: {
          shopId: shopId,
          isDeleted: false,
          status: "Active",
          starting_date: { not: null },
          ending_date: { not: null },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      products: events, // Return as 'products' to match frontend expectation
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// 4. CHECK IF USER IS FOLLOWING SHOP
// ============================================================
export const isFollowingShop = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shopId } = req.params;
    const userId = req.user?.id;

    if (!shopId) {
      return next(new ValidationError("Shop ID is required"));
    }

    if (!userId) {
      // Return not following if not authenticated
      return res.status(200).json({
        success: true,
        isFollowing: false,
        followRecord: null,
      });
    }

    // Verify shop exists
    const shop = await prisma.shops.findUnique({
      where: { id: shopId },
    });

    if (!shop) {
      return next(new NotFoundError("Shop not found"));
    }

    // Check if user is following the shop
    const followRecord = await prisma.followers.findUnique({
      where: {
        userId_shopsId: {
          userId,
          shopsId: shopId,
        },
      },
    });

    res.status(200).json({
      success: true,
      isFollowing: !!followRecord,
      followRecord: followRecord || null,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// 5. FOLLOW SHOP
// ============================================================
export const followShop = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shopId } = req.body;
    const userId = req.user?.id;

    if (!shopId) {
      return next(new ValidationError("Shop ID is required"));
    }

    if (!userId) {
      return next(new AuthError("User not authenticated"));
    }

    // Verify shop exists
    const shop = await prisma.shops.findUnique({
      where: { id: shopId },
    });

    if (!shop) {
      return next(new NotFoundError("Shop not found"));
    }

    // Check if already following
    const existingFollow = await prisma.followers.findUnique({
      where: {
        userId_shopsId: {
          userId,
          shopsId: shopId,
        },
      },
    });

    if (existingFollow) {
      return next(new ValidationError("You are already following this shop"));
    }

    // Create follow record
    const newFollow = await prisma.followers.create({
      data: {
        userId,
        shopsId: shopId,
      },
    });

    res.status(201).json({
      success: true,
      message: "Successfully followed the shop",
      follow: newFollow,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// 6. UNFOLLOW SHOP
// ============================================================
export const unfollowShop = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shopId } = req.body;
    const userId = req.user?.id;

    if (!shopId) {
      return next(new ValidationError("Shop ID is required"));
    }

    if (!userId) {
      return next(new AuthError("User not authenticated"));
    }

    // Verify shop exists
    const shop = await prisma.shops.findUnique({
      where: { id: shopId },
    });

    if (!shop) {
      return next(new NotFoundError("Shop not found"));
    }

    // Check if follow record exists
    const followRecord = await prisma.followers.findUnique({
      where: {
        userId_shopsId: {
          userId,
          shopsId: shopId,
        },
      },
    });

    if (!followRecord) {
      return next(new ValidationError("You are not following this shop"));
    }

    // Delete follow record
    await prisma.followers.delete({
      where: {
        userId_shopsId: {
          userId,
          shopsId: shopId,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Successfully unfollowed the shop",
    });
  } catch (error) {
    next(error);
  }
};
