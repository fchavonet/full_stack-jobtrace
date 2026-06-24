import { apiRequest } from "./client";

export function getUserProfile() {
  return apiRequest("/profile", {
    method: "GET",
    authenticated: true,
  });
}

export function updateUserProfile(payload) {
  return apiRequest("/profile", {
    method: "PATCH",
    body: payload,
    authenticated: true,
  });
}

export function updateUserPassword(payload) {
  return apiRequest("/profile/password", {
    method: "PATCH",
    body: payload,
    authenticated: true,
  });
}
