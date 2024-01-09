import { Request, Response } from "express";
import Joi from "joi";
import mongoose from "mongoose";
import Jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ILogin, IRegister, IUpdatePassword } from "./user.type.js";
import { ApiError } from "../utils/ApiError.js";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../utils/CloudinaryUploadAndDelete.js";
import { User } from "../models/users.model.js";
import {
  passwordValidation,
  registerSchema,
} from "../validation/validation.js";
import { IUser } from "../models/model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const options = {
  httpOnly: true,
  secure: true,
};

interface RequestWithUser extends Request {
  user?: IUser;
}

const generateRefreshAndAccessToken = (user: IUser) => {
  try {
    if (!user) {
      throw new ApiError(
        500,
        "User object is required to generate access and refresh token"
      );
    }

    const accessToken = user.getAccessToken();
    const refreshToken = user.getRefreshToken();

    user.refreshToken = refreshToken;

    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(
      500,
      `Error while generating access token error :${error}`
    );
  }
};

export const registerUser = asyncHandler(
  async (req: Request<{}, {}, IRegister>, res: Response) => {
    const { fullName, username, email, password } = req.body;
    const files = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | undefined;

    const errRegister = registerSchema.validate({
      fullName,
      username,
      email,
      password,
    });
    if (errRegister.error) {
      throw new ApiError(400, errRegister.error.message);
    }

    const isUserExist = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (isUserExist) {
      throw new ApiError(409, "User already exist with this email or username");
    }

    const avatar = files?.avatar[0]?.path;
    if (!avatar) {
      console.log({ avatar });
      throw new ApiError(400, "Profile image is required");
    }
    // check if user have given cover image
    let coverImage = null;
    let coverImageUpload = null;

    if (
      files &&
      Array.isArray(files.coverImage) &&
      files.coverImage.length > 0
    ) {
      coverImage = files.coverImage[0]?.path;
    }

    if (coverImage) {
      // upload to cloudinary
      coverImageUpload = await uploadToCloudinary(coverImage);
    }
    // upload to cloudinary
    const avatarUpload = await uploadToCloudinary(avatar);

    const newUser = await User.create({
      fullName,
      username,
      email,
      password,
      avatar: avatarUpload?.secure_url,
      coverImage: coverImageUpload?.secure_url || "",
    });

    const createdUser = await User.findById(newUser?._id).select(
      "-refreshToken -password"
    );

    if (!createdUser) {
      throw new ApiError(500, "something went wrong while creating user");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "User registered successfully", createdUser));
  }
);

export const loginUser = asyncHandler(
  async (req: Request<{}, {}, ILogin>, res: Response) => {
    const { email, username, password } = req.body;

    if (!email && !username) {
      throw new ApiError(400, "Email or username is required");
    }

    if (!password) {
      throw new ApiError(400, "Password is required");
    }

    const isUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (!isUser) {
      throw new ApiError(404, "User not found");
    }

    const isPasswordMatch = await isUser.isCorrectPassword(password);

    if (!isPasswordMatch) {
      throw new ApiError(400, "Password or Username is incorrect");
    }

    const { refreshToken, accessToken } = generateRefreshAndAccessToken(isUser);
    isUser.save({ validateBeforeSave: false });

    const updatedUser = await User.findById(isUser._id).select(
      "-password -refreshToken"
    );

    if (!updatedUser) {
      throw new ApiError(500, "something went wrong while fetching user");
    }

    // setup cookies
    res
      .cookie("refreshToken", refreshToken, {
        ...options,
        maxAge: 10 * 24 * 60 * 60 * 1000, //10 days
      })
      .cookie("accessToken", accessToken, {
        ...options,
        maxAge: 24 * 60 * 60 * 1000, //1day
      })
      .status(200)
      .json(
        new ApiResponse(200, "User logged in successfully", {
          user: updatedUser,
          refreshToken,
          accessToken,
        })
      );
  }
);

export const logout = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { _id } = req.user!;

    const user = await User.findByIdAndUpdate(_id, {
      $unset: {
        refreshToken: "",
      },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    res
      .clearCookie("accessToken")
      .clearCookie("refreshToken")
      .status(200)
      .json(new ApiResponse(200, "User logged out successfully", {}));
  }
);

