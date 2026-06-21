import express from "express";

import {
  createApplication,
  deleteApplication,
  getApplication,
  getApplicationHistory,
  getApplications,
  linkContactToApplication,
  linkDocumentToApplication,
  linkTagToApplication,
  unlinkContactFromApplication,
  unlinkDocumentFromApplication,
  unlinkTagFromApplication,
  updateApplication
} from "../controllers/application.controller.js";

import {
  validateApplicationContactPayload,
  validateApplicationDocumentPayload,
  validateApplicationPayload,
  validateApplicationTagPayload,
  validateApplicationUpdatePayload
} from "../validators/application.validator.js";

import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getApplications);
router.post("/", authMiddleware, validateApplicationPayload, createApplication);

router.get("/:id", authMiddleware, getApplication);
router.patch("/:id", authMiddleware, validateApplicationUpdatePayload, updateApplication);
router.delete("/:id", authMiddleware, deleteApplication);

router.post("/:id/tags", authMiddleware, validateApplicationTagPayload, linkTagToApplication);
router.delete("/:id/tags/:tagId", authMiddleware, unlinkTagFromApplication);

router.post("/:id/contacts", authMiddleware, validateApplicationContactPayload, linkContactToApplication);
router.delete("/:id/contacts/:contactId", authMiddleware, unlinkContactFromApplication);

router.post("/:id/documents", authMiddleware, validateApplicationDocumentPayload, linkDocumentToApplication);
router.delete("/:id/documents/:documentId", authMiddleware, unlinkDocumentFromApplication);

router.get("/:id/history", authMiddleware, getApplicationHistory);

export default router;
