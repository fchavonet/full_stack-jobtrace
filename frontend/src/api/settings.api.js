import { apiRequest } from "./client";

export function updateUserSettings(payload) {
  return apiRequest("/profile/settings", {
    method: "PATCH",
    body: payload,
    authenticated: true,
  });
}
