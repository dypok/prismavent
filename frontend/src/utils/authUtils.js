export function isAuthenticated() {
  return !!localStorage.getItem("prismavent_access_token");
}

export function getUserName() {
  return localStorage.getItem("prismavent_user_name") || "Usuario";
}

export function setUserName(name) {
  localStorage.setItem("prismavent_user_name", name);
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("prismavent_access_token");
  localStorage.removeItem("prismavent_user_name");
}