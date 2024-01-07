import { Router } from "express";
import { upload } from "../middlewares/multer.js";
import { loginUser, registerUser } from "../controllers/user.controllers.js";

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

export default userRouter;
