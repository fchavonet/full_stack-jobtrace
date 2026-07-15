const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export function getApiUrl() {
  return API_URL;
}

export async function apiRequest(path, options = {}) {
  const url = API_URL + path;

  const headers = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
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

  const headers = {
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
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
