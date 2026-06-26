import { apiFileRequest, apiRequest, getApiUrl } from "./client";

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

export async function getDocumentFile(id) {
  try {
    return await apiFileRequest("/documents/" + id, {
      method: "GET",
      authenticated: true,
    });
  } catch {
    return apiFileRequest("/documents/" + id + "/download", {
      method: "GET",
      authenticated: true,
    });
  }
}

export function deleteDocument(id) {
  return apiRequest("/documents/" + id, {
    method: "DELETE",
    authenticated: true,
  });
}

export function getDocumentDirectUrl(doc) {
  const relativeUrl = getDocumentRelativeUrl(doc);

  if (!relativeUrl) {
    return "";
  }

  if (relativeUrl.startsWith("http://")) {
    return relativeUrl;
  }

  if (relativeUrl.startsWith("https://")) {
    return relativeUrl;
  }

  const apiOrigin = getApiOrigin();

  if (relativeUrl.startsWith("/")) {
    return apiOrigin + relativeUrl;
  }

  return apiOrigin + "/" + relativeUrl;
}

function getDocumentRelativeUrl(doc) {
  if (!doc) {
    return "";
  }

  if (doc.fileUrl) {
    return doc.fileUrl;
  }

  if (doc.file_url) {
    return doc.file_url;
  }

  if (doc.url) {
    return doc.url;
  }

  if (doc.path && doc.path.startsWith("/uploads/")) {
    return doc.path;
  }

  if (doc.path && doc.path.startsWith("uploads/")) {
    return doc.path;
  }

  return "";
}

function getApiOrigin() {
  let origin = getApiUrl();

  if (origin.endsWith("/api/")) {
    origin = origin.slice(0, -5);
  }

  if (origin.endsWith("/api")) {
    origin = origin.slice(0, -4);
  }

  if (origin.endsWith("/")) {
    origin = origin.slice(0, -1);
  }

  return origin;
}
