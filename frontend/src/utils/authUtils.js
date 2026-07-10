export function isAuthenticated() {
  return !!localStorage.getItem("prismavent_access_token");
}

export function logout() {
  // Se limpian ambas claves por si queda algún residuo del token de
  // prueba anterior ("token"), aunque Auth.js ya usa el login real
  // y guarda únicamente en "prismavent_access_token".
  localStorage.removeItem("token");
  localStorage.removeItem("prismavent_access_token");
}