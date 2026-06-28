import { getApplicationStatusIsFinal } from "./display.utils";
import {
  getDateInputValue,
  getFollowUpInputValue,
} from "./dates.utils";
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

export function getEditFormFromApplication(application) {
  let salary = "";

  if (application.salary !== null && application.salary !== undefined) {
    salary = String(application.salary);
  }

  const interviewAt = getDateInputValue(application.interviewAt);
  let followUpAt = getDateInputValue(application.followUpAt);

  if (interviewAt) {
    followUpAt = "";
  }

  return {
    company: application.company || "",
    position: application.position || "",
    status: application.status || "sent",
    contractType: application.contractType || "",
    location: application.location || "",
    salary,
    link: application.link || "",
    sentAt: getDateInputValue(application.sentAt),
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

  if (form.interviewAt) {
    followUpAt = "";
  }

  if (getApplicationStatusIsFinal(form.status)) {
    followUpAt = "";
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
    interviewAt: getNullableDatePayloadValue(form.interviewAt),
    notes: form.notes,
  };
}

export function getApplicationFollowUpDateLabel(application) {
  if (application && application.interviewAt) {
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

  if (fieldName === "interviewAt" && value) {
    nextForm.followUpAt = "";
    nextForm.status = "interview";
  }

  if (fieldName === "interviewAt" && !value) {
    nextForm.followUpAt = getFollowUpInputValue(
      nextForm.sentAt,
      followUpDelayDays,
    );

    if (currentForm.status === "interview") {
      nextForm.status = "follow_up";
    }
  }

  if (fieldName === "sentAt" && !nextForm.interviewAt && !getApplicationStatusIsFinal(nextForm.status)) {
    nextForm.followUpAt = getFollowUpInputValue(
      value,
      followUpDelayDays,
    );
  }

  if (fieldName === "status" && value === "interview") {
    nextForm.followUpAt = "";
  }

  if (fieldName === "status" && getApplicationStatusIsFinal(value)) {
    nextForm.followUpAt = "";
  }

  if (fieldName === "status" && !getApplicationStatusIsFinal(value) && value !== "interview" && !nextForm.interviewAt) {
    nextForm.followUpAt = getFollowUpInputValue(
      nextForm.sentAt,
      followUpDelayDays,
    );
  }

  return nextForm;
}
