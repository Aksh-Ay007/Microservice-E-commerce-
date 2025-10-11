import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../../packages/libs/prisma";

export const isSellerAuthenticated = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.cookies["seller_access_token"] ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized! Token missing" });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
      id: string;
      role: string;
    };

    if (!decoded || decoded.role !== "seller") {
      return res
        .status(401)
        .json({ message: "Unauthorized! Invalid seller token" });
    }

    const seller = await prisma.sellers.findUnique({
      where: { id: decoded.id },
      include: { shop: true },
    });

    if (!seller) {
      return res.status(401).json({ message: "Seller not found" });
    }

    req.seller = seller;
    req.role = "seller";

    return next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized! Token expired or invalid",
    });
  }
};
