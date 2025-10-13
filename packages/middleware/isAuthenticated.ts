import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../../packages/libs/prisma";

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies["access_token"] || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized! Token missing" });
    }

    // Decode JWT
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
      id: string;
      role: "user" | "admin";
    };

    if (!decoded || !decoded.role) {
      return res
        .status(401)
        .json({ message: "Unauthorized! Invalid or missing role" });
    }

    // Check role and fetch corresponding user/admin
    if (decoded.role === "user") {
      const user = await prisma.users.findUnique({ where: { id: decoded.id } });
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      req.user = user;
      req.role = "user";
    } else if (decoded.role === "admin") {
      const admin = await prisma.users.findUnique({
        where: { id: decoded.id, role: "admin" },
      });
      if (!admin) {
        return res.status(401).json({ message: "Admin not found" });
      }
      req.admin = admin;
      req.role = "admin";
    } else {
      return res.status(401).json({ message: "Unauthorized role" });
    }

    return next(); // ✅ Proceed if authenticated
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized! Token expired or invalid",
    });
  }
};

export default isAuthenticated;