export const getAccessToken = asyncHandler(
  async (req: Request, res: Response) => {
    const userRefreshToken =
      req.cookies?.refreshToken || req.body?.refreshToken;

    if (!userRefreshToken) {
      throw new ApiError(401, "Unauthorized, Refresh token is required");
    }

    const { _id } = Jwt.verify(
      userRefreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as { _id: string };

    if (!_id) {
      throw new ApiError(401, "Unauthorized, Invalid refresh token");
    }

    const user = await User.findById(_id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.refreshToken !== userRefreshToken) {
      throw new ApiError(401, "Unauthorized, Invalid refresh token");
    }

    const accessToken = user.getAccessToken();

    res
      .status(200)
      .cookie("accessToken", accessToken, {
        ...options,
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json(
        new ApiResponse(200, "Access token generated successfully", {
          accessToken,
        })
      );
  }
);

export const updatePassword = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const { _id } = req.user!;

    const user = await User.findById(_id);
    if (!user) {
      throw new ApiError(401, "Unauthorize, User not found");
    }

    const validPassword = passwordValidation.validate({
      currentPassword,
      newPassword,
    });
    if (validPassword.error) {
      throw new ApiError(400, validPassword.error.message);
    }

    const isPasswordMatch = await user.isCorrectPassword(currentPassword);
    if (!isPasswordMatch) {
      throw new ApiError(400, "Current password is incorrect");
    }

    user.password = newPassword;
    user.save({ validateBeforeSave: false });

    res
      .status(200)
      .json(new ApiResponse(200, "Password updated successfully", {}));
  }
);

export const updateProfileImg = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { _id } = req.user!;
    const user = await User.findById(_id);
    if (!user) {
      throw new ApiError(401, "Unauthorize, User not found");
    }

    const imgPath = (req.file as Express.Multer.File)?.path;
    if (!imgPath) {
      throw new ApiError(400, "Profile image is required");
    }

    const imgUpload = await uploadToCloudinary(imgPath);
    deleteFromCloudinary(user?.avatar);

    if (!imgUpload) {
      throw new ApiError(500, "Something went wrong while uploading image");
    }

    const updatedUser = await User.findByIdAndUpdate(
      user?._id,
      {
        $set: {
          avatar: imgUpload?.secure_url ?? "",
        },
      },
      { new: true }
    ).select("-password -refreshToken");

    res
      .status(200)
      .json(
        new ApiResponse(200, "Profile image updated successfully", updatedUser)
      );
  }
);

export const updateCoverImg = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { _id } = req.user!;
    const user = await User.findById(_id);
    if (!user) {
      throw new ApiError(401, "Unauthorize, User not found");
    }

    const imgPath = (req.file as Express.Multer.File)?.path;
    if (!imgPath) {
      throw new ApiError(400, "Cover image is required");
    }

    const imgUpload = await uploadToCloudinary(imgPath);
    if (user.coverImage) deleteFromCloudinary(user?.coverImage);

    if (!imgUpload) {
      throw new ApiError(500, "Something went wrong while uploading image");
    }

    const updatedUser = await User.findByIdAndUpdate(
      user?._id,
      {
        $set: {
          coverImage: imgUpload?.secure_url ?? "",
        },
      },
      { new: true }
    ).select("-password -refreshToken");

    res
      .status(200)
      .json(
        new ApiResponse(200, "Cover image updated successfully", updatedUser)
      );
  }
);

export const updateUserDetails = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { _id } = req.user!;
    const user = await User.findById(_id);
    if (!user) {
      throw new ApiError(404, "User not found!");
    }

    const { email, fullName } = req.body;
    if (email) {
      const validateSchema = Joi.object({
        email: Joi.string().email().required().messages({
          "string.email": "Invalid email format",
          "any.required": "Email is required",
        }),
      });
      const { error } = validateSchema.validate({ email });
      if (error) throw new ApiError(400, error.message);
      user.email = email;
    }

    if (fullName) {
      const validateSchema = Joi.object({
        fullName: Joi.string()
          .pattern(/^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/)
          .required()
          .messages({
            "string.pattern.base":
              "Full name must contain only letters and may have space to separate first name and last name",
            "any.required": "Full name is required",
          }),
      });
      const { error } = validateSchema.validate({ fullName });
      if (error) throw new ApiError(400, error.message);
      user.fullName = fullName;
    }

    await user.save({ validateBeforeSave: false });

    const updatedUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    res
      .status(200)
      .json(new ApiResponse(200, "User updated successfully", updatedUser));
  }
);

export const getUserChannelProfile = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    /**
     * steps in this function
     * 1. get user name from params
     * 2. validate user name
     * 3. fetch all the details about its channel like number of subscriber and total videos uploaded by him and list of channel to whom he subscribed etc
     * 4. send back response
     */

    const { username } = req.params;
    if (!username.trim()) {
      throw new ApiError(400, "Username is required");
    }

    const channel = await User.aggregate([
      {
        $match: {
          username: username?.toLowerCase(),
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "channel",
          as: "subscribers",
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "subscriber",
          as: "subscribedTo",
        },
      },
      {
        $addFields: {
          subscribersCount: {
            $size: "$subscribers",
          },
          channelSubscribedCount: {
            $size: "$subscribedTo",
          },
          isSubscribed: {
            $cond: {
              if: { $in: [req?.user?._id, "$subscribers.subscriber"] },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $project: {
          fullName: 1,
          username: 1,
          subscribersCount: 1,
          channelSubscribedCount: 1,
          isSubscribed: 1,
          avatar: 1,
          coverImage: 1,
        },
      },
    ]);

    if (!channel?.length) {
      throw new ApiError(404, "Channel not found");
    }

    res.status(200).json(new ApiResponse(200, "Channel found", channel[0]));
  }
);

export const getWatchHistory = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { _id } = req?.user!;
    if (!_id) {
      throw new ApiError(401, "Unauthorized, Please login to continue");
    }

    const user = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(_id),
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "watchHistory",
          foreignField: "_id",
          as: "watchHistory",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                  {
                    $project: {
                      fullName: 1,
                      username: 1,
                      avatar: 1,
                      createdAt: 1,
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                owner: "$owner",
              },
            },
          ],
        },
      },
    ]);

    res
      .status(200)
      .json(new ApiResponse(200, "Watch history", user[0].watchHistory));
  }
);
