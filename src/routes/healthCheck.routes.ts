import { Router } from "express";
import { healthcheck } from "../controllers/healthCheck.controllers.js";

const router = Router();

router.route("/").get(healthcheck);

export default router;
