import { Router } from "express";
import { upload } from "../middlewares/multer.js";
import { registerUser } from "../controllers/user.controllers.js";

const userRouter = Router();

//register route
userRouter.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

export default userRouter;
