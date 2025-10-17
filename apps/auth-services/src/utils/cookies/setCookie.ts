import {  Response } from "express";


export const setCookie=(res:Response,name:string,value:string)=>{
    // Set appropriate maxAge based on token type
    const maxAge = name === "access_token" 
        ? 15 * 60 * 1000  // 15 minutes for access token
        : 7 * 24 * 60 * 60 * 1000; // 7 days for refresh token

    res.cookie(name,value,{
        httpOnly:true,
        secure: process.env.NODE_ENV === "production", // Only secure in production
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge
    })
}
