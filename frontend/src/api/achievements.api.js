import { apiRequest } from "./client";

export function listAchievements() {
  return apiRequest("/achievements", {
    method: "GET",
    authenticated: true,
  });
}