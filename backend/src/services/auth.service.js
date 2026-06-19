import bcrypt from "bcrypt";
import crypto from "crypto";

import prisma from "../config/prisma.js";

const PASSWORD_SALT_ROUNDS = 12;
const EMAIL_VERIFICATION_TOKEN_BYTES = 32;
const EMAIL_VERIFICATION_EXPIRATION_HOURS = 24;

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

  return {
    user: sanitizeUser(user),
    verificationToken
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

export {
  getAuthModuleStatus,
  registerUser,
  verifyUserEmail
};
