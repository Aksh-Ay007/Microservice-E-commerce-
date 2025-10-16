import {
  AuthError,
  NotFoundError,
  ValidationError,
} from "@packages/error-handler";
import { imagekit } from "@packages/libs/imagekit"; // adjust if path differs
import prisma from "@packages/libs/prisma";
import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import {
  checkOtpRegistration,
  handleForgotPassword,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
  varifyForgotPasswordOtp,
  varifyOtp,
} from "../utils/auth.helper";
import { setCookie } from "../utils/cookies/setCookie";

// user registration
export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, "user");

    const { name, email } = req.body;

    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return next(new ValidationError("User with this email already exists"));
    }

    await checkOtpRegistration(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(name, email, "user-activation-mail");

    res.status(200).json({
      message: "OTP sent please varify your account",
    });
  } catch (error) {
    return next(error);
  }
};

// verify user
export const varifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password, name } = req.body;

    if (!email || !otp || !password || !name) {
      return next(new ValidationError("all fields are required"));
    }

    const existingUser = await prisma.users.findUnique({ where: { email } });

    if (existingUser) {
      return next(new ValidationError("user already exist with this email.."));
    }

    await varifyOtp(email, otp, next);

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.users.create({
      data: { name, email, password: hashedPassword },
    });

    res.status(201).json({
      success: true,
      message: "User registered Successfully!",
    });
  } catch (error) {
    return next(error);
  }
};

// login user
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ValidationError("Email and password are required..!"));
    }

    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      return next(new AuthError("User does not exists!"));
    }

    const isMatch = await bcrypt.compare(password, user.password!);

    if (!isMatch) {
      return next(new AuthError("invalid email or password"));
    }

    // clear any old tokens (user only)
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    const accessToken = jwt.sign(
      { id: user.id.toString(), role: "user" },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "7d" }
    );

    setCookie(res, "access_token", accessToken);
    setCookie(res, "refresh_token", refreshToken);

    res.status(200).json({
      message: "Login successfull!",
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    return next(error);
  }
};

// logout user
export const logOutUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  res.status(200).json({ message: "Logged out successfully" });
};

// refresh token
export const refreshToken = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies["refresh_token"];

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

    if (decoded.role !== "user") {
      return next(new AuthError("Invalid token role for this service"));
    }

    const account = await prisma.users.findUnique({
      where: { id: decoded.id },
    });

    if (!account) {
      return next(new AuthError("Forbidden! User not found"));
    }

    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" }
    );

    const newRefreshToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "7d" }
    );

    setCookie(res, "access_token", newAccessToken);
    setCookie(res, "refresh_token", newRefreshToken);

    req.role = decoded.role;

    return res.status(200).json({ success: true });
  } catch (error) {
    return next(error);
  }
};

// get logged in user
export const getUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = req.user;

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// forgot password
export const userForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await handleForgotPassword(req, res, next, "user");
};

// verify forgot password OTP
export const verifyUserForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await varifyForgotPasswordOtp(req, res, next);
};

// reset password
export const resetUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return next(new ValidationError("email and newPassword are required.!"));
    }

    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      return next(new ValidationError("user not found.!"));
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password!);

    if (isSamePassword) {
      return next(
        new ValidationError(
          "new password cannot be the same as the old password"
        )
      );
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);

    await prisma.users.update({
      where: { email },
      data: { password: hashPassword },
    });

    res.status(200).json({ message: "password reset successfully.!" });
  } catch (error) {
    next(error);
  }
};

// change password
export const updateUserPassword = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return next(new ValidationError("all fields are required"));
    }

    if (newPassword !== confirmPassword) {
      return next(
        new ValidationError("new password and confirm password must be same")
      );
    }

    if (currentPassword === newPassword) {
      return next(
        new ValidationError("current password and new password cannot be same")
      );
    }

    const user = await prisma.users.findUnique({ where: { id: userId } });

    if (!user) {
      return next(new ValidationError("user not found"));
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password!);

    if (!isMatch) {
      return next(new ValidationError("current password is incorrect"));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.users.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: "password updated successfully" });
  } catch (error) {
    next(error);
  }
};

