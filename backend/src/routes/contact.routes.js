import express from "express";

import {
  createContact,
  deleteContact,
  getContact,
  getContacts,
  updateContact
} from "../controllers/contact.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

import {
  validateContactPayload,
  validateContactUpdatePayload
} from "../validators/contact.validator.js";

const router = express.Router();

router.get("/", authMiddleware, getContacts);
router.post("/", authMiddleware, validateContactPayload, createContact);
router.get("/:id", authMiddleware, getContact);
router.patch("/:id", authMiddleware, validateContactUpdatePayload, updateContact);
router.delete("/:id", authMiddleware, deleteContact);

export default router;
