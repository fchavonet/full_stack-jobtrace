import express from "express";

import {
  deleteDocument,
  downloadDocument,
  getDocument,
  getDocuments,
  updateDocument,
  uploadDocument
} from "../controllers/document.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import { uploadDocument as uploadDocumentFile } from "../middlewares/documentUpload.middleware.js";

import {
  validateDocumentPayload,
  validateDocumentUpdatePayload
} from "../validators/document.validator.js";

const router = express.Router();

router.get("/", authMiddleware, getDocuments);
router.post(
  "/",
  authMiddleware,
  uploadDocumentFile.single("document"),
  validateDocumentPayload,
  uploadDocument
);

router.get("/:id", authMiddleware, getDocument);
router.get("/:id/download", authMiddleware, downloadDocument);
router.patch("/:id", authMiddleware, validateDocumentUpdatePayload, updateDocument);
router.delete("/:id", authMiddleware, deleteDocument);

export default router;
