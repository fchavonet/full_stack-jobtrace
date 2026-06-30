const DEFAULT_DAILY_GOAL = 5;

export const JOB_SEARCH_LINKS = [
  {
    key: "france-travail",
    label: "France Travail",
    description: "Offres généralistes",
    url: "https://candidat.francetravail.fr/offres/emploi",
  },
  {
    key: "apec",
    label: "Apec",
    description: "Cadres et diplômés",
    url: "https://www.apec.fr/candidat/recherche-emploi.html/emploi",
  },
  {
    key: "hellowork",
    label: "HelloWork",
    description: "Jobboard français",
    url: "https://www.hellowork.com/fr-fr/emploi.html",
  },
  {
    key: "indeed",
    label: "Indeed",
    description: "Moteur d'offres",
    url: "https://fr.indeed.com/",
  },
  {
    key: "wttj",
    label: "Welcome to the Jungle",
    description: "Entreprises et offres",
    url: "https://www.welcometothejungle.com/fr/jobs",
  },
  {
    key: "linkedin",
    label: "LinkedIn Jobs",
    description: "Réseau professionnel",
    url: "https://www.linkedin.com/jobs/",
  },
];

function getTextValue(value) {
  if (typeof value === "string") {
    return value;
  }

  return "";
}

function getNumberValue(value, defaultValue) {
  const numberValue = Number(value);

  if (Number.isFinite(numberValue) && numberValue > 0) {
    return numberValue;
  }

  return defaultValue;
}

function getProfileValue(profile, camelKey, snakeKey) {
  if (profile && profile[camelKey]) {
    return profile[camelKey];
  }

  if (profile && profile[snakeKey]) {
    return profile[snakeKey];
  }

  return "";
}

function getDateFromValue(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function getStartOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return today;
}

function getDateKey(value) {
  const date = getDateFromValue(value);

  if (!date) {
    return "";
  }

  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return year + "-" + month + "-" + day;
}

function getTodayDateKey() {
  return getDateKey(new Date());
}

function getApplicationDateValue(application, camelKey, snakeKey) {
  if (application && application[camelKey]) {
    return application[camelKey];
  }

  if (application && application[snakeKey]) {
    return application[snakeKey];
  }

  return "";
}

function sortEntriesByDate(firstEntry, secondEntry) {
  const firstDate = getDateFromValue(firstEntry.date);
  const secondDate = getDateFromValue(secondEntry.date);

  if (!firstDate && !secondDate) {
    return 0;
  }

  if (!firstDate) {
    return 1;
  }

  if (!secondDate) {
    return -1;
  }

  return firstDate.getTime() - secondDate.getTime();
}

function sortApplicationsByCreatedAt(firstApplication, secondApplication) {
  const firstDate = getDateFromValue(getApplicationCreatedAt(firstApplication));
  const secondDate = getDateFromValue(getApplicationCreatedAt(secondApplication));

  if (!firstDate && !secondDate) {
    return 0;
  }

  if (!firstDate) {
    return 1;
  }

  if (!secondDate) {
    return -1;
  }

  return secondDate.getTime() - firstDate.getTime();
}

function getApplicationIsFinal(application) {
  const status = getApplicationStatus(application);

  if (status === "accepted") {
    return true;
  }

  if (status === "rejected") {
    return true;
  }

  return false;
}

function buildUpcomingEntries(applications, dateGetter, limit) {
  const today = getStartOfToday();
  const entries = [];

  applications.forEach(function (application) {
    if (getApplicationIsFinal(application)) {
      return;
    }

    const dateValue = dateGetter(application);
    const date = getDateFromValue(dateValue);

    if (!date) {
      return;
    }

    if (date < today) {
      return;
    }

    entries.push({
      application,
      date: dateValue,
    });
  });

  return entries.sort(sortEntriesByDate).slice(0, limit);
}

export function getDashboardDisplayName(profile, user) {
  const firstName = getTextValue(getProfileValue(profile, "firstName", "first_name")).trim();
  const lastName = getTextValue(getProfileValue(profile, "lastName", "last_name")).trim();
  const fullName = [firstName, lastName].join(" ").trim();

  if (fullName) {
    return fullName;
  }

  const profileEmail = getTextValue(getProfileValue(profile, "email", "email")).trim();

  if (profileEmail) {
    return profileEmail;
  }

  if (user && user.email) {
    return user.email;
  }

  return "Utilisateur";
}

export function getDashboardDailyGoal(profile) {
  if (profile && profile.dailyGoal) {
    return getNumberValue(profile.dailyGoal, DEFAULT_DAILY_GOAL);
  }

  if (profile && profile.daily_goal) {
    return getNumberValue(profile.daily_goal, DEFAULT_DAILY_GOAL);
  }

  return DEFAULT_DAILY_GOAL;
}

export function getApplicationStatus(application) {
  if (application && application.status) {
    return application.status;
  }

  return "sent";
}

export function getApplicationCreatedAt(application) {
  return getApplicationDateValue(application, "createdAt", "created_at");
}

export function getApplicationSentAt(application) {
  return getApplicationDateValue(application, "sentAt", "sent_at");
}

export function getApplicationFollowUpAt(application) {
  return getApplicationDateValue(application, "followUpAt", "follow_up_at");
}

export function getApplicationInterviewAt(application) {
  return getApplicationDateValue(application, "interviewAt", "interview_at");
}

export function getApplicationTitle(application) {
  if (!application) {
    return "Candidature";
  }

  if (application.company && application.position) {
    return application.company + " — " + application.position;
  }

  if (application.company) {
    return application.company;
  }

  if (application.position) {
    return application.position;
  }

  return "Candidature";
}

export function getApplicationCompany(application) {
  if (application && application.company) {
    return application.company;
  }

  return "Entreprise non renseignée";
}

export function getApplicationPosition(application) {
  if (application && application.position) {
    return application.position;
  }

  return "Poste non renseigné";
}

export function getApplicationDashboardLink(application) {
  if (application && application.id) {
    return "/dashboard/applications?application=" + application.id;
  }

  return "/dashboard/applications";
}

export function formatDashboardDate(value) {
  const date = getDateFromValue(value);

  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

export function getDailyObjectiveSummary(applications, profile) {
  const todayKey = getTodayDateKey();
  const dailyGoal = getDashboardDailyGoal(profile);

  let completedToday = 0;

  applications.forEach(function (application) {
    const createdAt = getApplicationCreatedAt(application);

    if (getDateKey(createdAt) === todayKey) {
      completedToday += 1;
    }
  });

  let progress = 0;

  if (dailyGoal > 0) {
    progress = Math.round((completedToday / dailyGoal) * 100);
  }

  if (progress > 100) {
    progress = 100;
  }

  let remaining = dailyGoal - completedToday;

  if (remaining < 0) {
    remaining = 0;
  }

  return {
    dailyGoal,
    completedToday,
    progress,
    remaining,
  };
}

export function getUpcomingFollowUps(applications, limit) {
  return buildUpcomingEntries(applications, getApplicationFollowUpAt, limit);
}

export function getUpcomingInterviews(applications, limit) {
  return buildUpcomingEntries(applications, getApplicationInterviewAt, limit);
}

export function getLatestApplications(applications, limit) {
  return applications.slice().sort(sortApplicationsByCreatedAt).slice(0, limit);
}
