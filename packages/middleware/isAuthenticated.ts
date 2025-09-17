import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "@packages/libs/prisma";

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies.access_token || req.headers.authorization?.split(" ")[1];


    if (!token) {
      return res.status(401).json({ message: "Unauthorized - Token Missing" });
    }

    // Verify the token
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as {
      id: string;
      role: "user" | "seller";
    };


    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    // Find the user account
    const account = await prisma.users.findUnique({
      where: { id: decoded.id },
    });

    // Attach user to request
    req.user = account;

    if (!account) {
      return res.status(401).json({ message: "Account not found" });
    }


    return next();
  } catch (error) {

    return res.status(401).json({
      message: "Unauthorized - Authentication failed",
    });
  }
};

export default isAuthenticated;
