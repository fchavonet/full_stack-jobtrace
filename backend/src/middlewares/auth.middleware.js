import jwt from "jsonwebtoken";

import env from "../config/env.js";
import prisma from "../config/prisma.js";

function getCookieValue(request, cookieName) {
  const cookieHeader = request.headers.cookie;

  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";");

  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.trim().split("=");

    if (name === cookieName) {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return null;
}

function getBearerToken(request) {
  const authorizationHeader = request.headers.authorization;

  if (!authorizationHeader) {
    return null;
  }

  if (!authorizationHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authorizationHeader.replace("Bearer ", "").trim();

  if (!token) {
    return null;
  }

  return token;
}

async function authMiddleware(request, response, next) {
  try {
    const cookieToken = getCookieValue(
      request,
      env.authCookieName
    );

    const bearerToken = getBearerToken(request);

    let token = cookieToken;

    if (!token) {
      token = bearerToken;
    }

    if (!token) {
      return response.status(401).json({
        success: false,
        message: "Authentication token is required.",
        errors: []
      });
    }

    const decodedToken = jwt.verify(
      token,
      env.jwtSecret
    );

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
