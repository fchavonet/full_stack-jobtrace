import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import env from "../config/env.js";
import prisma from "../config/prisma.js";

import {
  sendEmailVerificationEmail,
  sendPasswordResetEmail
} from "./email.service.js";

import { removeUserStoredFiles } from "./document.service.js";

const PASSWORD_SALT_ROUNDS = 12;
const EMAIL_VERIFICATION_TOKEN_BYTES = 32;
const EMAIL_VERIFICATION_EXPIRATION_HOURS = 24;
const PASSWORD_RESET_TOKEN_BYTES = 32;
const PASSWORD_RESET_EXPIRATION_HOURS = 1;

function getAuthModuleStatus() {
  return {
    module: "auth",
    status: "ready"
  };
}

function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: user.avatarUrl,
    emailVerified: user.emailVerified,
    theme: user.theme,
    dailyGoal: user.dailyGoal,
    followUpDelayDays: user.followUpDelayDays,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

function generateToken() {
  return crypto.randomBytes(EMAIL_VERIFICATION_TOKEN_BYTES).toString("hex");
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function getEmailVerificationExpirationDate() {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + EMAIL_VERIFICATION_EXPIRATION_HOURS);

  return expiresAt;
}

function getPasswordResetExpirationDate() {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + PASSWORD_RESET_EXPIRATION_HOURS);

  return expiresAt;
}

async function registerUser(payload) {
  const email = payload.email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: {
      email
    }
  });

  if (existingUser) {
    const error = new Error("Email is already registered.");
    error.statusCode = 409;

    throw error;
  }

  const passwordHash = await bcrypt.hash(payload.password, PASSWORD_SALT_ROUNDS);
  const verificationToken = generateToken();
  const verificationTokenHash = hashToken(verificationToken);
  const verificationExpiresAt = getEmailVerificationExpirationDate();

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      emailVerifyToken: verificationTokenHash,
      emailVerifyExpires: verificationExpiresAt
    }
  });

  await sendEmailVerificationEmail({
    email: user.email,
    token: verificationToken
  });

  return {
    user: sanitizeUser(user)
  };
}

async function verifyUserEmail(token) {
  const tokenHash = hashToken(token);

  const user = await prisma.user.findFirst({
    where: {
      emailVerifyToken: tokenHash
    }
  });

  if (!user) {
    const error = new Error("Email verification token is invalid.");
    error.statusCode = 400;

    throw error;
  }

  const now = new Date();

  if (!user.emailVerifyExpires || user.emailVerifyExpires < now) {
    const error = new Error("Email verification token has expired.");
    error.statusCode = 400;

    throw error;
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id
    },
    data: {
      emailVerified: true,
      emailVerifyToken: null,
      emailVerifyExpires: null
    }
  });

  return sanitizeUser(updatedUser);
}

function generateAuthToken(user) {
  if (!env.jwtSecret) {
    const error = new Error("JWT secret is not configured.");
    error.statusCode = 500;

    throw error;
  }

  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      authVersion: user.authVersion
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn
    }
  );
}

async function loginUser(payload) {
  const email = payload.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: {
      email
    }
  });

  if (!user) {
    const error = new Error("Invalid credentials.");
    error.statusCode = 401;

    throw error;
  }

  const passwordMatches = await bcrypt.compare(payload.password, user.passwordHash);

  if (!passwordMatches) {
    const error = new Error("Invalid credentials.");
    error.statusCode = 401;

    throw error;
  }

  if (!user.emailVerified) {
    const error = new Error("Email must be verified before login.");
    error.statusCode = 403;

    throw error;
  }

  const token = generateAuthToken(user);

  return {
    user: sanitizeUser(user),
    token
  };
}

async function getCurrentUser(userId) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;

    throw error;
  }

  return sanitizeUser(user);
}

async function requestPasswordReset(payload) {
  const email = payload.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: {
      email
    }
  });

  if (!user) {
    return true;
  }

  const resetToken = crypto.randomBytes(PASSWORD_RESET_TOKEN_BYTES).toString("hex");
  const resetTokenHash = hashToken(resetToken);
  const resetTokenExpires = getPasswordResetExpirationDate();

  await prisma.user.update({
    where: {
      id: user.id
    },
    data: {
      resetToken: resetTokenHash,
      resetTokenExpires
    }
  });

  await sendPasswordResetEmail({
    email: user.email,
    token: resetToken
  });

  return true;
}

async function resetUserPassword(payload) {
  const tokenHash = hashToken(payload.token);

  const user = await prisma.user.findFirst({
    where: {
      resetToken: tokenHash
    }
  });

  if (!user) {
    const error = new Error("Password reset token is invalid.");
    error.statusCode = 400;

    throw error;
  }

  const now = new Date();

  if (!user.resetTokenExpires || user.resetTokenExpires < now) {
    const error = new Error("Password reset token has expired.");
    error.statusCode = 400;

    throw error;
  }

  const passwordHash = await bcrypt.hash(payload.password, PASSWORD_SALT_ROUNDS);

  await prisma.user.update({
    where: {
      id: user.id
    },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpires: null,
      authVersion: {
        increment: 1
      }
    }
  });

  return true;
}

async function exportUserData(userId) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    },
    include: {
      applications: {
        include: {
          contacts: true,
          documents: true,
          tags: true,
          history: true
        }
      },
      contacts: true,
      documents: true,
      tags: true
    }
  });

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;

    throw error;
  }

  return {
    exportedAt: new Date(),
    user: sanitizeUser(user),
    applications: user.applications,
    contacts: user.contacts,
    documents: user.documents,
    tags: user.tags
  };
}

async function deleteUserAccount(userId) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;

    throw error;
  }

  await removeUserStoredFiles(userId);

  await prisma.user.delete({
    where: {
      id: userId
    }
  });

  return true;
}

export {
  deleteUserAccount,
  exportUserData,
  getAuthModuleStatus,
  getCurrentUser,
  loginUser,
  registerUser,
  requestPasswordReset,
  resetUserPassword,
  verifyUserEmail
};
