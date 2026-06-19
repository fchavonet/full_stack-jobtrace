import express from "express";

import prisma from "../config/prisma.js";

const router = express.Router();

router.get("/", function (request, response) {
  response.status(200).json({
    success: true,
    message: "API is running.",
    data: {
      status: "ok"
    }
  });
});

router.get("/db", async function (request, response) {
  try {
    await prisma.$queryRaw`SELECT 1`;

    response.status(200).json({
      success: true,
      message: "Database connection is working.",
      data: {
        status: "ok"
      }
    });
  } catch {
    response.status(503).json({
      success: false,
      message: "Database connection failed.",
      errors: []
    });
  }
});

export default router;
