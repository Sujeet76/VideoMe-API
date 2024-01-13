import { Router } from "express";
import {
  getChannelStats,
  getChannelVideos,
} from "../controllers/dashboard.controllers.js";
import { isAuthorized } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(isAuthorized); // Apply isAuthorized middleware to all routes in this file

router.route("/stats").get(getChannelStats);
router.route("/videos").get(getChannelVideos);

export default router;
