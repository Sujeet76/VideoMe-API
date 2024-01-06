import { Request, Response, NextFunction, RequestHandler } from "express";

export const asyncHandler = (fn: RequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((e) => {
      console.log("🔴 Error : ", e);
      return next(e);
    });
  };
};
