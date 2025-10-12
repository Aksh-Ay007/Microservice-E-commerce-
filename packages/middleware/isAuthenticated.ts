import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../../packages/libs/prisma";

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
  try {
    // Only check user access token
    const token =
      req.cookies["access_token"] || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized! Token missing" });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
      id: string;
      role: "user";
    };

    if (!decoded || decoded.role !== "user") {
      return res
        .status(401)
        .json({ message: "Unauthorized! Invalid user token" });
    }

    const user = await prisma.users.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    req.role = "user";
    return next(); // ✅ Added return statement
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized! Token expired or invalid",
    });
  }
};

export default isAuthenticated;
