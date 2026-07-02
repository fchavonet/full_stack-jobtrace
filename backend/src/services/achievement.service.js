import prisma from "../config/prisma.js";

const DEFAULT_DAILY_GOAL = 5;
const MONTHLY_GOAL_DAYS = 30;
const MONTHLY_APPLICATION_GOAL = 30;

const defaultAchievements = [
  {
    name: "Première candidature enregistrée",
    slug: "first-application",
    description: "Enregistrer votre première candidature dans JobTrace.",
    icon: "briefcase"
  },
  {
    name: "Première relance enregistrée",
    slug: "first-follow-up",
    description: "Ajouter une première date de relance à une candidature.",
    icon: "bell"
  },
  {
    name: "Premier tag ajouté",
    slug: "first-tag",
    description: "Créer votre premier tag d’organisation.",
    icon: "tag"
  },
  {
    name: "Premier contact ajouté",
    slug: "first-contact",
    description: "Ajouter votre premier contact professionnel.",
    icon: "user"
  },
  {
    name: "Premier document ajouté",
    slug: "first-document",
    description: "Importer votre premier document de candidature.",
    icon: "file"
  },
  {
    name: "Premier entretien décroché",
    slug: "first-interview",
    description: "Enregistrer votre premier entretien dans une candidature.",
    icon: "calendar-check"
  },
  {
    name: "Premier objectif journalier réussi",
    slug: "first-daily-goal",
    description: "Atteindre votre objectif quotidien de candidatures pour la première fois.",
    icon: "goal"
  },
  {
    name: "Premier objectif mensuel réussi",
    slug: "first-monthly-goal",
    description: "Enregistrer au moins 30 candidatures sur les 30 derniers jours.",
    icon: "calendar"
  },
  {
    name: "10 candidatures enregistrées",
    slug: "ten-applications",
    description: "Enregistrer au moins 10 candidatures dans JobTrace.",
    icon: "target"
  },
  {
    name: "50 candidatures enregistrées",
    slug: "fifty-applications",
    description: "Enregistrer au moins 50 candidatures dans JobTrace.",
    icon: "trophy"
  }
];

function getDefaultAchievementSlugs() {
  return defaultAchievements.map((achievement) => {
    return achievement.slug;
  });
}

function getAchievementOrder(slug) {
  const achievementIndex = defaultAchievements.findIndex((achievement) => {
    return achievement.slug === slug;
  });

  if (achievementIndex === -1) {
    return defaultAchievements.length;
  }

  return achievementIndex;
}

function getStartOfDay(dateValue) {
  const date = new Date(dateValue);

  date.setHours(0, 0, 0, 0);

  return date;
}

function getStartOfNextDay(dateValue) {
  const date = getStartOfDay(dateValue);

  date.setDate(date.getDate() + 1);

  return date;
}

function getStartOfMonthlyGoalPeriod(dateValue) {
  const date = getStartOfDay(dateValue);

  date.setDate(date.getDate() - (MONTHLY_GOAL_DAYS - 1));

  return date;
}

function getSafeDailyGoal(value) {
  const numberValue = Number(value);

  if (Number.isFinite(numberValue) && numberValue > 0) {
    return Math.round(numberValue);
  }

  return DEFAULT_DAILY_GOAL;
}

async function getUserDailyGoal(userId) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    },
    select: {
      dailyGoal: true
    }
  });

  if (!user) {
    return DEFAULT_DAILY_GOAL;
  }

  return getSafeDailyGoal(user.dailyGoal);
}

async function countUserApplications(userId) {
  return prisma.application.count({
    where: {
      userId
    }
  });
}

async function countUserApplicationsBetween(userId, startDate, endDate) {
  return prisma.application.count({
    where: {
      userId,
      createdAt: {
        gte: startDate,
        lt: endDate
      }
    }
  });
}

async function countUserApplicationsSince(userId, startDate) {
  return prisma.application.count({
    where: {
      userId,
      createdAt: {
        gte: startDate
      }
    }
  });
}

async function countUserTags(userId) {
  return prisma.tag.count({
    where: {
      userId
    }
  });
}

async function countUserContacts(userId) {
  return prisma.contact.count({
    where: {
      userId
    }
  });
}

async function countUserDocuments(userId) {
  return prisma.document.count({
    where: {
      userId
    }
  });
}

async function hasUserFollowUp(userId) {
  const application = await prisma.application.findFirst({
    where: {
      userId,
      followUpAt: {
        not: null
      }
    }
  });

  if (!application) {
    return false;
  }

  return true;
}

