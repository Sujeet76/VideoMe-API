import { Request, Response } from "express";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { IRegister } from "./user.type.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadToCloudinary } from "../utils/CloudinaryUploadAndDelete.js";
import { User } from "../models/users.model.js";
import { registerSchema } from "../validation/validation.js";
import { IUser } from "../models/model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateRefreshAndAccessToken = (user: IUser) => {
  try {
    if (!user) {
      throw new ApiError(
        500,
        "User object is required to generate access and refresh token"
      );
    }

    const refreshToken = user.getAccessToken();
    const accessToken = user.getRefreshToken();

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

// export const loginUser = asyncHandler(async())
