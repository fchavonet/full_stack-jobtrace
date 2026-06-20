import express from "express";

import {
  createApplication,
  deleteApplication,
  getApplication,
  getApplications,
  linkContactToApplication,
  unlinkContactFromApplication,
  updateApplication
} from "../controllers/application.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  validateApplicationContactPayload,
  validateApplicationPayload,
  validateApplicationUpdatePayload
} from "../validators/application.validator.js";

const router = express.Router();

router.get("/", authMiddleware, getApplications);
router.post("/", authMiddleware, validateApplicationPayload, createApplication);

router.get("/:id", authMiddleware, getApplication);
router.patch("/:id", authMiddleware, validateApplicationUpdatePayload, updateApplication);
router.delete("/:id", authMiddleware, deleteApplication);

router.post("/:id/contacts", authMiddleware, validateApplicationContactPayload, linkContactToApplication);
router.delete("/:id/contacts/:contactId", authMiddleware, unlinkContactFromApplication);

export default router;
