const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const AUTH_TOKEN_STORAGE_KEY = "jobtrace_token";

export function getApiUrl() {
  return API_URL;
}

export async function apiRequest(path, options = {}) {
  const url = API_URL + path;
  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

  const headers = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (options.authenticated && token) {
    headers.Authorization = "Bearer " + token;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    body: getRequestBody(options.body),
  });

  const data = await getResponseData(response);

  if (!response.ok) {
    throw data;
  }

  return data;
}

export async function apiFileRequest(path, options = {}) {
  const url = API_URL + path;
  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

  const headers = {
    ...options.headers,
  };

  if (options.authenticated && token) {
    headers.Authorization = "Bearer " + token;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    body: getRequestBody(options.body),
  });

  if (!response.ok) {
    const data = await getResponseData(response);
    throw data;
  }

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const data = await getResponseData(response);
    throw data;
  }

  const blob = await response.blob();

  if (blob.type.includes("application/json")) {
    throw new Error("Invalid file response.");
  }

  return {
    blob,
    contentType,
  };
}

export function apiRequestWithToken(path, token, options = {}) {
  const headers = {
    Authorization: "Bearer " + token,
    ...options.headers,
  };

  return apiRequest(path, {
    ...options,
    headers,
  });
}

function getRequestBody(body) {
  if (!body) {
    return undefined;
  }

  if (body instanceof FormData) {
    return body;
  }

  if (typeof body === "string") {
    return body;
  }

  return JSON.stringify(body);
}

async function getResponseData(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
