import { Router } from "express";
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
} from "../controllers/comment.controllers.js";
import { isAuthorized } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/:videoId").get(getVideoComments);

router.route("/").post(isAuthorized, addComment);
router
  .route("/c/:commentId")
  .delete(isAuthorized, deleteComment)
  .patch(isAuthorized, updateComment);

export default router;
