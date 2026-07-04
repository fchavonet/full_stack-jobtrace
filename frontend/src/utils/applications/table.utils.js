import { getApplicationContractTypeLabel, getApplicationStatusIsFinal, getApplicationStatusLabel, getApplicationStatusSortValue } from "./display.utils";
import { formatDate } from "../common/format.utils";
import { normalizeValue } from "../common/string.utils";

function getDateIsBefore(referenceDate, dateToCheck) {
  if (!referenceDate || !dateToCheck) {
    return false;
  }

  return String(dateToCheck).slice(0, 10) < String(referenceDate).slice(0, 10);
}

function getStatusDisablesFollowUp(status) {
  if (status === "interview") {
    return true;
  }

  if (getApplicationStatusIsFinal(status)) {
    return true;
  }

  return false;
}

export function getApplicationFollowUpIsRelevant(application) {
  if (application.interviewAt) {
    return false;
  }

  if (getStatusDisablesFollowUp(application.status)) {
    return false;
  }

  if (getDateIsBefore(application.sentAt, application.followUpAt)) {
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

export function getApplicationInterviewAt(application) {
  if (getApplicationStatusIsFinal(application.status)) {
    return "";
  }

  if (getDateIsBefore(application.sentAt, application.interviewAt)) {
    return "";
  }

  return application.interviewAt;
}

function getStartOfDayTimestamp(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function getFollowUpDisplay(value) {
  const followUpTimestamp = getStartOfDayTimestamp(value);

  if (followUpTimestamp === null) {
    return null;
  }

  const todayTimestamp = getStartOfDayTimestamp(new Date());
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const daysDifference = Math.round((followUpTimestamp - todayTimestamp) / millisecondsPerDay);

  if (daysDifference < 0) {
    return {
      label: "En retard",
      className: "badge badge-error text-[10px]",
    };
  }

  if (daysDifference === 0) {
    return {
      label: "Aujourd’hui",
      className: "badge badge-warning text-[10px]",
    };
  }

  if (daysDifference === 1) {
    return {
      label: "Demain",
      className: "badge badge-info text-[10px]",
    };
  }

  if (daysDifference <= 7) {
    return {
      label: "Dans " + daysDifference + " jours",
      className: "badge badge-info text-[10px]",
    };
  }

  return {
    label: "Dans " + daysDifference + " jours",
    className: "badge badge-ghost text-[10px]",
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
      formatDate(getApplicationInterviewAt(application)),
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
    return getDateTimestamp(getApplicationInterviewAt(application));
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
