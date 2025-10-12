import prisma from "@packages/libs/prisma";
import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthError, ValidationError } from "../../../../packages/error-handler";
import { setCookie } from "../utills/cookies/setCookie";

export const loginAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return next(new ValidationError("Email and password are required"));
    }

    // Find admin user
    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      return next(new AuthError("User not found"));
    }

    // Verify password
    if (!user.password) {
      return next(new AuthError("Invalid email or password"));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new AuthError("Invalid email or password"));
    }

    // Check admin role
    if (user.role !== "admin") {
      return next(new AuthError("Access denied — not an admin user"));
    }

    // Clear any existing user/seller cookies
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { id: user.id, role: "admin" },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "45m" }
    );

    const refreshToken = jwt.sign(
      { id: user.id, role: "admin" },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "7d" }
    );

    // Store tokens in HTTP-only cookies
    setCookie(res, "access_token", accessToken);
    setCookie(res, "refresh_token", refreshToken);

    // Respond
    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
