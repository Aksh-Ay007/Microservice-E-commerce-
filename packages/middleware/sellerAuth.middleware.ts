import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "@packages/libs/prisma";

export const isSellerAuthenticated = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.cookies["seller_access_token"] ||
      req.cookies["access_token"] || // ✅ also allow admin token
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized! Token missing" });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
      id: string;
      role: string;
    };

    if (!decoded || !decoded.role) {
      return res
        .status(401)
        .json({ message: "Unauthorized! Invalid or missing role" });
    }

    // ✅ If seller
    if (decoded.role === "seller") {
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
    }

    // ✅ If admin — allow access too
    if (decoded.role === "admin") {
      const admin = await prisma.users.findUnique({
        where: { id: decoded.id, role: "admin" },
      });

      if (!admin) {
        return res.status(401).json({ message: "Admin not found" });
      }

      req.admin = admin;
      req.role = "admin";
      return next();
    }

    // ❌ Other roles (user, etc.)
    return res.status(403).json({ message: "Access denied for this role" });
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized! Token expired or invalid",
    });
  }
};
