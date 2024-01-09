import { Request, Response } from "express";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { IVideoQuery } from "./video.type.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/users.model.js";
import { IUser } from "../models/model.js";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../utils/CloudinaryUploadAndDelete.js";
import { Video } from "../models/videos.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";

interface RequestWithUser extends Request {
  user?: IUser;
}

// TODO:Check is it correct
export const getAllVideos = asyncHandler(
  async (req: Request<IVideoQuery, {}, {}>, res: Response) => {
    const { page = 1, limit = 10, sortedBy, sortedType, userId } = req.params;

    if (!sortedBy || !sortedType || !userId) {
      throw new ApiError(404, "Sorted by, sort type, user id is required");
    }

    if (!["createdAt", "views", "duration"].includes(sortedBy)) {
      throw new ApiError(
        404,
        "Sorted by must be one of createdAt, views, duration"
      );
    }

    if (!["asc", "desc"].includes(sortedType)) {
      throw new ApiError(
        404,
        "Sorted type must be one of ascending(asc), descending(desc)"
      );
    }

    const sortOrder = sortedType === "asc" ? 1 : -1;

    const allVideo = await User.aggregate([
      {
        $match: {
          _id: userId,
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "_id",
          foreignField: "owner",
          as: "userVideos",
        },
      },
      {
        $sort: {
          [sortedBy]: sortOrder,
        },
      },
      {
        $limit: limit,
      },
      {
        $skip: (page - 1) * limit,
      },
    ]);
  }
);

export const publishAVideo = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { title, description } = req.body;
    const { _id } = req.user!;
    const files = (req.files as Express.Multer.File[]) || undefined;

    if (!title.trim() || !description.trim()) {
      throw new ApiError(404, "Title and description is required");
    }

    const thumbnailPath = files[0]?.path;
    const videoPath = files[1]?.path;

    if (!thumbnailPath || !videoPath) {
      throw new ApiError(404, "Thumbnail and video is required");
    }

    const uploadThumbnail = await uploadToCloudinary(thumbnailPath);
    const uploadVideo = await uploadToCloudinary(videoPath);

    if (!uploadThumbnail) {
      throw new ApiError(500, "Upload thumbnail  failed");
    }

    if (!uploadVideo) {
      throw new ApiError(500, "Upload video failed");
    }

    const videoUpload = await Video.create(
      {
        title,
        description,
        thumbnail: uploadThumbnail?.secure_url ?? "",
        videoFile: uploadVideo?.secure_url ?? "",
        owner: _id,
        duration: uploadVideo.duration ?? 0,
      },
      { new: true }
    );

    return res
      .status(201)
      .json(new ApiResponse(201, "Video uploaded successfully", videoUpload));
  }
);

export const getVideoById = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { videoId } = req.params;

    if (!videoId) {
      throw new ApiError(400, "Video id is required");
    }

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video file not found");

    return res
      .status(200)
      .json(new ApiResponse(200, "Video fetched successfully", video));
  }
);

export const updateVideo = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { _id } = req.user!;
    const { videoId } = req.params;
    const file = (req.file as Express.Multer.File) || undefined;

    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(404, "Video file not found");
    }

    const videoPath = file?.path;

    if (!videoPath) {
      throw new ApiError(404, "Video file is required!");
    }

    const uploadVideo = await uploadToCloudinary(videoPath);
    // TODO:Delete previous video

    const updateVideo = await Video.findByIdAndUpdate(
      video?.id,
      {
        $set: {
          videoFile: uploadVideo?.secure_url,
        },
      },
      { new: true }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, "Video file updated", updateVideo));
  }
);

export const updateThumbnail = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { _id } = req.user!;
    const { videoId } = req.params;
    const file = (req.file as Express.Multer.File) || undefined;

    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(404, "Video file not found");
    }

    const thumbnailPath = file?.path;

    if (!thumbnailPath) {
      throw new ApiError(404, "Video file is required!");
    }

    const uploadThumbnail = await uploadToCloudinary(thumbnailPath);
    deleteFromCloudinary(thumbnailPath);

    const updateVideo = await Video.findByIdAndUpdate(
      video?.id,
      {
        $set: {
          thumbnail: uploadThumbnail?.secure_url,
        },
      },
      { new: true }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, "Thumbnail updated", updateVideo));
  }
);

export const deleteVideo = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { videoId } = req.params;
    if (!videoId) {
      throw new ApiError(404, "Video is required");
    }

    const deleteFile = await Video.findByIdAndDelete(videoId);

    return res
      .status(200)
      .json(new ApiResponse(200, "Video deleted successfully", {}));
  }
);

export const togglePublishStatus = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { videoId } = req.params;

    if (!videoId) {
      throw new ApiError(404, "Video is required");
    }

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "No video found");

    const updateVideo = await Video.findByIdAndUpdate(
      videoId,
      {
        $set: {
          isPublished: !video?.isPublished,
        },
      },
      { new: true }
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Video published toggled successfully",
          updateVideo
        )
      );
  }
);
