import { apiRequest } from "./client";

export function listDocuments() {
  return apiRequest("/documents", {
    method: "GET",
    authenticated: true,
  });
}

export function uploadDocument(formData) {
  return apiRequest("/documents", {
    method: "POST",
    body: formData,
    authenticated: true,
  });
}
