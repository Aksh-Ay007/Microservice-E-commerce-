import { NextFunction, Request, Response } from "express";
import prisma from "@packages/libs/prisma";
import { ForbiddenError } from "@packages/error-handler";

export const checkUserBlockedStatus = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return next();
    }

    const user = await prisma.users.findUnique({
      where: { id: req.user.id },
      select: { role: true, isDeleted: true }
    });

    if (!user) {
      return next(new ForbiddenError("User not found"));
    }

    if (user.role === 'banned' || user.isDeleted) {
      return res.status(403).json({
        success: false,
        message: "Your account has been banned. Please contact support for assistance.",
        isBlocked: true,
        reason: "account_banned"
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const checkSellerBlockedStatus = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.seller?.id) {
      return next();
    }

    const seller = await prisma.sellers.findUnique({
      where: { id: req.seller.id },
      select: { isDeleted: true, deletedAt: true }
    });

    if (!seller) {
      return next(new ForbiddenError("Seller not found"));
    }

    if (seller.isDeleted) {
      return res.status(403).json({
        success: false,
        message: "Your seller account has been banned. Please contact support for assistance.",
        isBlocked: true,
        reason: "seller_banned"
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};
