import jwt from "jsonwebtoken";

import env from "../config/env.js";
import prisma from "../config/prisma.js";

async function authMiddleware(request, response, next) {
  try {
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader) {
      return response.status(401).json({
        success: false,
        message: "Authentication token is required.",
        errors: []
      });
    }

    if (!authorizationHeader.startsWith("Bearer ")) {
      return response.status(401).json({
        success: false,
        message: "Authentication token format is invalid.",
        errors: []
      });
    }

    const token = authorizationHeader.replace("Bearer ", "");

    if (!token) {
      return response.status(401).json({
        success: false,
        message: "Authentication token is required.",
        errors: []
      });
    }

    const decodedToken = jwt.verify(token, env.jwtSecret);

    const user = await prisma.user.findUnique({
      where: {
        id: decodedToken.userId
      }
    });

    if (!user) {
      return response.status(401).json({
        success: false,
        message: "Authenticated user no longer exists.",
        errors: []
      });
    }

    request.user = {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified
    };

    next();
  } catch {
    response.status(401).json({
      success: false,
      message: "Authentication token is invalid or expired.",
      errors: []
    });
  }
}

export default authMiddleware;