// add new address
export const addUserAddress = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { label, name, street, city, zip, country, isDefault } = req.body;

    if (!label || !name || !street || !city || !zip || !country) {
      return next(new ValidationError("all fields are required"));
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId,
        label,
        name,
        street,
        city,
        zip,
        country,
        isDefault,
      },
    });

    res
      .status(201)
      .json({ message: "Address added successfully", address: newAddress });
  } catch (error) {
    next(error);
  }
};

// delete user address
export const deleteUserAddress = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { addressId } = req.params;

    if (!addressId) {
      return next(new ValidationError("address id is required"));
    }

    const existingAddress = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!existingAddress) {
      return next(new NotFoundError("address not found"));
    }

    await prisma.address.delete({
      where: { id: addressId },
    });

    res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// get user addresses
export const getUserAddress = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ suceess: true, addresses });
  } catch (error) {
    next(error);
  }
};

export const updateUserAvatar = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { fileName } = req.body;

    console.log("📝 Update avatar request:", { userId, hasFile: !!fileName });

    if (!userId) {
      throw new ValidationError("User not authenticated");
    }

    if (!fileName) {
      throw new ValidationError("File name (Base64 image) is required");
    }

    // ✅ Upload to ImageKit
    console.log("📤 Uploading to ImageKit...");
    const uploadResponse = await imagekit.upload({
      file: fileName,
      fileName: `avatar-${userId}-${Date.now()}.jpg`,
      folder: "/avatars",
    });
    console.log("✅ ImageKit upload success:", uploadResponse.fileId);

    // ✅ Find existing user
    console.log("🔍 Finding user...");
    const existingUser = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        imagesId: true,
      },
    });
    console.log("👤 User found:", { userId, imagesId: existingUser?.imagesId });

    // ✅ Delete old avatar if exists
    if (existingUser?.imagesId) {
      try {
        console.log("🗑️ Deleting old avatar...");

        // Get old image details
        const oldImage = await prisma.images.findUnique({
          where: { id: existingUser.imagesId },
        });

        if (oldImage?.file_id) {
          // Delete from ImageKit
          await imagekit.deleteFile(oldImage.file_id);
          console.log("✅ Deleted from ImageKit:", oldImage.file_id);
        }

        // Delete from database
        await prisma.images.delete({
          where: { id: existingUser.imagesId },
        });
        console.log("✅ Deleted from database");
      } catch (err: any) {
        console.warn("⚠️ Old avatar cleanup failed:", err.message);
        // Continue even if cleanup fails
      }
    }

    // ✅ Create new image record
    console.log("💾 Creating new image record...");
    const newImage = await prisma.images.create({
      data: {
        file_id: uploadResponse.fileId,
        url: uploadResponse.url,
        type: "avatar",
      },
    });
    console.log("✅ Image record created:", newImage.id);

    // ✅ Update user's imagesId
    console.log("🔄 Updating user...");
    await prisma.users.update({
      where: { id: userId },
      data: { imagesId: newImage.id },
    });
    console.log("✅ User updated successfully");

    return res.status(200).json({
      success: true,
      message: "Avatar updated successfully",
      avatarUrl: uploadResponse.url,
    });
  } catch (error: any) {
    console.error("❌ updateUserAvatar error:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return next(error);
  }
};




// Create first admin (one-time setup)
export const createFirstAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if any admin exists
    const existingAdmin = await prisma.users.findFirst({
      where: { role: "admin" },
    });

    if (existingAdmin) {
      return next(new ValidationError("Admin already exists"));
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(new ValidationError("All fields are required"));
    }

    // Check if email is already in use
    const existingUser = await prisma.users.findUnique({ where: { email } });

    if (existingUser) {
      return next(new ValidationError("Email already in use"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "admin",
      },
    });

    res.status(201).json({
      success: true,
      message: "First admin created successfully",
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Admin login
export const loginAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ValidationError("Email and password are required"));
    }

    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      return next(new AuthError("User not found"));
    }

    if (!user.password) {
      return next(new AuthError("Invalid email or password"));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new AuthError("Invalid email or password"));
    }

    if (user.role !== "admin") {
      return next(new AuthError("Access denied — not an admin user"));
    }

    // Clear any existing cookies
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

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

    setCookie(res, "access_token", accessToken);
    setCookie(res, "refresh_token", refreshToken);

    res.status(200).json({
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

// Admin logout
export const logOutAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  res.status(200).json({ message: "Admin logged out successfully" });
};




// get logged in user
export const getAdmin = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = req.admin;

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};
