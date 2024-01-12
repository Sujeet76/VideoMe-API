import mongoose from "mongoose";
import { Subscription } from "../models/subscriptions.model.js";
import { User } from "../models/users.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { IUser } from "../models/model.js";
import { Request, Response } from "express";

interface RequestWithUser extends Request {
  user?: IUser;
}

// TODO: Review all the controller

const toggleSubscription = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { channelId } = req.params;
    const { _id } = req.user!;
    if (!channelId || !_id)
      throw new ApiError(400, "SubscriberId and user id is required");

    const isChannel = await User.findById(channelId);
    if (!isChannel) throw new ApiError(404, "Channel not found!");

    const isSubscribed = await Subscription.findOne({
      $and: [{ channel: channelId }, { subscriber: _id }],
    });

    let toggleSubscribed: boolean; // if true then subscribed else unsubscribed
    if (isSubscribed) {
      await Subscription.findByIdAndDelete(isSubscribed);
      toggleSubscribed = false;
    } else {
      await Subscription.create({
        subscriber: _id,
        channel: channelId,
      });
      toggleSubscribed = true;
    }

    return res.status(200).json(
      new ApiResponse(200, "Subscription is toggled", {
        subscribed: toggleSubscribed,
      })
    );
  }
);

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { channelId } = req.params;
    if (!channelId) throw new ApiError(400, "channelId is required!");

    const userWhoSubscribedChannel = await Subscription.aggregate([
      {
        $match: {
          channel: new mongoose.Types.ObjectId(channelId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "subscriber",
          foreignField: "_id",
          as: "subscriber",
        },
      },
      {
        $addFields: {
          subscriber: {
            $first: "$subscriber",
          },
        },
      },
      {
        $project: {
          "subscriber.username": 1,
          "subscriber.email": 1,
          "subscriber.fullName": 1,
          "subscriber.avatar": 1,
          "subscriber._id": 1,
        },
      },
    ]);

    return res.status(200).json(
      new ApiResponse(200, "Subscriber list of channel", {
        subscribers: userWhoSubscribedChannel,
      })
    );
  }
);

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { subscriberId } = req.params;
    if (!subscriberId) throw new ApiError(400, "subscriberId is required!");

    const subscribedChannelByUser = await Subscription.aggregate([
      {
        $match: {
          subscriber: new mongoose.Types.ObjectId(subscriberId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "channel",
          foreignField: "_id",
          as: "channel",
        },
      },
      {
        $addFields: {
          channel: {
            $first: "$channel",
          },
        },
      },
      {
        $project: {
          "channel.username": 1,
          "channel.email": 1,
          "channel.fullName": 1,
          "channel.avatar": 1,
          "channel._id": 1,
        },
      },
    ]);

    return res.status(200).json(
      new ApiResponse(200, "Subscriber list of channel", {
        channel: subscribedChannelByUser,
      })
    );
  }
);

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
