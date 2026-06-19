import express from "express";

import {
  getProfile,
  updateProfile
} from "../controllers/profile.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { validateProfilePayload } from "../validators/profile.validator.js";

const router = express.Router();

router.get("/", authMiddleware, getProfile);
router.patch("/", authMiddleware, validateProfilePayload, updateProfile);

export default router;
