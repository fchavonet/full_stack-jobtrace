import { apiRequest } from "./client";

export function listApplications() {
  return apiRequest("/applications", {
    method: "GET",
    authenticated: true,
  });
}

export function createApplication(payload) {
  return apiRequest("/applications", {
    method: "POST",
    body: payload,
    authenticated: true,
  });
}

export function getApplication(id) {
  return apiRequest("/applications/" + id, {
    method: "GET",
    authenticated: true,
  });
}

export function updateApplication(id, payload) {
  return apiRequest("/applications/" + id, {
    method: "PATCH",
    body: payload,
    authenticated: true,
  });
}

export function deleteApplication(id) {
  return apiRequest("/applications/" + id, {
    method: "DELETE",
    authenticated: true,
  });
}
