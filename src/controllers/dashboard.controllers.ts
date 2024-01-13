import mongoose from "mongoose";
import { Video } from "../models/videos.models.js";
import { Subscription } from "../models/subscriptions.model.js";
import { Like } from "../models/likes.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Request, Response } from "express";
import { IUser } from "../models/model.js";

interface RequestWithUser extends Request {
  user?: IUser;
}

const getChannelStats = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    try {
      // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
      const { _id: channelId } = req.user!;

      const totalVideos = await Video.countDocuments({
        owner: channelId,
      });
      const totalSubscribers = await Subscription.countDocuments({
        channel: channelId,
      });

      const totalLikes = await Like.countDocuments({
        video: { $in: totalVideos },
      });

      const totalViews = await Video.aggregate([
        {
          $match: {
            owner: channelId,
          },
        },
        {
          $group: {
            _id: null,
            totalViews: { $sum: "$views" },
          },
        },
      ]);

      // total views compared to subscribers
      const viewsPerSubscriber =
        Number(totalViews[0].totalViews) / totalSubscribers;

      // subscriber gain by day
      const subscriberGainedPerDay = await Subscription.aggregate([
        {
          $match: {
            channel: channelId,
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]);

      return res.status(200).json({
        totalVideos,
        totalSubscribers,
        totalLikes,
        totalViews: totalViews.length ? totalViews[0].totalViews : 0,
        subscriberGainedPerDay,
        viewsPerSubscriber,
      });
    } catch (error: any) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

const getChannelVideos = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { _id: channelId } = req.user!;

    const videos = await Video.aggregate([
      {
        $match: {
          owner: channelId,
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
          like: {
            $size: "$likes",
          },
        },
      },
    ]);

    if (!videos) throw new ApiError(404, "No video found");

    return res
      .status(200)
      .json(new ApiResponse(200, "channel video fetched successfully", videos));
  }
);

export { getChannelStats, getChannelVideos };
