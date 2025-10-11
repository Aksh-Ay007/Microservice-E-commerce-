import { NextFunction, Response } from "express";
import { AuthError } from "../error-handler";

export const isSeller = (req: any, res: Response, next: NextFunction) =>
  req.role === "seller"
    ? next()
    : next(new AuthError("Access denied: Seller only"));

export const isUser = (req: any, res: Response, next: NextFunction) =>
  req.role === "user"
    ? next()
    : next(new AuthError("Access denied: User only"));
