const BASE_URL = "http://localhost:8000";
const TOKEN_KEY = "prismavent_access_token";

// --- Manejo del token en localStorage ---

export function setAccessToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearAccessToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// --- Login: llama al backend y guarda el access_token de la sesión ---

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Login failed.");
  }

  setAccessToken(data.session.access_token);

  return data;
}

// ---- Singup: LLama al backend para crear un nuevo usuario en Supabase ---
export async function register(name, email, password, phone) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name,
      email,
      password,
      phone
    })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Registration failed.");
  }

  return data;
}

// --- Fetch autenticado: adjunta el token a cada petición al backend ---

export async function apiFetch(path, options = {}) {
  const token = getAccessToken();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error((data && data.detail) || `Request failed: ${res.status}`);
  }

  return data;
}
// --- Ejemplo ilustrativo —  patrón a usar cada vez que necesites pedirle datos protegidos al backend (eventos, usuarios, etc). ---
// import { apiFetch } from "./services/api.js";
// const eventos = await apiFetch("/events");