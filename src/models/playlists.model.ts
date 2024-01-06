import { Schema, model } from "mongoose";
import type { IPlaylists } from "./model.d.ts";

const playlistSchema = new Schema<IPlaylists>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    videos: [
      {
        type: Schema.Types.ObjectId,
        required: [true, "Video reference is required"],
        ref: "Video",
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      required: [true, "Owner reference is required"],
    },
  },
  { timestamps: true }
);

export const Playlist = model<IPlaylists>("Playlist", playlistSchema);
