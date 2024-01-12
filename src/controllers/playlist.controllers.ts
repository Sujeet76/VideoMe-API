import mongoose from "mongoose";
import { Request, Response } from "express";
import { IUser } from "../models/model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlists.model.js";

interface RequestWithUser extends Request {
  user?: IUser;
}

export const createPlaylist = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { _id } = req.user!;
    const { name, description } = req.body;
    if (!name.trim() || !description.trim()) {
      throw new ApiError(400, "Name and description is required");
    }

    const playlist = await Playlist.create({
      name,
      description,
      owner: _id,
    });

    if (!playlist) throw new ApiError(500, "Error while creating playlist");

    return res
      .status(201)
      .json(new ApiResponse(201, "Playlist created successfully", playlist));
  }
);

export const getUsersPlaylist = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { _id } = req.user!;
    if (!_id) throw new ApiError(400, "User id is required!");
    const playlist = await Playlist.aggregate([
      {
        $match: {
          owner: _id,
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "videos",
          foreignField: "_id",
          as: "videos",
        },
      },
    ]);

    if (!playlist) throw new ApiError(404, "Playlist not found!");

    return res
      .status(200)
      .json(new ApiResponse(200, "Playlist fetched successfully!", playlist));
  }
);

export const getPlaylistById = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { playlistId } = req.params;
    const { _id } = req.user!;
    if (!playlistId) throw new ApiError(404, "Playlist id is required!");

    const playlist = await Playlist.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(playlistId),
          owner: _id,
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "videos",
          foreignField: "_id",
          as: "videos",
        },
      },
    ]);
    if (!playlist) throw new ApiError(404, "Playlist not found!");

    return res
      .status(200)
      .json(new ApiResponse(200, "Playlist fetched successfully!", playlist));
  }
);

export const addVideosToPlaylist = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { playlistId } = req.params;
    const { videoIds } = req.body;

    if (!playlistId) throw new ApiError(400, "Playlist id is required!");
    if (!Array.isArray(videoIds))
      throw new ApiError(400, "Video id must be in array!");

    if (!videoIds.length)
      throw new ApiError(400, "Video id (array of video id) is required!");

    let playlist;
    try {
      playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
          $addToSet: {
            videos: {
              $each: videoIds,
            },
          },
        },
        { new: true }
      );
    } catch (error: any) {
      throw new ApiError(
        500,
        `Error while inserting videos into playlist ${error.message}`
      );
    }

    const updatedPlaylist = await Playlist.findById(playlistId).populate(
      "videos"
    );

    return res
      .status(200)
      .json(new ApiResponse(200, "Videos added to playlist", updatedPlaylist));
  }
);

export const removeVideosToPlaylist = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { playlistId } = req.params;
    const { videoIds } = req.body;

    if (!playlistId) throw new ApiError(400, "Playlist id is required!");
    if (!Array.isArray(videoIds))
      throw new ApiError(400, "Video id must be in array!");

    if (!videoIds.length)
      throw new ApiError(400, "Video id (array of video id) is required!");

    const playlist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $pullAll: {
          videos: videoIds,
        },
      },
      { new: true }
    ).populate("videos");

    if (!playlist)
      throw new ApiError(500, "Error while removing videos id from playlist");

    return res
      .status(200)
      .json(new ApiResponse(200, "Videos removed from playlist", playlist));
  }
);

export const deletePlaylist = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { playlistId } = req.params;

    if (!playlistId) throw new ApiError(400, "Playlist id is required!");

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

    if (!deletedPlaylist)
      throw new ApiError(500, "Error while removing videos id from playlist");

    return res.status(200).json(new ApiResponse(200, "Playlist removed!", {}));
  }
);

export const updatePlaylist = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!playlistId) throw new ApiError(400, "Playlist id is required!");

    if (!name.trim() || !description.trim())
      throw new ApiError(400, "Name and Description is required");

    const isPlaylist = await Playlist.findById(playlistId);

    if (!isPlaylist) throw new ApiError(404, "Play not found");

    const updatedPlaylist = await Playlist.findById(
      playlistId,
      {
        $set: {
          name: name,
          description: description,
        },
      },
      { new: true }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, "Playlist updated!", updatedPlaylist));
  }
);
