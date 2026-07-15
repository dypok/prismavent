import { setUserName } from "../utils/authUtils.js";

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

// --- Login y Register (sin cambios) ---

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
  const userName = data.user?.user_metadata?.name || data.user?.name;
  if (userName) setUserName(userName);
  return data;
}

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

// --- Fetch autenticado (sin cambios) ---

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

// ========================
// NUEVOS MÉTODOS PARA EL SPRINT
// ========================

// Obtener todos los eventos del usuario (para el grid)
export async function getEvents() {
  return await apiFetch('/events');   // ← CORREGIDO
}

// Obtener un evento por ID
export async function getEventById(eventId) {
  return await apiFetch(`/events/${eventId}`);
}

// Eliminar un evento
export async function deleteEvent(eventId) {
  return await apiFetch(`/events/${eventId}`, {
    method: "DELETE"
  });
}

// Obtener templates (útil para crear evento)
export async function getTemplates() {
  return await apiFetch('/templates');
}

// Obtener invitados de un evento
export async function getEventGuests(eventId) {
  return await apiFetch(`/events/${eventId}/guests`);
}

// Crear un nuevo invitado
export async function createGuest(eventId, guestData) {
  return await apiFetch(`/events/${eventId}/guests`, {
    method: 'POST',
    body: JSON.stringify(guestData)
  });
}

// Actualizar un evento
export async function updateEvent(eventId, eventData) {
  return await apiFetch(`/events/${eventId}`, {
    method: 'PATCH',
    body: JSON.stringify(eventData)
  });
}

// Actualizar invitado
export async function updateGuest(eventId, guestId, guestData) {
  return await apiFetch(`/events/${eventId}/guests/${guestId}`, {
    method: 'PATCH',
    body: JSON.stringify(guestData)
  });
}

// Eliminar invitado
export async function deleteGuest(eventId, guestId) {
  return await apiFetch(`/events/${eventId}/guests/${guestId}`, {
    method: 'DELETE'
  });
}

// Actualizar estado de un evento
export async function updateEventStatus(eventId, status) {
  return await apiFetch(`/events/${eventId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
}


export default {
  login,
  register,
  getEvents,
  getEventById,
  getTemplates,
  getEventGuests,
  createGuest,
  updateGuest,
  deleteGuest,
  updateEvent,
  updateEventStatus,
  setAccessToken,
  getAccessToken,
  clearAccessToken,
  apiFetch,
  deleteEvent
};