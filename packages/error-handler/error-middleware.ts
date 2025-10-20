import { AppError } from "./index";
import { NextFunction, Request, Response } from "express";

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    console.error(
      `Error ${req.method} ${req.url} - ${err.statusCode} - ${err.message}`
    );

    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  // ✅ Improved: Log full error details in development
  console.error("Unexpected error:", {
    message: err.message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    method: req.method,
    url: req.url,
  });

  return res.status(500).json({
    error: "Something went wrong, please try again later",
    ...(process.env.NODE_ENV !== 'production' && { details: err.message }),
  });
};
