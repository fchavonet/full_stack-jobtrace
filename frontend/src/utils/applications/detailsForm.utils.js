import { getApplicationStatusIsFinal } from "./display.utils";
import { getDateInputValue, getFollowUpInputValue } from "./dates.utils";
import { formatDate } from "../common/format.utils";

export function getEmptyApplicationEditForm() {
  return {
    company: "",
    position: "",
    status: "sent",
    contractType: "",
    location: "",
    salary: "",
    link: "",
    sentAt: "",
    followUpAt: "",
    interviewAt: "",
    notes: "",
  };
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

export function getEditFormFromApplication(application) {
  let salary = "";

  if (application.salary !== null && application.salary !== undefined) {
    salary = String(application.salary);
  }

  const sentAt = getDateInputValue(application.sentAt);
  let interviewAt = getDateInputValue(application.interviewAt);
  let followUpAt = getDateInputValue(application.followUpAt);

  if (interviewAt) {
    followUpAt = "";
  }

  if (getStatusDisablesFollowUp(application.status)) {
    followUpAt = "";
  }

  if (getDateIsBefore(sentAt, interviewAt)) {
    interviewAt = "";
  }

  if (getDateIsBefore(sentAt, followUpAt)) {
    followUpAt = "";
  }

  if (getApplicationStatusIsFinal(application.status)) {
    followUpAt = "";
    interviewAt = "";
  }

  return {
    company: application.company || "",
    position: application.position || "",
    status: application.status || "sent",
    contractType: application.contractType || "",
    location: application.location || "",
    salary,
    link: application.link || "",
    sentAt,
    followUpAt,
    interviewAt,
    notes: application.notes || "",
  };
}

function getNullableDatePayloadValue(value) {
  if (value) {
    return value;
  }

  return null;
}

export function buildAnnouncementUpdatePayload(form) {
  let followUpAt = form.followUpAt;
  let interviewAt = form.interviewAt;

  if (interviewAt) {
    followUpAt = "";
  }

  if (getStatusDisablesFollowUp(form.status)) {
    followUpAt = "";
  }

  if (getDateIsBefore(form.sentAt, followUpAt)) {
    followUpAt = "";
  }

  if (getDateIsBefore(form.sentAt, interviewAt)) {
    interviewAt = "";
  }

  if (getApplicationStatusIsFinal(form.status)) {
    followUpAt = "";
    interviewAt = "";
  }

  return {
    company: form.company,
    position: form.position,
    status: form.status,
    contractType: form.contractType,
    location: form.location,
    salary: form.salary,
    link: form.link,
    sentAt: form.sentAt,
    followUpAt: getNullableDatePayloadValue(followUpAt),
    interviewAt: getNullableDatePayloadValue(interviewAt),
    notes: form.notes,
  };
}

export function getApplicationFollowUpDateLabel(application) {
  if (application && getStatusDisablesFollowUp(application.status)) {
    return "-";
  }

  if (application && application.interviewAt) {
    return "-";
  }

  if (application && getDateIsBefore(application.sentAt, application.followUpAt)) {
    return "-";
  }

  return formatDate(application.followUpAt);
}

export function getNextApplicationEditForm({
  currentForm,
  fieldName,
  value,
  followUpDelayDays,
}) {
  const nextForm = {
    ...currentForm,
    [fieldName]: value,
  };

  if (fieldName === "followUpAt" && getDateIsBefore(nextForm.sentAt, value)) {
    nextForm.followUpAt = "";
  }

  if (fieldName === "followUpAt" && value && !getDateIsBefore(nextForm.sentAt, value)) {
    nextForm.status = "follow_up";
  }

  if (fieldName === "interviewAt" && value && getDateIsBefore(nextForm.sentAt, value)) {
    nextForm.interviewAt = "";
    return nextForm;
  }

  if (fieldName === "interviewAt" && value) {
    nextForm.followUpAt = "";
    nextForm.status = "interview";
  }

  if (fieldName === "interviewAt" && !value) {
    nextForm.followUpAt = getFollowUpInputValue(nextForm.sentAt, followUpDelayDays);

    if (currentForm.status === "interview") {
      nextForm.status = "follow_up";
    }
  }

  if (fieldName === "sentAt" && nextForm.interviewAt && getDateIsBefore(value, nextForm.interviewAt)) {
    nextForm.interviewAt = "";

    if (currentForm.status === "interview") {
      nextForm.status = "follow_up";
    }
  }

  if (fieldName === "sentAt" && !nextForm.interviewAt && !getStatusDisablesFollowUp(nextForm.status)) {
    nextForm.followUpAt = getFollowUpInputValue(value, followUpDelayDays);
  }

  if (fieldName === "status" && value === "interview") {
    nextForm.followUpAt = "";
  }

  if (fieldName === "status" && !getStatusDisablesFollowUp(value) && !nextForm.interviewAt) {
    nextForm.followUpAt = getFollowUpInputValue(nextForm.sentAt, followUpDelayDays);
  }

  if (nextForm.status === "interview") {
    nextForm.followUpAt = "";
  }

  if (getDateIsBefore(nextForm.sentAt, nextForm.followUpAt)) {
    nextForm.followUpAt = "";
  }

  if (getDateIsBefore(nextForm.sentAt, nextForm.interviewAt)) {
    nextForm.interviewAt = "";
  }

  if (getApplicationStatusIsFinal(nextForm.status)) {
    nextForm.followUpAt = "";
    nextForm.interviewAt = "";
  }

  return nextForm;
}
