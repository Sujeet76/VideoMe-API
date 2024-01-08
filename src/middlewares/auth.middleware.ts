import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/users.model.js";
import { IUser } from "../models/model.js";

interface RequestWithUser extends Request {
  user: IUser;
}

export const isAuthorized = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req?.cookies?.accessToken ||
      req.header("Authorization")?.replace("Barer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized, Please login to continue");
    }

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
        _id: string;
        email: string;
      };

      const user = await User.findById(decoded._id).select(
        "-password -refreshToken"
      );

      if (!user) {
        throw new ApiError(404, "User not found");
      }

      req.user = user;
      console.log("User Authenticated");
      next();
    } catch (e) {
      console.log("Error while decoding jwt token");
      throw new ApiError(401, "Unauthorized, Please login to continue");
    }
  } catch (error) {
    console.log(`something went wrong while authorizing user: ${error}`);
    throw new ApiError(500, "Something went wrong while authorizing user");
  }
};
