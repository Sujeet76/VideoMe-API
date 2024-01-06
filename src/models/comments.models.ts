import mongoose, { Schema, Types } from "mongoose";
import type { IComments } from "./model.d.ts";

const commentSchema = new Schema<IComments>(
  {
    content: {
      type: String,
      required: [true, "content is required"],
      trim: true,
    },
    video: {
      type: Types.ObjectId,
      ref: "Video",
      required: [true, "Video ref is required"],
    },
    owner: {
      type: Types.ObjectId,
      required: [true, "user ref is required"],
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Comment = mongoose.model<IComments>("Comment", commentSchema);
