import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweets.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { IUser } from "../models/model.js";
import { Request, Response } from "express";

interface RequestWithUser extends Request {
  user?: IUser;
}

const createTweet = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    //TODO: create tweet
    const { _id } = req.user!;
    const { content } = req.body;

    if (!content?.trim()) {
      throw new ApiError(400, "Content is required");
    }

    const newTweet = await Tweet.create({
      owner: _id,
      content,
    });

    if (!newTweet) {
      throw new ApiError(500, "Tweet could not be created");
    }

    res.status(201).json(new ApiResponse(201, "Tweet created", newTweet));
  }
);

const getUserTweets = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    // TODO: get user tweets
    const { userId } = req.params;

    if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid user id");

    const allTweet = await Tweet.find({ owner: userId });

    res.status(200).json(new ApiResponse(200, "All tweets", allTweet));
  }
);

const updateTweet = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    //TODO: update tweet
    const { _id } = req.user!;
    const { tweetId } = req.params;
    const { content } = req.body;

    if (!content?.trim()) throw new ApiError(400, "Content is required");

    if (!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid tweet id");

    const updateTweet = await Tweet.findOneAndUpdate(
      {
        $and: [{ _id: tweetId }, { owner: _id }],
      },
      {
        $set: { content },
      },
      { new: true }
    );
    if (!updateTweet) throw new ApiError(500, "Error while updating tweet");

    res.status(200).json(new ApiResponse(200, "Tweet updated", updateTweet));
  }
);

const deleteTweet = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    //TODO: delete tweet
    const { _id } = req.user!;
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid tweet id");

    try {
      await Tweet.findOneAndDelete({
        $and: [{ _id: tweetId }, { owner: _id }],
      });
    } catch (err: any) {
      throw new ApiError(500, "Error while deleting tweet");
    }

    res.status(200).json(new ApiResponse(200, "Tweet deleted", {}));
  }
);

export { createTweet, getUserTweets, updateTweet, deleteTweet };
