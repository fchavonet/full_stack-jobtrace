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

export function updateContact(id, payload) {
  return apiRequest("/contacts/" + id, {
    method: "PATCH",
    body: payload,
    authenticated: true,
  });
}

export function deleteContact(id) {
  return apiRequest("/contacts/" + id, {
    method: "DELETE",
    authenticated: true,
  });
}
