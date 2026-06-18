import express from "express";

import databasePool from "../config/database.js";

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
    await databasePool.query("SELECT 1");

    response.status(200).json({
      success: true,
      message: "Database connection is working.",
      data: {
        status: "ok"
      }
    });
  } catch (error) {
    response.status(503).json({
      success: false,
      message: "Database connection failed.",
      errors: []
    });
  }
});

export default router;
