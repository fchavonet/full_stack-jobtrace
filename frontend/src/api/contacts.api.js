import { apiRequest } from "./client";

export function listContacts() {
  return apiRequest("/contacts", {
    method: "GET",
    authenticated: true,
  });
}

export function createContact(payload) {
  return apiRequest("/contacts", {
    method: "POST",
    body: payload,
    authenticated: true,
  });
}
