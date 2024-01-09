import { model, Schema } from "mongoose";
import type { ISubscriptions } from "./model.js";
const subscriptionSchema = new Schema<ISubscriptions>(
  {
    subscriber: {
      type: Schema.Types.ObjectId, //user who subscribed
      required: [true, "User reference is required"],
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Channel reference is required"],
    },
  },
  { timestamps: true }
);

export const Subscription = model<ISubscriptions>(
  "Subscription",
  subscriptionSchema
);
