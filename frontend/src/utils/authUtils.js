export function isAuthenticated() {
  return !!localStorage.getItem("token");
}

export function logout() {
  // Se limpian ambas claves porque hoy conviven dos mecanismos de token
  // en el proyecto: "token" (usado por isAuthenticated/Auth.js, aún con
  // un valor de prueba) y "prismavent_access_token" (el real, usado por
  // services/api.js contra el backend). Ver nota abajo.
  localStorage.removeItem("token");
  localStorage.removeItem("prismavent_access_token");
}