import { Schema, model } from "mongoose";
import type { ITweets } from "./model.d.ts";

const tweetsSchema = new Schema<ITweets>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Tweet = model<ITweets>("Tweet", tweetsSchema);
