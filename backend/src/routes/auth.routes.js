import express from "express";

import {
  deleteAccount,
  exportAccount,
  forgotPassword,
  getAuthStatus,
  getMe,
  login,
  logout,
  register,
  resetPassword,
  verifyEmail
} from "../controllers/auth.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

import {
  accountDeletionRateLimiter,
  loginRateLimiter,
  passwordRecoveryRateLimiter,
  registrationRateLimiter
} from "../middlewares/rateLimit.middleware.js";

import {
  validateDeleteAccountPayload,
  validateEmailVerificationPayload,
  validateForgotPasswordPayload,
  validateLoginPayload,
  validateRegisterPayload,
  validateResetPasswordPayload
} from "../validators/auth.validator.js";

const router = express.Router();

router.get("/status", getAuthStatus);

router.post(
  "/register",
  registrationRateLimiter,
  validateRegisterPayload,
  register
);

router.get(
  "/verify-email",
  validateEmailVerificationPayload,
  verifyEmail
);

router.post(
  "/login",
  loginRateLimiter,
  validateLoginPayload,
  login
);

router.post("/logout", logout);

router.get("/me", authMiddleware, getMe);

router.delete(
  "/me",
  authMiddleware,
  accountDeletionRateLimiter,
  validateDeleteAccountPayload,
  deleteAccount
);

router.get(
  "/export",
  authMiddleware,
  exportAccount
);

router.post(
  "/forgot-password",
  passwordRecoveryRateLimiter,
  validateForgotPasswordPayload,
  forgotPassword
);

router.post(
  "/reset-password",
  passwordRecoveryRateLimiter,
  validateResetPasswordPayload,
  resetPassword
);

export default router;
