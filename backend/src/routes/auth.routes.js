import express from "express";

import { getAuthStatus } from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/status", getAuthStatus);

export default router;