async function hasUserInterview(userId) {
  const application = await prisma.application.findFirst({
    where: {
      userId,
      OR: [
        {
          interviewAt: {
            not: null
          }
        },
        {
          status: "interview"
        }
      ]
    }
  });

  if (!application) {
    return false;
  }

  return true;
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

async function unlockFirstFollowUpAchievement(userId) {
  const userHasFollowUp = await hasUserFollowUp(userId);

  if (!userHasFollowUp) {
    return null;
  }

  return unlockAchievement(userId, "first-follow-up");
}

async function unlockFirstTagAchievement(userId) {
  const tagCount = await countUserTags(userId);

  if (tagCount < 1) {
    return null;
  }

  return unlockAchievement(userId, "first-tag");
}

async function unlockFirstContactAchievement(userId) {
  const contactCount = await countUserContacts(userId);

  if (contactCount < 1) {
    return null;
  }

  return unlockAchievement(userId, "first-contact");
}

async function unlockFirstDocumentAchievement(userId) {
  const documentCount = await countUserDocuments(userId);

  if (documentCount < 1) {
    return null;
  }

  return unlockAchievement(userId, "first-document");
}

async function unlockFirstInterviewAchievement(userId) {
  const userHasInterview = await hasUserInterview(userId);

  if (!userHasInterview) {
    return null;
  }

  return unlockAchievement(userId, "first-interview");
}

async function unlockFirstDailyGoalAchievement(userId) {
  const dailyGoal = await getUserDailyGoal(userId);
  const today = new Date();
  const startDate = getStartOfDay(today);
  const endDate = getStartOfNextDay(today);

  const applicationsCount = await countUserApplicationsBetween(
    userId,
    startDate,
    endDate
  );

  if (applicationsCount < dailyGoal) {
    return null;
  }

  return unlockAchievement(userId, "first-daily-goal");
}

async function unlockFirstMonthlyGoalAchievement(userId) {
  const startDate = getStartOfMonthlyGoalPeriod(new Date());

  const applicationsCount = await countUserApplicationsSince(userId, startDate);

  if (applicationsCount < MONTHLY_APPLICATION_GOAL) {
    return null;
  }

  return unlockAchievement(userId, "first-monthly-goal");
}

async function unlockTenApplicationsAchievement(userId) {
  const applicationCount = await countUserApplications(userId);

  if (applicationCount < 10) {
    return null;
  }

  return unlockAchievement(userId, "ten-applications");
}

async function unlockFiftyApplicationsAchievement(userId) {
  const applicationCount = await countUserApplications(userId);

  if (applicationCount < 50) {
    return null;
  }

  return unlockAchievement(userId, "fifty-applications");
}

async function syncUserAchievements(userId) {
  const applicationCount = await countUserApplications(userId);

  if (applicationCount >= 1) {
    await unlockAchievement(userId, "first-application");
  }

  if (applicationCount >= 10) {
    await unlockAchievement(userId, "ten-applications");
  }

  if (applicationCount >= 50) {
    await unlockAchievement(userId, "fifty-applications");
  }

  await unlockFirstFollowUpAchievement(userId);
  await unlockFirstTagAchievement(userId);
  await unlockFirstContactAchievement(userId);
  await unlockFirstDocumentAchievement(userId);
  await unlockFirstInterviewAchievement(userId);
  await unlockFirstDailyGoalAchievement(userId);
  await unlockFirstMonthlyGoalAchievement(userId);
}

async function getUserAchievements(userId) {
  await ensureDefaultAchievements();
  await syncUserAchievements(userId);

  const achievements = await prisma.achievement.findMany({
    where: {
      slug: {
        in: getDefaultAchievementSlugs()
      }
    }
  });

  achievements.sort((firstAchievement, secondAchievement) => {
    return getAchievementOrder(firstAchievement.slug)
      - getAchievementOrder(secondAchievement.slug);
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

async function unlockApplicationProgressAchievements(userId) {
  await unlockFirstApplicationAchievement(userId);
  await unlockTenApplicationsAchievement(userId);
  await unlockFiftyApplicationsAchievement(userId);
  await unlockFirstFollowUpAchievement(userId);
  await unlockFirstInterviewAchievement(userId);
  await unlockFirstDailyGoalAchievement(userId);
  await unlockFirstMonthlyGoalAchievement(userId);
}

async function unlockApplicationOrganizedAchievement() {
  return null;
}

async function unlockFollowUpPlannedAchievement(userId) {
  return unlockFirstFollowUpAchievement(userId);
}

async function unlockFiveApplicationsAchievement(userId) {
  return unlockTenApplicationsAchievement(userId);
}

export {
  defaultAchievements,
  getUserAchievements,
  unlockApplicationOrganizedAchievement,
  unlockApplicationProgressAchievements,
  unlockFiftyApplicationsAchievement,
  unlockFirstApplicationAchievement,
  unlockFirstContactAchievement,
  unlockFirstDailyGoalAchievement,
  unlockFirstDocumentAchievement,
  unlockFirstFollowUpAchievement,
  unlockFirstInterviewAchievement,
  unlockFirstMonthlyGoalAchievement,
  unlockFirstTagAchievement,
  unlockFiveApplicationsAchievement,
  unlockFollowUpPlannedAchievement,
  unlockTenApplicationsAchievement
};
