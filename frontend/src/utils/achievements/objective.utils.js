const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

export function getSafeDailyGoal(value) {
  const numberValue = Number(value);

  if (Number.isFinite(numberValue) && numberValue > 0) {
    return Math.round(numberValue);
  }

  return 5;
}

export function getDateKey(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return year + "-" + month + "-" + day;
}

export function getApplicationCreatedAt(application) {
  if (application && application.createdAt) {
    return application.createdAt;
  }

  if (application && application.created_at) {
    return application.created_at;
  }

  return "";
}

export function countApplicationsForDate(applications, dateValue) {
  const targetDateKey = getDateKey(dateValue);

  return applications.filter(function (application) {
    const createdAt = getApplicationCreatedAt(application);

    return getDateKey(createdAt) === targetDateKey;
  }).length;
}

export function getObjectiveProgress(count, dailyGoal) {
  const safeDailyGoal = getSafeDailyGoal(dailyGoal);
  const percent = Math.round((count / safeDailyGoal) * 100);

  if (percent > 100) {
    return 100;
  }

  return percent;
}

export function getObjectiveProgressLabel(count, dailyGoal) {
  const safeDailyGoal = getSafeDailyGoal(dailyGoal);

  if (count >= safeDailyGoal) {
    return "Objectif atteint";
  }

  const remaining = safeDailyGoal - count;

  if (remaining === 1) {
    return "Encore 1 candidature pour atteindre votre objectif.";
  }

  return "Encore " + remaining + " candidatures pour atteindre votre objectif.";
}

export function buildLastThirtyDaysActivity(applications, dailyGoal) {
  const days = [];
  const today = new Date();

  for (let index = 29; index >= 0; index -= 1) {
    const date = new Date(today.getTime() - index * DAY_IN_MILLISECONDS);
    const dateKey = getDateKey(date);
    const count = countApplicationsForDate(applications, date);

    days.push({
      date: dateKey,
      day: date.getDate(),
      count,
      progress: getObjectiveProgress(count, dailyGoal),
      reached: count >= getSafeDailyGoal(dailyGoal),
    });
  }

  return days;
}

export function getReachedDaysCount(activity) {
  return activity.filter(function (day) {
    return day.reached;
  }).length;
}

export function getApplicationsCountFromActivity(activity) {
  return activity.reduce(function (total, day) {
    return total + day.count;
  }, 0);
}

export function getBestDayCount(activity) {
  return activity.reduce(function (bestCount, day) {
    if (day.count > bestCount) {
      return day.count;
    }

    return bestCount;
  }, 0);
}

export function normalizeAchievement(achievement, applicationsCount, reachedDaysCount) {
  const normalizedAchievement = {
    id: getAchievementId(achievement),
    key: getAchievementKey(achievement),
    name: getAchievementName(achievement),
    description: getAchievementDescription(achievement),
    unlocked: getAchievementUnlocked(achievement),
    unlockedAt: getAchievementUnlockedAt(achievement),
  };

  if (!normalizedAchievement.unlocked) {
    normalizedAchievement.unlocked = getComputedAchievementUnlocked(
      normalizedAchievement.key,
      applicationsCount,
      reachedDaysCount,
    );
  }

  return normalizedAchievement;
}

export function normalizeAchievements(achievements, applicationsCount, reachedDaysCount) {
  if (!Array.isArray(achievements) || achievements.length === 0) {
    return getDefaultAchievements(applicationsCount, reachedDaysCount);
  }

  return achievements.map(function (achievement) {
    return normalizeAchievement(achievement, applicationsCount, reachedDaysCount);
  });
}

function getDefaultAchievements(applicationsCount, reachedDaysCount) {
  const defaultAchievements = [
    {
      id: "first-application",
      key: "first_application",
      name: "Premier pas",
      description: "Créer votre première candidature.",
    },
    {
      id: "ten-applications",
      key: "ten_applications",
      name: "Rythme lancé",
      description: "Créer 10 candidatures.",
    },
    {
      id: "fifty-applications",
      key: "fifty_applications",
      name: "Recherche intensive",
      description: "Créer 50 candidatures.",
    },
    {
      id: "five-daily-goals",
      key: "five_daily_goals",
      name: "Régularité",
      description: "Atteindre votre objectif quotidien 5 fois sur les 30 derniers jours.",
    },
  ];

  return defaultAchievements.map(function (achievement) {
    return normalizeAchievement(achievement, applicationsCount, reachedDaysCount);
  });
}

function getAchievementId(achievement) {
  if (achievement && achievement.id) {
    return achievement.id;
  }

  if (achievement && achievement.key) {
    return achievement.key;
  }

  if (achievement && achievement.name) {
    return achievement.name;
  }

  return "achievement";
}

function getAchievementKey(achievement) {
  if (achievement && achievement.key) {
    return achievement.key;
  }

  return "";
}

function getAchievementName(achievement) {
  if (achievement && achievement.name) {
    return achievement.name;
  }

  if (achievement && achievement.title) {
    return achievement.title;
  }

  return "Badge";
}

function getAchievementDescription(achievement) {
  if (achievement && achievement.description) {
    return achievement.description;
  }

  return "Achievement lié à votre activité.";
}

function getAchievementUnlocked(achievement) {
  if (!achievement) {
    return false;
  }

  if (achievement.unlocked === true) {
    return true;
  }

  if (achievement.isUnlocked === true) {
    return true;
  }

  if (achievement.unlockedAt) {
    return true;
  }

  if (achievement.unlocked_at) {
    return true;
  }

  return false;
}

function getAchievementUnlockedAt(achievement) {
  if (achievement && achievement.unlockedAt) {
    return achievement.unlockedAt;
  }

  if (achievement && achievement.unlocked_at) {
    return achievement.unlocked_at;
  }

  return "";
}

function getComputedAchievementUnlocked(key, applicationsCount, reachedDaysCount) {
  if (key === "first_application") {
    return applicationsCount >= 1;
  }

  if (key === "ten_applications") {
    return applicationsCount >= 10;
  }

  if (key === "fifty_applications") {
    return applicationsCount >= 50;
  }

  if (key === "five_daily_goals") {
    return reachedDaysCount >= 5;
  }

  return false;
}