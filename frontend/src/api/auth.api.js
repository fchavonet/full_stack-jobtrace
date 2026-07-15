import { apiRequest } from "./client";

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

export function logoutUser() {
  return apiRequest("/auth/logout", {
    method: "POST",
  });
}

export function getCurrentUser() {
  return apiRequest("/auth/me", {
    method: "GET",
  });
}

export function deleteCurrentUser() {
  return apiRequest("/auth/me", {
    method: "DELETE",
  });
}

export function exportCurrentUserData() {
  return apiRequest("/auth/export", {
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
