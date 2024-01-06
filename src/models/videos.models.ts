import mongoose, { Schema, Types } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import type { IVideos } from "./model.d.ts";

const videoSchema = new Schema<IVideos>(
  {
    videoFile: {
      type: String,
      required: [true, "Video is required"],
      index: true,
    },
    thumbnail: {
      type: String,
      required: [true, "Thumbnail is required"],
    },
    owner: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"],
    },
    title: {
      type: String,
      required: [true, "Title video is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model<IVideos>("Video", videoSchema);
