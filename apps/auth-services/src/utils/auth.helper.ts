import crypto from "crypto";

import { ValidationError } from "@packages/error-handler";
import { NextFunction, Request, Response } from "express";
import redis from "@packages/libs/redis";
import { sendEmail } from "./sendMail";
import prisma from "@packages/libs/prisma"; // Adjust the import path as necessary


export const validateRegistrationData = (
  data: any,
  userType: "user" | "seller"
) => {
  const { name, password, email, phone_number, country } = data;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (
   !name ||
    !email ||
    !password ||
    (userType === "seller" && (!phone_number || !country))
  ) {
    throw new ValidationError("All fields are required");
  }

  if (!emailRegex.test(email)) {
    throw new ValidationError("Invalid email format");
  }
};

//use redis here
export const checkOtpRegistration = async (
  email: string,
  next: NextFunction
) => {
  if (await redis.get(`otp_lock:${email}`)) {
    return next(
      new ValidationError(
        "your account is locked due to too many attempts please try again later"
      )
    );
  }

  if (await redis.get(`otp_spam_lock:${email}`)) {
    return next(
      new ValidationError(
        "too many requests please wait 1 hour before trying again"
      )
    );
  }

  if (await redis.get(`otp_cooldown:${email}`)) {
    return next(new ValidationError("Please wait 1 minute before trying again"));
  }
};

export const trackOtpRequests = async (email: string,next:NextFunction) => {
 
    const otpRequestKey=`otp_request_count:${email}`;
    let otpRequests=parseInt((await redis.get(otpRequestKey))|| "0") ;

    if(otpRequests >2) {
        await redis.set(`otp_spam_lock:${email}`, "locked", "EX", 3600); // Lock for 1 hour
        return next(new ValidationError("Too many requests, please try again later"));
    }

    await redis.set(otpRequestKey, otpRequests + 1, "EX", 3600); // Increment request count and set expiration to 1 hour

}

export const sendOtp = async (
    name: string,
  email: string,
  template: string
) => {
  const otp = crypto.randomInt(1000, 9999).toString();

  await sendEmail(email, "Varify your Email", template, { name, otp });

  await redis.set(`otp:${email}`, otp, "EX", 300); // Store OTP in Redis for 5 minutes
  await redis.set(`otp_cooldown:${email}`, "true", "EX", 60); // Set cooldown for 1 minute
};


export const varifyOtp=async(email:string,otp:string,next:NextFunction)=>{


  const storedOtp=await redis.get(`otp:${email}`)

  if(!storedOtp){

    throw new ValidationError('invalid or expired otp!')
  }

  const failedAttemptsKey=`otp_attempts:${email}`

  const failedAttempts=parseInt((await redis.get(failedAttemptsKey))||"0")

  if(storedOtp!==otp){

    if(failedAttempts>2){

      await redis.set(`otp_lock:${email}`,'locked','EX',1800)//lock for 30 min
      await redis.del(`otp:${email}`,failedAttemptsKey)

      throw new ValidationError('too many failed attempts,your account is locked for 30 min')
    }

    await redis.set(failedAttemptsKey,failedAttempts+1,'EX',300)

    throw new ValidationError(`incorrect OTP.${2-failedAttempts} attempts left..`)
  }


  await redis.del(`otp:${email}`,failedAttemptsKey)



}


export const handleForgotPassword=async(req:Request,res:Response,next:NextFunction,userType:"user"|"seller")=>{

  try {

    const {email}=req.body

    if(!email){

      throw new ValidationError('email is required!')
    }

    //find the user or seller in db

    const user=userType==="user"&& await prisma.users.findUnique({where:{email}})


    if(!user){
      throw new ValidationError(`${userType} is not found!`)
    }


    await checkOtpRegistration(email,next);
    await trackOtpRequests(email,next);

    //generate otp and sent email

    await sendOtp(email,user.name,'forgot-password-user-mail')

    res.status(200).json({message:'otp sent to email.Please varify your account.!'})


    
  } catch (error) {

      return next(error);
    
  }
}




export const varifyForgotPasswordOtp=async(req:Request,res:Response,next:NextFunction)=>{

  try {

    const{email,otp}=req.body

    if(!email||!otp){

      throw new ValidationError('email and otp are required.!')
    }

    await varifyOtp(email,otp,next)

    res.status(200).json({message:'Otp varified.You can now reset your password.'})
    
  } catch (error) {
    
    next (error)
  }
}