import { Router } from "express";
import {
  toggleSubscription,
  getSubscribedChannels,
  getUserChannelSubscribers,
} from "../controllers/subscription.controllers.js";
import { isAuthorized } from "../middlewares/auth.middleware.js";

const subscriptionRouter = Router();
subscriptionRouter.use(isAuthorized); // Apply verifyJWT middleware to all routes in this file

subscriptionRouter
  .route("/c/:channelId")
  .get(getUserChannelSubscribers) // controller to return subscriber list of a channel
  .post(toggleSubscription);

 // controller to return channel list to which user has subscribed
subscriptionRouter.route("/u/:subscriberId").get(getSubscribedChannels);

export default subscriptionRouter;
