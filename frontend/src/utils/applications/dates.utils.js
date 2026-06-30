import { APPLICATION_FALLBACK_FOLLOW_UP_DELAY_DAYS } from "../../constants/application.constants";

export function getTodayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function getDateInputValue(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

export function getFollowUpDelayDays(value) {
  const parsedDelay = Number(value);

  if (Number.isFinite(parsedDelay) && parsedDelay > 0) {
    return parsedDelay;
  }

  return APPLICATION_FALLBACK_FOLLOW_UP_DELAY_DAYS;
}

export function getFollowUpInputValue(sentAt, followUpDelayDays) {
  const date = new Date(sentAt);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  date.setDate(date.getDate() + followUpDelayDays);

  return date.toISOString().slice(0, 10);
}

export function getFormUsesAutomaticFollowUpDate(form, followUpDelayDays) {
  if (!form.sentAt) {
    return false;
  }

  if (form.interviewAt) {
    return false;
  }

  const automaticFollowUpAt = getFollowUpInputValue(
    form.sentAt,
    followUpDelayDays,
  );

  if (form.followUpAt === automaticFollowUpAt) {
    return true;
  }

  if (!form.followUpAt) {
    return true;
  }

  return false;
}
