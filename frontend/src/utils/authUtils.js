import { getAccessToken, clearAccessToken } from "../service/api.js";

export function isAuthenticated() {
  return !!getAccessToken();
}

export function logout() {
  clearAccessToken();
}

export function getToken() {
  return getAccessToken();
}