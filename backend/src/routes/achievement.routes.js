import express from "express";

import { getAchievements } from "../controllers/achievement.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getAchievements);

export default router;
