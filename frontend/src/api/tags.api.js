import { apiRequest } from "./client";

export function listTags() {
  return apiRequest("/tags", {
    method: "GET",
    authenticated: true,
  });
}

export function createTag(payload) {
  return apiRequest("/tags", {
    method: "POST",
    body: payload,
    authenticated: true,
  });
}
