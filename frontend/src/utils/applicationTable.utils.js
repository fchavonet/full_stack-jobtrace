import {
  getApplicationContractTypeLabel,
  getApplicationStatusLabel,
  getApplicationStatusSortValue,
} from "./application.utils";
import { formatDate } from "./format.utils";
import { normalizeValue } from "./string.utils";

export function getApplicationFollowUpIsRelevant(application) {
  if (application.interviewAt) {
    return false;
  }

  if (application.status === "accepted") {
    return false;
  }

  if (application.status === "rejected") {
    return false;
  }

  return true;
}

export function getApplicationFollowUpAt(application) {
  if (!getApplicationFollowUpIsRelevant(application)) {
    return "";
  }

  return application.followUpAt;
}

function getStartOfDayTimestamp(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

export function getFollowUpDisplay(value) {
  const followUpTimestamp = getStartOfDayTimestamp(value);

  if (followUpTimestamp === null) {
    return null;
  }

  const todayTimestamp = getStartOfDayTimestamp(new Date());
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const daysDifference = Math.round(
    (followUpTimestamp - todayTimestamp) / millisecondsPerDay,
  );

  if (daysDifference < 0) {
    return {
      label: "En retard",
      className: "badge badge-error",
    };
  }

  if (daysDifference === 0) {
    return {
      label: "Aujourd’hui",
      className: "badge badge-warning",
    };
  }

  if (daysDifference === 1) {
    return {
      label: "Demain",
      className: "badge badge-info",
    };
  }

  if (daysDifference <= 7) {
    return {
      label: "Dans " + daysDifference + " jours",
      className: "badge badge-info",
    };
  }

  return {
    label: "Dans " + daysDifference + " jours",
    className: "badge badge-ghost",
  };
}

function getDateTimestamp(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.getTime();
}

function getSearchableValue(application) {
  return normalizeValue(
    [
      application.company,
      application.position,
      application.location,
      getApplicationContractTypeLabel(application.contractType),
      getApplicationStatusLabel(application.status),
      formatDate(application.sentAt),
      formatDate(getApplicationFollowUpAt(application)),
      formatDate(application.interviewAt),
    ].join(" "),
  );
}

function getSortableValue(application, sortKey) {
  if (sortKey === "company") {
    return normalizeValue(application.company);
  }

  if (sortKey === "position") {
    return normalizeValue(application.position);
  }

  if (sortKey === "contractType") {
    return normalizeValue(getApplicationContractTypeLabel(application.contractType));
  }

  if (sortKey === "status") {
    return getApplicationStatusSortValue(application.status);
  }

  if (sortKey === "sentAt") {
    return getDateTimestamp(application.sentAt);
  }

  if (sortKey === "followUpAt") {
    return getDateTimestamp(getApplicationFollowUpAt(application));
  }

  if (sortKey === "interviewAt") {
    return getDateTimestamp(application.interviewAt);
  }

  return "";
}

function compareSortableValues(firstValue, secondValue, direction) {
  if (firstValue === null && secondValue === null) {
    return 0;
  }

  if (firstValue === null) {
    return 1;
  }

  if (secondValue === null) {
    return -1;
  }

  let result = 0;

  if (typeof firstValue === "number" && typeof secondValue === "number") {
    if (firstValue < secondValue) {
      result = -1;
    }

    if (firstValue > secondValue) {
      result = 1;
    }
  } else {
    result = String(firstValue).localeCompare(String(secondValue), "fr-FR");
  }

  if (direction === "desc") {
    result = result * -1;
  }

  return result;
}

export function getFilteredApplications(applications, searchValue, statusFilter) {
  const normalizedSearch = normalizeValue(searchValue);

  return applications.filter(function (application) {
    if (statusFilter !== "all" && application.status !== statusFilter) {
      return false;
    }

    if (normalizedSearch && !getSearchableValue(application).includes(normalizedSearch)) {
      return false;
    }

    return true;
  });
}

export function getSortedApplications(applications, sortConfig) {
  if (!sortConfig.key) {
    return applications;
  }

  const sortedApplications = [...applications];

  sortedApplications.sort(function (firstApplication, secondApplication) {
    const firstValue = getSortableValue(firstApplication, sortConfig.key);
    const secondValue = getSortableValue(secondApplication, sortConfig.key);

    return compareSortableValues(firstValue, secondValue, sortConfig.direction);
  });

  return sortedApplications;
}

export function getNextSortDirection(currentSortConfig, sortKey) {
  if (currentSortConfig.key === sortKey && currentSortConfig.direction === "asc") {
    return "desc";
  }

  return "asc";
}
