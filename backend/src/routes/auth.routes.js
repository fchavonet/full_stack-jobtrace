import express from "express";

import {
  getAuthStatus,
  register
} from "../controllers/auth.controller.js";
import { validateRegisterPayload } from "../validators/auth.validator.js";

const router = express.Router();

router.get("/status", getAuthStatus);
router.post("/register", validateRegisterPayload, register);

export default router;
