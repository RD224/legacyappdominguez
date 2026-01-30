export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("token");
}

function setToken(token) {
  if (typeof window === "undefined") return;
  if (!token) window.localStorage.removeItem("token");
  else window.localStorage.setItem("token", token);
}

export async function apiFetch(path, { method = "GET", body } = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : await res.text();

  if (!res.ok) {
    const msg =
      (data && typeof data === "object" && data.error) ||
      (typeof data === "string" ? data : null) ||
      `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function login(username, password) {
  const data = await apiFetch("/api/auth/login", {
    method: "POST",
    body: { username, password },
  });
  setToken(data.token);
  return data.user;
}

export function logout() {
  setToken(null);
}

/** Descarga un archivo (ej. CSV) con el token de autenticación */
export async function downloadWithAuth(path, filename) {
  const token = getToken();
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "download";
  a.click();
  window.URL.revokeObjectURL(url);
}

