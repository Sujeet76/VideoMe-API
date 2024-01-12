import { Router } from "express";
import { isAuthorized } from "../middlewares/auth.middleware.js";
import {
  addVideosToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  updatePlaylist,
  removeVideosToPlaylist,
  getUsersPlaylist,
} from "../controllers/playlist.controllers.js";

const playlistRouter = Router();

playlistRouter.use(isAuthorized);

playlistRouter.route("/").post(createPlaylist);

playlistRouter
  .route("/:playlistId")
  .get(getPlaylistById)
  .patch(updatePlaylist)
  .delete(deletePlaylist);

playlistRouter.route("/add/:playlistId").patch(addVideosToPlaylist);
playlistRouter.route("/remove/:playlistId").patch(removeVideosToPlaylist);
playlistRouter.route("/user/playlist").get(getUsersPlaylist);

export default playlistRouter;
