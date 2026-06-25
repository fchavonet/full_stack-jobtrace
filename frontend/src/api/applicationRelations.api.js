import { apiRequest } from "./client";

export function linkTagToApplication(applicationId, payload) {
  return apiRequest("/applications/" + applicationId + "/tags", {
    method: "POST",
    body: payload,
    authenticated: true,
  });
}

export function linkContactToApplication(applicationId, payload) {
  return apiRequest("/applications/" + applicationId + "/contacts", {
    method: "POST",
    body: payload,
    authenticated: true,
  });
}

export function linkDocumentToApplication(applicationId, payload) {
  return apiRequest("/applications/" + applicationId + "/documents", {
    method: "POST",
    body: payload,
    authenticated: true,
  });
}
