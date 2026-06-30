import { apiRequest, apiRequestWithToken } from "./client";

export function registerUser(payload) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function verifyUserEmail(token) {
  return apiRequest("/auth/verify-email?token=" + encodeURIComponent(token), {
    method: "GET",
  });
}

export function loginUser(payload) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getCurrentUser(token) {
  return apiRequestWithToken("/auth/me", token, {
    method: "GET",
  });
}

export function deleteCurrentUser(token) {
  return apiRequestWithToken("/auth/me", token, {
    method: "DELETE",
  });
}

export function exportCurrentUserData(token) {
  return apiRequestWithToken("/auth/export", token, {
    method: "GET",
  });
}

export function requestPasswordReset(payload) {
  return apiRequest("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function resetPassword(payload) {
  return apiRequest("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
