import express from "express";

import {
  deleteAccount,
  exportAccount,
  forgotPassword,
  getAuthStatus,
  getMe,
  login,
  register,
  resetPassword,
  verifyEmail
} from "../controllers/auth.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

import {
  validateEmailVerificationPayload,
  validateForgotPasswordPayload,
  validateLoginPayload,
  validateRegisterPayload,
  validateResetPasswordPayload
} from "../validators/auth.validator.js";

const router = express.Router();

router.get("/status", getAuthStatus);
router.post("/register", validateRegisterPayload, register);
router.get("/verify-email", validateEmailVerificationPayload, verifyEmail);
router.post("/login", validateLoginPayload, login);
router.get("/me", authMiddleware, getMe);
router.delete("/me", authMiddleware, deleteAccount);
router.get("/export", authMiddleware, exportAccount);
router.post("/forgot-password", validateForgotPasswordPayload, forgotPassword);
router.post("/reset-password", validateResetPasswordPayload, resetPassword);

export default router;
