import express from "express";

import authMiddleware from "../middlewares/auth.middleware.js";

import {
  getAuthStatus,
  getMe,
  login,
  register,
  verifyEmail
} from "../controllers/auth.controller.js";

import {
  validateEmailVerificationPayload,
  validateLoginPayload,
  validateRegisterPayload
} from "../validators/auth.validator.js";

const router = express.Router();

router.get("/status", getAuthStatus);
router.post("/register", validateRegisterPayload, register);
router.get("/verify-email", validateEmailVerificationPayload, verifyEmail);
router.post("/login", validateLoginPayload, login);
router.get("/me", authMiddleware, getMe);

export default router;
