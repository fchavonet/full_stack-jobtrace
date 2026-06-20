import express from "express";

import {
  createApplication,
  deleteApplication,
  getApplication,
  getApplications,
  updateApplication
} from "../controllers/application.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  validateApplicationPayload,
  validateApplicationUpdatePayload
} from "../validators/application.validator.js";

const router = express.Router();

router.get("/", authMiddleware, getApplications);
router.post("/", authMiddleware, validateApplicationPayload, createApplication);
router.get("/:id", authMiddleware, getApplication);
router.patch("/:id", authMiddleware, validateApplicationUpdatePayload, updateApplication);
router.delete("/:id", authMiddleware, deleteApplication);

export default router;
