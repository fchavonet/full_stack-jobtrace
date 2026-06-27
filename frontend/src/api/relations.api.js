import { apiRequest } from "./client";

export function linkTagToApplication(applicationId, payload) {
  return apiRequest("/applications/" + applicationId + "/tags", {
    method: "POST",
    body: {
      tagId: payload.tagId,
    },
    authenticated: true,
  });
}

export function unlinkTagFromApplication(applicationId, tagId) {
  return apiRequest("/applications/" + applicationId + "/tags/" + tagId, {
    method: "DELETE",
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

export function unlinkContactFromApplication(applicationId, contactId) {
  return apiRequest("/applications/" + applicationId + "/contacts/" + contactId, {
    method: "DELETE",
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

export function unlinkDocumentFromApplication(applicationId, documentId) {
  return apiRequest("/applications/" + applicationId + "/documents/" + documentId, {
    method: "DELETE",
    authenticated: true,
  });
}
