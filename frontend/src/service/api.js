import { setUserName, setUserRole } from "../utils/authUtils.js";

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

  try {
    const me = await apiFetch("/auth/me");
    setUserRole(me.role);
  } catch (err) {
    console.error("Could not fetch user role:", err);
  }

  return data;
}

export async function register(name, email, password, phone, city_id) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name,
      email,
      password,
      phone,
      city_id
    })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Registration failed.");
  }

  return data;
}

function showSessionModal(msg) {
  const existing = document.getElementById("session-modal");
  if (existing) return;

  const overlay = document.createElement("div");
  overlay.id = "session-modal";
  overlay.className = "fixed inset-0 bg-black/40 flex items-center justify-center z-[200] animate-fade-in backdrop-blur-sm";
  overlay.onclick = () => {};

  overlay.innerHTML = `
    <div class="bg-white rounded-3xl p-8 w-[400px] shadow-2xl animate-scale-in text-center">
      <div class="w-14 h-14 bg-[#FEF3C7] rounded-full flex items-center justify-center mx-auto mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#755B00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <h2 class="text-xl font-bold text-[#1E1B15] mb-2">Sesión expirada</h2>
      <p class="text-sm text-[#4D4637] mb-6">${msg}</p>
      <button onclick="document.getElementById('session-modal').remove(); window.history.pushState({},'','/login'); window.dispatchEvent(new PopStateEvent('popstate'))" class="w-full py-3 bg-[#755B00] text-white font-semibold rounded-xl text-sm hover:bg-[#5F4A00] transition shadow-sm">
        Ir al inicio de sesión
      </button>
    </div>
  `;

  document.body.appendChild(overlay);
}

// --- Fetch autenticado ---

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

  if (res.status === 401) {
    clearAccessToken();
    const msg = token
      ? "Tu sesión expiró. Redirigiendo al login..."
      : "Debes iniciar sesión para continuar.";
    showSessionModal(msg);
    throw new Error(msg);
  }

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

export async function updateProfile(name, password) {
  const body = {};
  if (name) body.name = name;
  if (password) body.password = password;

  const data = await apiFetch("/auth/profile", {
    method: "PUT",
    body: JSON.stringify(body)
  });

  if (name) {
    setUserName(name);
  }

  return data;
}

export async function getEvents(status) {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return await apiFetch(`/events${query}`);
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

// Categorías de proveedores
export async function getCategories() {
  return await apiFetch('/provider-categories');
}

export async function getCities() {
  return await apiFetch('/cities');
}

// Proveedores (con filtros opcionales)
export async function getProviders(params = {}) {
  const query = new URLSearchParams();
  if (params.category_id) query.set('category_id', params.category_id);
  if (params.search) query.set('search', params.search);
  if (params.page != null) query.set('page', params.page);
  if (params.limit) query.set('limit', params.limit);
  const qs = query.toString();
  return await apiFetch(`/providers${qs ? `?${qs}` : ''}`);
}

export async function getUserTemplates() {
  return await apiFetch('/user-templates');
}

export async function createUserTemplate(payload) {
  return await apiFetch('/user-templates', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteUserTemplate(id) {
  return await apiFetch(`/user-templates/${id}`, { method: 'DELETE' });
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

// Crear un recurso/item del evento
export async function createEventItem(eventId, itemData) {
  return await apiFetch(`/events/${eventId}/items`, {
    method: 'POST',
    body: JSON.stringify(itemData)
  });
}

// Actualizar un recurso/item del evento
export async function updateEventItem(eventId, itemId, itemData) {
  return await apiFetch(`/events/${eventId}/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify(itemData)
  });
}

// Eliminar un recurso/item del evento
export async function deleteEventItem(eventId, itemId) {
  return await apiFetch(`/events/${eventId}/items/${itemId}`, {
    method: 'DELETE'
  });
}

// --- Event History (log de estados) ---
export async function getEventHistory(eventId) {
  return await apiFetch(`/events/${eventId}/history`);
}

// --- Event Tasks (Kanban) ---
export async function getEventTasks(eventId) {
  return await apiFetch(`/events/${eventId}/tasks`);
}

export async function createEventTask(eventId, taskData) {
  return await apiFetch(`/events/${eventId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(taskData)
  });
}

export async function updateEventTask(eventId, taskId, taskData) {
  return await apiFetch(`/events/${eventId}/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(taskData)
  });
}

export async function moveEventTask(eventId, taskId, status) {
  return await apiFetch(`/events/${eventId}/tasks/${taskId}/move`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
}

export async function deleteEventTask(eventId, taskId) {
  return await apiFetch(`/events/${eventId}/tasks/${taskId}`, {
    method: 'DELETE'
  });
}

export async function getEventWeather(eventId) {
  return await apiFetch(`/events/${eventId}/weather`);
}

export async function getAdminMetrics() {
  return await apiFetch("/admin/metrics");
}

export async function getPublicStats() {
  return await apiFetch("/stats");
}

export default {
  updateProfile,
  login,
  register,
  getEvents,
  getEventById,
  getTemplates,
  getCategories,
  getCities,
  getProviders,
  getUserTemplates,
  createUserTemplate,
  deleteUserTemplate,
  getEventGuests,
  createGuest,
  updateGuest,
  deleteGuest,
  createEventItem,
  updateEventItem,
  deleteEventItem,
  updateEvent,
  updateEventStatus,
  setAccessToken,
  getAccessToken,
  clearAccessToken,
  apiFetch,
  deleteEvent,
  getEventTasks,
  createEventTask,
  updateEventTask,
  moveEventTask,
  deleteEventTask,
  getEventWeather,
  getAdminMetrics,
  getPublicStats
};