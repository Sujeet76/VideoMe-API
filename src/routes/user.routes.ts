import { Router } from "express";
import { upload } from "../middlewares/multer.js";
import { registerUser } from "../controllers/user.controllers.js";

const router = Router();

//register route
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);
