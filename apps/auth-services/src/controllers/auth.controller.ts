import { NextFunction, Request, Response } from "express";
import {
  checkOtpRegistration,
  handleForgotPassword,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
  varifyForgotPasswordOtp,
  varifyOtp,
} from "../utils/auth.helper";
import { AuthError, ValidationError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma"; // Adjust the import path as necessary
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
import { setCookie } from "../utils/cookies/setCookie";


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

//varify user

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

//LoginUser

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

    if (!user) return next(new AuthError("User does not exists!"));

    const isMatch = await bcrypt.compare(password, user.password!);

    if (!isMatch) return next(new AuthError("invalid email or password"));

 const accessToken=jwt.sign({
  id: user.id,
  role: 'user'
}, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '15m' });


  const refreshToken=jwt.sign({
  id: user.id,
  role: 'user'
}, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: '7d' });


//we have to store the refresh and access token in an http secure cokkie

setCookie(res,'refresh_token',refreshToken)
setCookie(res,'access_token',accessToken)

res.status(200).json({
    message:"Login successfull!",
    user:{id:user.id,email:user.email,name:user.name}
})

  } catch (error) {
    return next(error);
  }
};


//forgotpassword

export const userForgotPassword=async(req:Request,res:Response,next:NextFunction)=>{

  await handleForgotPassword(req,res,next,'user')
}


//varify forgotpasswordOtp

export const verifyUserForgotPassword=async(req:Request,res:Response,next:NextFunction)=>{

  await varifyForgotPasswordOtp(req,res,next)

}


//resest password

export const resetUserPassword=async(req:Request,res:Response,next:NextFunction)=>{

  try {

    const {email,newPassword}=req.body

    if(!email||!newPassword){

      return next(new ValidationError('email and newPassword are required.!'))
    }

    const user=await prisma.users.findUnique({where:{email}})

    if(!user)return next(new ValidationError('user not found.!'))

      const isSamePassword=await bcrypt.compare(newPassword,user.password!)

      if(isSamePassword){

        return next(new ValidationError('new password cannot be the same as the old password'))
      }


      const hashPassword=await bcrypt.hash(newPassword,10)

      await prisma.users.update(
        {
          where:{email},
          data:{password:hashPassword}
        }
      )


      res.status(200).json({message:'password reset successfully.!'})
    
  } catch (error) {
    
    next(error)
  }
}