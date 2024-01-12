import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/likes.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { IUser } from "../models/model.js";
import { Request, Response } from "express";

interface RequestWithUser extends Request {
  user?: IUser;
}

const toggleVideoLike = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { videoId } = req.params;
    //TODO: toggle like on video
    if (!isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid video id");
    }

    const isLiked = await Like.findOne({
      $and: [{ video: videoId }, { likedBy: req.user?._id }],
    });

    if (isLiked) {
      await Like.findOneAndDelete({
        $and: [{ video: videoId }, { likedBy: req.user?._id }],
      });
      res
        .status(200)
        .json(new ApiResponse(200, "Unlike the video", { isLiked: false }));
    } else {
      await Like.create({
        likedBy: req.user?._id,
        video: videoId,
      });
      res
        .status(201)
        .json(new ApiResponse(201, "Liked the video", { isLiked: true }));
    }
  }
);

const toggleCommentLike = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { commentId } = req.params;
    //TODO: toggle like on comment
    if (!isValidObjectId(commentId)) {
      throw new ApiError(400, "Invalid comment id");
    }

    const isLiked = await Like.findOne({
      $and: [{ comment: commentId }, { likedBy: req.user?._id }],
    });
    if (isLiked) {
      await Like.findOneAndDelete({
        $and: [{ comment: commentId }, { likedBy: req.user?._id }],
      });
      res
        .status(200)
        .json(new ApiResponse(200, "Unlike the comment", { isLiked: false }));
    } else {
      await Like.create({
        likedBy: req.user?._id,
        comment: commentId,
      });
      res
        .status(201)
        .json(new ApiResponse(201, "Liked the comment", { isLiked: true }));
    }
  }
);

const toggleTweetLike = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { tweetId } = req.params;
    //TODO: toggle like on tweet
    if (!isValidObjectId(tweetId)) {
      throw new ApiError(400, "Invalid tweet id");
    }

    const isLiked = await Like.findOne({
      $and: [{ tweet: tweetId }, { likedBy: req.user?._id }],
    });
    if (isLiked) {
      await Like.findOneAndDelete({
        $and: [{ tweet: tweetId }, { likedBy: req.user?._id }],
      });
      res
        .status(200)
        .json(new ApiResponse(200, "Unlike the tweet", { isLiked: false }));
    } else {
      await Like.create({
        likedBy: req.user?._id,
        tweet: tweetId,
      });
      res
        .status(201)
        .json(new ApiResponse(201, "Liked the tweet", { isLiked: true }));
    }
  }
);

const getLikedVideos = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    //TODO: get all liked videos
    const { _id: userId } = req.user!;

    try {
      const likedVideos = await Like.find({
        likedBy: userId,
        video: { $exists: true },
      }).populate("video");

      res
        .status(200)
        .json(new ApiResponse(200, "Fetched all liked video", likedVideos));
    } catch (err: any) {
      throw new ApiError(
        500,
        "something went wrong while fetching liked videos"
      );
    }
  }
);

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
