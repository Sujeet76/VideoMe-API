import { Schema, model } from "mongoose";
import type { ILikes } from "./model.d.ts";

const likeSchema = new Schema<ILikes>(
  {
    comment: {
      type: Schema.Types.ObjectId,
      required: [true, "Comment reference is required"],
      ref: "Comment",
    },
    video: {
      type: Schema.Types.ObjectId,
      required: [true, "video reference is required"],
      ref: "Video",
    },
    likedBy: {
      type: Schema.Types.ObjectId,
      required: [true, "user who like reference is required"],
      ref: "User",
    },
    tweet: {
      type: Schema.Types.ObjectId,
      required: [true, "tweet reference is required"],
      ref: "Tweet",
    },
  },
  { timestamps: true }
);

export const Like = model<ILikes>("Like", likeSchema);
