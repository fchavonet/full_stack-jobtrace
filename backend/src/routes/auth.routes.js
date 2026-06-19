import express from "express";

import {
  getAuthStatus,
  register,
  verifyEmail
} from "../controllers/auth.controller.js";
import {
  validateEmailVerificationPayload,
  validateRegisterPayload
} from "../validators/auth.validator.js";

const router = express.Router();

router.get("/status", getAuthStatus);
router.post("/register", validateRegisterPayload, register);
router.get("/verify-email", validateEmailVerificationPayload, verifyEmail);

export default router;
