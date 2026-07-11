import {
  APPLICATION_CONTRACT_TYPE_OPTIONS,
  APPLICATION_STATUS_OPTIONS,
} from "../../constants/application.constants";
import {
  getApplicationContractTypeLabel,
  getApplicationStatusLabel,
} from "../applications/display.utils";
import {
  getApplicationContacts,
  getApplicationDocuments,
  getApplicationTags,
} from "../applications/relations.utils";

const MONTH_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  month: "short",
  year: "numeric",
});

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

export function getPercent(value, total) {
  if (!total) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

export function getPercentLabel(value, total) {
  return getPercent(value, total) + " %";
}

export function getProgressWidth(value, maxValue) {
  if (!maxValue) {
    return "0%";
  }

  const percent = Math.round((value / maxValue) * 100);

  if (percent === 0) {
    return "0%";
  }

  if (percent < 8) {
    return "8%";
  }

  return percent + "%";
}

export function getBarHeight(value, maxValue) {
  if (!maxValue) {
    return "8px";
  }

  const percent = Math.round((value / maxValue) * 100);

  if (percent === 0) {
    return "8px";
  }

  if (percent < 12) {
    return "12%";
  }

  return percent + "%";
}

export function getMaxCount(rows) {
  return rows.reduce(function (maxValue, row) {
    if (row.count > maxValue) {
      return row.count;
    }

    return maxValue;
  }, 0);
}

export function getApplicationStatus(application) {
  if (application && application.status) {
    return application.status;
  }

  return "";
}

export function getApplicationContractType(application) {
  if (application && application.contractType) {
    return application.contractType;
  }

  return "";
}

export function getApplicationSentAt(application) {
  if (application && application.sentAt) {
    return application.sentAt;
  }

  if (application && application.sent_at) {
    return application.sent_at;
  }

  return "";
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

export function getApplicationFollowUpAt(application) {
  if (application && application.followUpAt) {
    return application.followUpAt;
  }

  if (application && application.follow_up_at) {
    return application.follow_up_at;
  }

  return "";
}

export function getApplicationInterviewAt(application) {
  if (application && application.interviewAt) {
    return application.interviewAt;
  }

  if (application && application.interview_at) {
    return application.interview_at;
  }

  return "";
}

export function getApplicationIsFinal(application) {
  const status = getApplicationStatus(application);

  if (status === "accepted") {
    return true;
  }

  if (status === "rejected") {
    return true;
  }

  return false;
}

export function getApplicationHasInterview(application) {
  if (getApplicationStatus(application) === "interview") {
    return true;
  }

  if (getApplicationInterviewAt(application)) {
    return true;
  }

  return false;
}

export function getApplicationHasContact(application) {
  return getApplicationContacts(application).length > 0;
}

export function getApplicationHasDocument(application) {
  return getApplicationDocuments(application).length > 0;
}

export function getApplicationHasTag(application) {
  return getApplicationTags(application).length > 0;
}

export function getApplicationHasNotes(application) {
  if (application && application.notes && application.notes.trim().length > 0) {
    return true;
  }

  return false;
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

export function getMonthKey(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return year + "-" + month;
}

export function getMonthLabelFromKey(monthKey) {
  const parts = monthKey.split("-");

  if (parts.length !== 2) {
    return "Non daté";
  }

  const year = Number(parts[0]);
  const month = Number(parts[1]);

  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    return "Non daté";
  }

  const date = new Date(year, month - 1, 1);
  const label = MONTH_FORMATTER.format(date);

  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function getLastMonths(count) {
  const months = [];
  const today = new Date();

  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth() - index, 1);
    const monthKey = getMonthKey(date);

    months.push({
      key: monthKey,
      label: getMonthLabelFromKey(monthKey),
      count: 0,
    });
  }

  return months;
}

export function getApplicationsFromLastDays(applications, daysCount) {
  const today = new Date();
  const startTimestamp = today.getTime() - daysCount * DAY_IN_MILLISECONDS;

  return applications.filter(function (application) {
    const createdAt = getApplicationCreatedAt(application);
    const sentAt = getApplicationSentAt(application);
    let dateValue = createdAt;

    if (!dateValue) {
      dateValue = sentAt;
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return false;
    }

    return date.getTime() >= startTimestamp;
  });
}

export function getStatisticsSummary(applications) {
  const total = applications.length;

  const accepted = applications.filter(function (application) {
    return getApplicationStatus(application) === "accepted";
  }).length;

  const rejected = applications.filter(function (application) {
    return getApplicationStatus(application) === "rejected";
  }).length;

  const interviews = applications.filter(function (application) {
    return getApplicationHasInterview(application);
  }).length;

  const followUps = applications.filter(function (application) {
    return Boolean(getApplicationFollowUpAt(application));
  }).length;

  const withContacts = applications.filter(function (application) {
    return getApplicationHasContact(application);
  }).length;

  const withDocuments = applications.filter(function (application) {
    return getApplicationHasDocument(application);
  }).length;

  const withTags = applications.filter(function (application) {
    return getApplicationHasTag(application);
  }).length;

  const withNotes = applications.filter(function (application) {
    return getApplicationHasNotes(application);
  }).length;

  const recentApplications = getApplicationsFromLastDays(applications, 30);
  const active = total - accepted - rejected;

  return {
    total,
    active,
    accepted,
    rejected,
    interviews,
    followUps,
    withContacts,
    withDocuments,
    withTags,
    withNotes,
    recentCount: recentApplications.length,
    successRate: getPercent(accepted, total),
    interviewRate: getPercent(interviews, total),
  };
}

export function getStatusRows(applications) {
  const rows = APPLICATION_STATUS_OPTIONS.map(function (option) {
    const count = applications.filter(function (application) {
      return getApplicationStatus(application) === option.value;
    }).length;

    return {
      key: option.value,
      label: option.label,
      count,
      percent: getPercent(count, applications.length),
    };
  });

  return rows.filter(function (row) {
    return row.count > 0;
  });
}

export function getContractTypeRows(applications) {
  return APPLICATION_CONTRACT_TYPE_OPTIONS.map(function (option) {
    const count = applications.filter(function (application) {
      return getApplicationContractType(application) === option.value;
    }).length;

    return {
      key: option.value || "empty",
      label: option.label,
      count,
      percent: getPercent(count, applications.length),
    };
  });
}

export function getMonthRows(applications, monthsCount) {
  const rows = getLastMonths(monthsCount);

  applications.forEach(function (application) {
    const sentAt = getApplicationSentAt(application);
    const monthKey = getMonthKey(sentAt);

    rows.forEach(function (row) {
      if (row.key === monthKey) {
        row.count += 1;
      }
    });
  });

  return rows;
}

export function getCompanyRows(applications) {
  const counts = {};

  applications.forEach(function (application) {
    let company = "Non renseigné";

    if (application.company) {
      company = application.company;
    }

    if (!counts[company]) {
      counts[company] = 0;
    }

    counts[company] += 1;
  });

  return Object.entries(counts)
    .map(function (entry) {
      return {
        key: entry[0],
        label: entry[0],
        count: entry[1],
      };
    })
    .sort(function (firstRow, secondRow) {
      return secondRow.count - firstRow.count;
    })
    .slice(0, 6);
}

export function getTrackingQualityRows(summary) {
  return [
    {
      key: "tags",
      label: "Avec tag",
      count: summary.withTags,
      percent: getPercent(summary.withTags, summary.total),
    },
    {
      key: "contacts",
      label: "Avec contact lié",
      count: summary.withContacts,
      percent: getPercent(summary.withContacts, summary.total),
    },
    {
      key: "documents",
      label: "Avec document lié",
      count: summary.withDocuments,
      percent: getPercent(summary.withDocuments, summary.total),
    },
    {
      key: "notes",
      label: "Avec notes",
      count: summary.withNotes,
      percent: getPercent(summary.withNotes, summary.total),
    },
  ];
}

export function getFunnelRows(summary) {
  return [
    {
      key: "total",
      label: "Candidatures enregistrées",
      count: summary.total,
      percent: getPercent(summary.total, summary.total),
    },
    {
      key: "followUps",
      label: "Relances planifiées",
      count: summary.followUps,
      percent: getPercent(summary.followUps, summary.total),
    },
    {
      key: "interviews",
      label: "Entretiens obtenus",
      count: summary.interviews,
      percent: getPercent(summary.interviews, summary.total),
    },
    {
      key: "accepted",
      label: "Candidatures acceptées",
      count: summary.accepted,
      percent: getPercent(summary.accepted, summary.total),
    },
  ];
}

export function getStatusLabel(status) {
  return getApplicationStatusLabel(status);
}

export function getContractTypeLabel(contractType) {
  return getApplicationContractTypeLabel(contractType);
}