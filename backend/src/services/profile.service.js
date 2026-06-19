import prisma from "../config/prisma.js";

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

export {
  getUserProfile,
  updateUserProfile
};
