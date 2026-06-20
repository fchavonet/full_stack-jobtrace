import express from "express";

import {
  createApplication,
  deleteApplication,
  getApplication,
  getApplications,
  linkContactToApplication,
  unlinkContactFromApplication,
  updateApplication,
  linkTagToApplication,
  unlinkTagFromApplication,
  getApplicationHistory
} from "../controllers/application.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  validateApplicationContactPayload,
  validateApplicationPayload,
  validateApplicationUpdatePayload,
  validateApplicationTagPayload
} from "../validators/application.validator.js";

const router = express.Router();

router.get("/", authMiddleware, getApplications);
router.post("/", authMiddleware, validateApplicationPayload, createApplication);

router.get("/:id", authMiddleware, getApplication);
router.patch("/:id", authMiddleware, validateApplicationUpdatePayload, updateApplication);
router.delete("/:id", authMiddleware, deleteApplication);

router.post("/:id/contacts", authMiddleware, validateApplicationContactPayload, linkContactToApplication);
router.delete("/:id/contacts/:contactId", authMiddleware, unlinkContactFromApplication);

router.post("/:id/tags", authMiddleware, validateApplicationTagPayload, linkTagToApplication);
router.delete("/:id/tags/:tagId", authMiddleware, unlinkTagFromApplication);

router.get("/:id/history", authMiddleware, getApplicationHistory);

export default router;
