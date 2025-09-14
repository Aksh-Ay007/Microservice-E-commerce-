import { AppError } from "./index";
import { NextFunction, Request, Response } from "express";

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    console.log(
      `Error ${req.method} ${req.url} - ${err.statusCode} - ${err.message}`
    );

    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  console.log("unhandled error", err);
  return res.status(500).json({
    error: "something went wrong please try again later",
  });
};
