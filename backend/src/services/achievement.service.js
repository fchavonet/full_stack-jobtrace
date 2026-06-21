import prisma from "../config/prisma.js";

const defaultAchievements = [
  {
    name: "First application",
    slug: "first-application",
    description: "Create your first job application.",
    icon: "briefcase"
  },
  {
    name: "First tag",
    slug: "first-tag",
    description: "Create your first organization tag.",
    icon: "tag"
  },
  {
    name: "First contact",
    slug: "first-contact",
    description: "Create your first professional contact.",
    icon: "user"
  },
  {
    name: "First document",
    slug: "first-document",
    description: "Upload your first document.",
    icon: "file"
  },
  {
    name: "Application organized",
    slug: "application-organized",
    description: "Link a tag, a contact or a document to an application.",
    icon: "link"
  },
  {
    name: "Follow-up planned",
    slug: "follow-up-planned",
    description: "Create an application with a follow-up date.",
    icon: "calendar"
  },
  {
    name: "Five applications",
    slug: "five-applications",
    description: "Create five job applications.",
    icon: "target"
  }
];

function getAchievementOrder(slug) {
  const achievementIndex = defaultAchievements.findIndex((achievement) => {
    return achievement.slug === slug;
  });

  if (achievementIndex === -1) {
    return defaultAchievements.length;
  }

  return achievementIndex;
}

async function ensureDefaultAchievements() {
  for (const achievement of defaultAchievements) {
    await prisma.achievement.upsert({
      where: {
        slug: achievement.slug
      },
      update: {
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon
      },
      create: {
        name: achievement.name,
        slug: achievement.slug,
        description: achievement.description,
        icon: achievement.icon
      }
    });
  }
}

function sanitizeAchievement(achievement, unlockedAchievementMap) {
  let unlocked = false;
  let unlockedAt = null;

  if (unlockedAchievementMap.has(achievement.id)) {
    unlocked = true;
    unlockedAt = unlockedAchievementMap.get(achievement.id).unlockedAt;
  }

  return {
    id: achievement.id,
    name: achievement.name,
    slug: achievement.slug,
    description: achievement.description,
    icon: achievement.icon,
    unlocked,
    unlockedAt,
    createdAt: achievement.createdAt
  };
}

async function getUserAchievements(userId) {
  await ensureDefaultAchievements();

  const achievements = await prisma.achievement.findMany();

  achievements.sort((firstAchievement, secondAchievement) => {
    return getAchievementOrder(firstAchievement.slug) - getAchievementOrder(secondAchievement.slug);
  });

  const userAchievements = await prisma.userAchievement.findMany({
    where: {
      userId
    }
  });

  const unlockedAchievementMap = new Map();

  for (const userAchievement of userAchievements) {
    unlockedAchievementMap.set(userAchievement.achievementId, userAchievement);
  }

  return achievements.map((achievement) => {
    return sanitizeAchievement(achievement, unlockedAchievementMap);
  });
}

async function unlockAchievement(userId, slug) {
  await ensureDefaultAchievements();

  const achievement = await prisma.achievement.findUnique({
    where: {
      slug
    }
  });

  if (!achievement) {
    return null;
  }

  return prisma.userAchievement.upsert({
    where: {
      userId_achievementId: {
        userId,
        achievementId: achievement.id
      }
    },
    update: {},
    create: {
      userId,
      achievementId: achievement.id
    },
    include: {
      achievement: true
    }
  });
}

async function unlockFirstApplicationAchievement(userId) {
  return unlockAchievement(userId, "first-application");
}

async function unlockFirstTagAchievement(userId) {
  return unlockAchievement(userId, "first-tag");
}

async function unlockFirstContactAchievement(userId) {
  return unlockAchievement(userId, "first-contact");
}

async function unlockFirstDocumentAchievement(userId) {
  return unlockAchievement(userId, "first-document");
}

async function unlockApplicationOrganizedAchievement(userId) {
  return unlockAchievement(userId, "application-organized");
}

async function unlockFollowUpPlannedAchievement(userId) {
  return unlockAchievement(userId, "follow-up-planned");
}

async function unlockFiveApplicationsAchievement(userId) {
  const applicationCount = await prisma.application.count({
    where: {
      userId
    }
  });

  if (applicationCount < 5) {
    return null;
  }

  return unlockAchievement(userId, "five-applications");
}

export {
  defaultAchievements,
  getUserAchievements,
  unlockApplicationOrganizedAchievement,
  unlockFirstApplicationAchievement,
  unlockFirstContactAchievement,
  unlockFirstDocumentAchievement,
  unlockFirstTagAchievement,
  unlockFiveApplicationsAchievement,
  unlockFollowUpPlannedAchievement
};
