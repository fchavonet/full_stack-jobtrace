import {
  APPLICATION_CONTRACT_TYPE_OPTIONS,
  APPLICATION_STATUS_OPTIONS
} from "../constants/application.constants";

export function getOptionLabel(options, value, fallback) {
  const option = options.find(function (item) {
    return item.value === value;
  });

  if (option) {
    return option.label;
  }

  return fallback;
}

export function getApplicationStatusLabel(status) {
  return getOptionLabel(APPLICATION_STATUS_OPTIONS, status, "Inconnu");
}

export function getApplicationContractTypeLabel(contractType) {
  return getOptionLabel(
    APPLICATION_CONTRACT_TYPE_OPTIONS,
    contractType,
    "Non renseigné",
  );
}

export function getApplicationStatusSortValue(status) {
  const statusIndex = APPLICATION_STATUS_OPTIONS.findIndex(function (option) {
    return option.value === status;
  });

  if (statusIndex === -1) {
    return 99;
  }

  return statusIndex + 1;
}

export function getApplicationStatusBadgeClassName(status) {
  let className = "badge badge-outline";

  if (status === "sent") {
    className = "badge badge-info";
  }

  if (status === "follow_up") {
    className = "badge badge-warning";
  }

  if (status === "interview") {
    className = "badge badge-primary text-white";
  }

  if (status === "rejected") {
    className = "badge badge-error";
  }

  if (status === "accepted") {
    className = "badge badge-success";
  }

  return className;
}

export function getApplicationStatusIsFinal(status) {
  if (status === "accepted") {
    return true;
  }

  if (status === "rejected") {
    return true;
  }

  return false;
}