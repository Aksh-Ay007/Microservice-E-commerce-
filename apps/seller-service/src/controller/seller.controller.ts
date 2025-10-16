import prisma from "@packages/libs/prisma"; // Adjust the import path as necessary
import bcrypt from "bcryptjs";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import Stripe from "stripe";
import { AuthError, ValidationError, NotFoundError } from "../../../../packages/error-handler";
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
