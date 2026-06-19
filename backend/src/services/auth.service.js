import bcrypt from "bcrypt";

import prisma from "../config/prisma.js";

const PASSWORD_SALT_ROUNDS = 12;

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

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash
    }
  });

  return sanitizeUser(user);
}

export {
  getAuthModuleStatus,
  registerUser
};
