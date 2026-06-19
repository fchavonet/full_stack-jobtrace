import express from "express";

import {
  getProfile,
  updateProfile,
  updateSettings
} from "../controllers/profile.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  validateProfilePayload,
  validateSettingsPayload
} from "../validators/profile.validator.js";

const router = express.Router();

router.get("/", authMiddleware, getProfile);
router.patch("/", authMiddleware, validateProfilePayload, updateProfile);
router.patch("/settings", authMiddleware, validateSettingsPayload, updateSettings);

export default router;
