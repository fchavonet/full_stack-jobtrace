import express from "express";

import {
  createTag,
  deleteTag,
  getTag,
  getTags,
  updateTag
} from "../controllers/tag.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

import {
  validateTagPayload,
  validateTagUpdatePayload
} from "../validators/tag.validator.js";

const router = express.Router();

router.get("/", authMiddleware, getTags);
router.post("/", authMiddleware, validateTagPayload, createTag);

router.get("/:id", authMiddleware, getTag);
router.patch("/:id", authMiddleware, validateTagUpdatePayload, updateTag);
router.delete("/:id", authMiddleware, deleteTag);

export default router;
