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

      // stats like total video views, total subscribers, total videos, total likes
      const countStats = await Video.aggregate([
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
            likes: {
              $size: "$likes",
            },
          },
        },
        {
          $lookup: {
            from: "subscriptions",
            localField: "owner",
            foreignField: "channel",
            as: "totalSubscribers",
          },
        },
        {
          $addFields: {
            totalSubscribers: {
              $size: "$totalSubscribers",
            },
          },
        },
        {
          $group: {
            _id: null,
            totalVideo: {
              $sum: 1,
            },
            totalSubscribers: {
              $sum: "$totalSubscribers",
            },
            totalLike: {
              $sum: "$likes",
            },
            totalViews: {
              $sum: "$views",
            },
          },
        },
        {
          $project: {
            totalVideo: 1,
            totalLike: 1,
            totalViews: 1,
            totalSubscribers: {
              $ceil: {
                $divide: ["$totalSubscribers", "$totalVideo"],
              },
            },
          },
        },
      ]);

      // subscriber gain per day
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

      return res.status(200).json(
        new ApiResponse(200, "Channel stats fetched successfully", {
          totalSubscribers: countStats[0]?.totalSubscribers ?? 0,
          totalVideos: countStats[0]?.totalVideo ?? 0,
          totalLikes: countStats[0]?.totalLike ?? 0,
          totalViews: countStats[0]?.totalViews ?? 0,
          subscriberGainedPerDay,
        })
      );
    } catch (error: any) {
      console.log(error);
      throw new ApiError(
        500,
        "something went wrong while fetching dashboard data"
      );
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
