import mongoose, { isValidObjectId } from "mongoose";
import { Request, Response } from "express";
import { Comment } from "../models/comments.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { IUser } from "../models/model.js";

interface RequestWithUser extends Request {
  user?: IUser;
}

const getVideoComments = asyncHandler(async (req: Request, res: Response) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id");

  if (!Number(page) || !Number(limit))
    throw new ApiError(400, "Invalid number");
  if (Number(page) < 1 || Number(limit) < 1)
    throw new ApiError(400, "Page and limit must be greater then 0");

  const skip = (Number(page) - 1) * Number(limit);

  try {
    const totalDocument = await Comment.aggregate([
      { $match: { video: new mongoose.Types.ObjectId(videoId) } },
      { $count: "length" },
    ]);

    const totalPage = Math.ceil(totalDocument[0].length / Number(limit));

    if (totalPage < Number(page))
      return res.status(200).json(new ApiResponse(200, "No more comment", {}));

    const comment = await Comment.aggregate([
      {
        $match: {
          video: new mongoose.Types.ObjectId(videoId),
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: Number(limit),
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      {
        $addFields: {
          owner: {
            $first: "$owner",
          },
        },
      },
      {
        $project: {
          content: 1,
          video: 1,
          createdAt: 1,
          updatedAt: 1,
          "owner.username": 1,
          "owner.email": 1,
          "owner.fullName": 1,
          "owner.avatar": 1,
        },
      },
    ]);
    return res.status(200).json(
      new ApiResponse(200, "comment fetched successfully", {
        currentPage: page,
        totalPage: totalPage,
        limit,
        comments: comment,
      })
    );
  } catch (error: any) {
    throw new ApiError(
      500,
      error?.message ?? "something went wrong while fetching comment form db"
    );
  }
});

const addComment = asyncHandler(async (req: RequestWithUser, res: Response) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id");

  const { content } = req.body;

  if (!content?.trim()) throw new ApiError(400, "Content is required");

  try {
    const comment = await Comment.create({
      video: videoId,
      owner: req.user?._id,
      content,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, "comment added successfully", comment));
  } catch (error) {
    throw new ApiError(500, "Something creating comment");
  }
});

const updateComment = asyncHandler(async (req: Request, res: Response) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { content } = req.body;

  if (!isValidObjectId(commentId))
    throw new ApiError(400, "Invalid comment id");

  if (!content?.trim()) throw new ApiError(400, "Content is required");

  try {
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      {
        $set: {
          content,
        },
      },
      { new: true }
    );
    return res
      .status(200)
      .json(new ApiResponse(200, "comment updated", updatedComment));
  } catch (err: any) {
    throw new ApiError(500, "Something creating comment");
  }
});

const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  // TODO: delete a comment
  const { commentId } = req.params;

  if (!isValidObjectId(commentId))
    throw new ApiError(400, "Invalid comment id");

  try {
    await Comment.findByIdAndDelete(commentId);
    res
      .status(200)
      .json(new ApiResponse(200, "comment deleted successfully", {}));
  } catch (err: any) {
    throw new ApiError(500, "Something went wrong while deleting comment");
  }
});

export { getVideoComments, addComment, updateComment, deleteComment };
