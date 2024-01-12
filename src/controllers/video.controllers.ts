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
import { CLOUDINARY_VIDEO_FOLDER } from "../constant.js";

interface RequestWithUser extends Request {
  user?: IUser;
}

// TODO:Check is it correct
export const getAllVideos = asyncHandler(
  async (req: Request<IVideoQuery, {}, {}>, res: Response) => {
    const {
      page = 1,
      limit = 10,
      sortedBy = "createdAt",
      sortedType = "asc",
      userId,
    } = req.params;

    if (!sortedBy || !sortedType || !userId) {
      throw new ApiError(404, "Sorted by, sort type, user id is required");
    }

    if (!["createdAt", "views", "duration"].includes(sortedBy)) {
      throw new ApiError(
        404,
        "Sorted by must be one of createdAt, views, duration and same as given spelling and letter"
      );
    }

    if (!["asc", "desc"].includes(sortedType)) {
      throw new ApiError(
        404,
        "Sorted type must be one of ascending(asc), descending(desc)"
      );
    }

    const sortOrder = sortedType === "asc" ? 1 : -1;

    const totalDocument = await Video.aggregate([
      {
        $match: {
          owner: userId,
        },
      },
      {
        $count: "length",
      },
    ]);

    const allVideo = await Video.aggregate([
      {
        $match: {
          owner: userId,
        },
      },
      {
        $sort: {
          [sortedBy]: sortOrder,
        },
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },
    ]);

    return res.status(200).json(
      new ApiResponse(200, "All videos", {
        limit: limit,
        currentPage: page,
        totalPages: Math.ceil(totalDocument.length / limit),
        videos: {
          ...allVideo,
        },
      })
    );
  }
);

export const publishAVideo = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { title, description } = req.body;
    const { _id } = req.user!;
    const files = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | undefined;

    if (!title.trim() || !description.trim()) {
      throw new ApiError(404, "Title and description is required");
    }

    const videoPath = files?.videoFile[0]?.path;
    const thumbnailPath = files?.thumbnail[0]?.path;

    if (!thumbnailPath || !videoPath) {
      throw new ApiError(404, "Thumbnail and video is required");
    }

    const uploadThumbnail = await uploadToCloudinary(thumbnailPath);
    const uploadVideo = await uploadToCloudinary(
      videoPath,
      CLOUDINARY_VIDEO_FOLDER
    );

    if (!uploadThumbnail) {
      throw new ApiError(500, "Upload thumbnail  failed");
    }

    if (!uploadVideo) {
      throw new ApiError(500, "Upload video failed");
    }

    const videoUpload = await Video.create({
      title,
      description,
      thumbnail: uploadThumbnail?.secure_url ?? "",
      videoFile: uploadVideo?.secure_url ?? "",
      owner: _id,
      duration: uploadVideo?.duration ?? 0,
    });

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
    const { videoId } = req.params;
    const { title, description } = req.body;
    const file = (req.file as Express.Multer.File) || undefined;

    const isVideoExist = await Video.findById(videoId);
    if (!isVideoExist) {
      throw new ApiError(404, "Video file not found");
    }

    // update title if title is there
    if (title) {
      isVideoExist.title = title;
    }

    // update description if description exist
    if (description) {
      isVideoExist.description = description;
    }

    // update thumbnail if thumbnail exist
    if (file) {
      const thumbnail = file?.path;
      if (!thumbnail) throw new ApiError(404, "Thumbnail is required");
      const uploadVideo = await uploadToCloudinary(thumbnail);
      const prevUrl = isVideoExist.thumbnail;
      isVideoExist.thumbnail = uploadVideo?.secure_url ?? "";

      // delete prev thumbnail (temporary check because all the assets are not upload to cloudinary)
      if (!prevUrl.includes("pixabay.com")) deleteFromCloudinary(thumbnail);
    }

    // save the document
    await isVideoExist.save();

    const updatedDocument = await Video.findById(isVideoExist._id);

    return res
      .status(200)
      .json(new ApiResponse(200, "Video file updated", updatedDocument));
  }
);

// testing remaining
export const deleteVideo = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { videoId } = req.params;
    if (!videoId) {
      throw new ApiError(404, "Video id is required");
    }

    const deleteFile = await Video.findByIdAndDelete(videoId);
    // TODO:delete video from cloudinary

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
