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
  .get(getSubscribedChannels)
  .post(toggleSubscription);

subscriptionRouter.route("/u/:subscriberId").get(getUserChannelSubscribers);

export default subscriptionRouter;
