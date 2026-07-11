import { getApplicationStatusIsFinal } from "../applications/display.utils";

const MONTH_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  month: "long",
  year: "numeric",
});

export const CALENDAR_WEEK_DAYS = [
  "Lun.",
  "Mar.",
  "Mer.",
  "Jeu.",
  "Ven.",
  "Sam.",
  "Dim.",
];

export function getStartOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function getIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return year + "-" + month + "-" + day;
}

export function getDateOnly(value) {
  if (!value) {
    return "";
  }

  return String(value).slice(0, 10);
}

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

export function formatCalendarMonth(date) {
  const label = MONTH_FORMATTER.format(date);

  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function buildCalendarDays(monthDate) {
  const firstDay = getStartOfMonth(monthDate);
  const start = new Date(firstDay);
  const dayIndex = firstDay.getDay();
  let daysToRemove = dayIndex - 1;

  if (dayIndex === 0) {
    daysToRemove = 6;
  }

  start.setDate(firstDay.getDate() - daysToRemove);

  const days = [];

  for (let index = 0; index < 42; index += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    days.push(day);
  }

  return days;
}

export function buildCalendarEvents(applications) {
  const events = [];

  applications.forEach(function (application) {
    const applicationStatusIsFinal = getApplicationStatusIsFinal(application.status);
    const sentAt = getDateOnly(application.sentAt);
    const followUpAt = getDateOnly(application.followUpAt);
    const interviewAt = getDateOnly(application.interviewAt);
    const followUpIsRelevant = followUpAt && !interviewAt && !getStatusDisablesFollowUp(application.status) && !getDateIsBefore(sentAt, followUpAt);
    const interviewIsRelevant = interviewAt && !applicationStatusIsFinal && !getDateIsBefore(sentAt, interviewAt);

    if (sentAt) {
      events.push({
        id: application.id + "-sent",
        applicationId: application.id,
        date: sentAt,
        type: "sent",
        label: application.company,
        subtitle: application.position,
      });
    }

    if (followUpIsRelevant) {
      events.push({
        id: application.id + "-follow-up",
        applicationId: application.id,
        date: followUpAt,
        type: "follow_up",
        label: application.company,
        subtitle: application.position,
      });
    }

    if (interviewIsRelevant) {
      events.push({
        id: application.id + "-interview",
        applicationId: application.id,
        date: interviewAt,
        type: "interview",
        label: application.company,
        subtitle: application.position,
      });
    }
  });

  return events.sort(function (firstEvent, secondEvent) {
    return getCalendarEventSortValue(firstEvent.type) - getCalendarEventSortValue(secondEvent.type);
  });
}

export function groupCalendarEventsByDate(events) {
  return events.reduce(function (eventsByDate, event) {
    if (!eventsByDate[event.date]) {
      eventsByDate[event.date] = [];
    }

    eventsByDate[event.date].push(event);

    return eventsByDate;
  }, {});
}

export function getCalendarEventSortValue(type) {
  if (type === "sent") {
    return 1;
  }

  if (type === "follow_up") {
    return 2;
  }

  if (type === "interview") {
    return 3;
  }

  return 99;
}

export function getCalendarEventLabel(type) {
  if (type === "sent") {
    return "Candidature";
  }

  if (type === "follow_up") {
    return "Relance";
  }

  if (type === "interview") {
    return "Entretien";
  }

  return "Événement";
}

export function getCalendarEventClassName(type) {
  if (type === "sent") {
    return "bg-info text-info-content hover:bg-info/90";
  }

  if (type === "follow_up") {
    return "bg-warning text-warning-content hover:bg-warning/90";
  }

  if (type === "interview") {
    return "bg-primary text-primary-content hover:bg-primary/90";
  }

  return "bg-base-300 text-base-content hover:bg-base-300/90";
}
