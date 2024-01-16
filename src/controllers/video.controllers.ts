import { Request, Response } from "express";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { IVideoQuery } from "./video.type.js";
import { ApiError } from "../utils/ApiError.js";
import { IUser } from "../models/model.js";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../utils/CloudinaryUploadAndDelete.js";
import { Video } from "../models/videos.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { CLOUDINARY_VIDEO_FOLDER } from "../constant.js";
import mongoose, { isValidObjectId } from "mongoose";

interface RequestWithUser extends Request {
  user?: IUser;
}

// TODO:Check is it correct -> Done
export const getAllVideos = asyncHandler(
  async (req: Request<IVideoQuery, {}, {}>, res: Response) => {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortType = "asc",
      query,
      userId,
    } = req.query;

    if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid user id");

    if (!sortBy || !sortType || !userId) {
      throw new ApiError(404, "Sorted by, sort type, user id is required");
    }

    if (!["createdAt", "views", "duration"].includes(sortBy.toString())) {
      throw new ApiError(
        404,
        "Sorted by must be one of createdAt, views, duration and same as given spelling and letter"
      );
    }

    if (!["asc", "desc"].includes(sortType.toString())) {
      throw new ApiError(
        404,
        "Sorted type must be one of ascending(asc), descending(desc)"
      );
    }

    // check whether page and limit is a number else throw error
    if (!(Number(page) && Number(limit)))
      throw new ApiError(400, "Page and limit must be number");

    if (Number(page) < 1 || Number(limit) < 1)
      throw new ApiError(400, "Page and limit must be greater than 0");

    const sortOrder = sortType === "asc" ? 1 : -1;
    console.log(sortOrder);
    console.log(sortBy);

    const matchStage: any = {
      owner: new mongoose.Types.ObjectId(userId.toString()),
    };

    // if query is there then filter document on its title
    if (query?.toString()?.trim()) {
      matchStage.title = new RegExp(query.toString(), "i");
    }
    // count total document
    const totalDocument = await Video.aggregate([
      {
        $match: matchStage,
      },
      {
        $count: "length",
      },
    ]);

    // do filtering and pagination
    const allVideo = await Video.aggregate([
      {
        $match: matchStage,
      },
      // populate like to calc total likes
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "video",
          as: "likes",
        },
      },
      // added total likes per videos
      {
        $addFields: {
          likes: {
            $size: "$likes",
          },
        },
      },
      // sorting by given sorted by and sorted type
      {
        $sort: {
          [sortBy.toString()]: sortOrder,
        },
      },
      // skip it based on page number
      {
        $skip: (Number(page) - 1) * Number(limit),
      },
      // set limit
      {
        $limit: Number(limit),
      },
    ]);

    if (!allVideo)
      throw new ApiError(
        500,
        "Something went wrong! while fetching all videos"
      );

    return res.status(200).json(
      new ApiResponse(200, "All videos", {
        limit: limit,
        currentPage: page,
        totalPages: Math.ceil(totalDocument[0]?.length / Number(limit)),
        videos: allVideo,
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

    if (!isValidObjectId(videoId)) {
      throw new ApiError(400, "Video id is required");
    }

    // const video = await Video.findById(videoId);
    const video = await Video.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(videoId),
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "video",
          as: "likes",
        },
      },
      {
        $addFields: {
          likes: {
            $size: "$likes",
          },
        },
      },
    ]);
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

    const isVideoExist = await Video.findOne({
      $and: [{ _id: videoId }, { owner: req.user?._id }],
    });

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

    const updatedDocument = await Video.aggregate([
      {
        $match: {
          _id: isVideoExist?._id,
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "video",
          as: "likes",
        },
      },
      {
        $addFields: {
          likes: {
            $size: "$likes",
          },
        },
      },
    ]);

    return res
      .status(200)
      .json(new ApiResponse(200, "Video file updated", updatedDocument));
  }
);

// testing remaining
export const deleteVideo = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) {
      throw new ApiError(404, "Video id is required");
    }

    const deleteFile = await Video.findByIdAndDelete({
      $and: [{ _id: videoId }, { owner: req.user?._id }],
    });

    if (!deleteFile) throw new ApiError(404, "Video not found");
    // TODO:delete video from cloudinary

    return res
      .status(200)
      .json(new ApiResponse(200, "Video deleted successfully", deleteFile));
  }
);

export const togglePublishStatus = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
      throw new ApiError(404, "Video is required");
    }

    const video = await Video.findOne({
      $and: [{ _id: videoId }, { owner: req.user?._id }],
    });
    if (!video) throw new ApiError(404, "No video found");

    video.isPublished = !video.isPublished;
    await video.save();

    const videoWithLike = await Video.aggregate([
      {
        $match: {
          _id: video?._id,
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "video",
          as: "likes",
        },
      },
      {
        $addFields: {
          likes: {
            $size: "$likes",
          },
        },
      },
    ]);

    if (!videoWithLike)
      throw new ApiError(500, "Something went wrong while updating video");

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Video published toggled successfully",
          videoWithLike
        )
      );
  }
);
