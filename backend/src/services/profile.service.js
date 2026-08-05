import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";

const PASSWORD_SALT_ROUNDS = 12;

function sanitizeProfile(user) {
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

async function getUserProfile(userId) {
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

  return sanitizeProfile(user);
}

async function updateUserProfile(userId, payload) {
  const user = await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      firstName: payload.firstName,
      lastName: payload.lastName,
      avatarUrl: payload.avatarUrl
    }
  });

  return sanitizeProfile(user);
}

async function updateUserSettings(userId, payload) {
  const user = await prisma.user.update({
    where: {
      id: userId
    },
    data: payload.settingsData
  });

  return sanitizeProfile(user);
}

async function updateUserPassword(userId, payload) {
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

  const passwordMatches = await bcrypt.compare(payload.currentPassword, user.passwordHash);

  if (!passwordMatches) {
    const error = new Error("Current password is incorrect.");
    error.statusCode = 401;

    throw error;
  }

  const passwordHash = await bcrypt.hash(payload.newPassword, PASSWORD_SALT_ROUNDS);

  await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      passwordHash,
      authVersion: {
        increment: 1
      }
    }
  });

  return true;
}

export {
  getUserProfile,
  updateUserPassword,
  updateUserProfile,
  updateUserSettings
};
