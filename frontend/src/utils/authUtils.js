const TOKEN_KEY = "prismavent_access_token";

export function isAuthenticated() {
  return !!localStorage.getItem(TOKEN_KEY);
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}