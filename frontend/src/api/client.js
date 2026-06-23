const API_URL = import.meta.env.VITE_API_URL;

export async function apiRequest(path, options = {}) {
  const url = API_URL + path;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw data;
  }

  return data;
}
