import express from "express";

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

export default router;
