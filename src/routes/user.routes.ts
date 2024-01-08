import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  getAccessToken,
  loginUser,
  logout,
  registerUser,
  updateCoverImg,
  updatePassword,
  updateProfileImg,
} from "../controllers/user.controllers.js";
import { isAuthorized } from "../middlewares/auth.middleware.js";

const userRouter = Router();

//register route
userRouter.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);
// login
userRouter.route("/login").post(loginUser);
userRouter.route("/get-token").get(getAccessToken)

//protected route
userRouter.route("/logout").post(isAuthorized, logout);
userRouter.route("/update-password").patch(isAuthorized, updatePassword);
userRouter
  .route("/update-avatar")
  .patch(isAuthorized, upload.single("avatar"), updateProfileImg);
userRouter
  .route("/update-cover-img")
  .patch(isAuthorized, upload.single("coverImg"), updateCoverImg);

export default userRouter;
