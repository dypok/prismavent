import "./style.css";
import { isAuthenticated } from "./utils/authUtils.js";
import { Auth } from "./components/Auth.js";
import { Sidebar } from "./components/Sidebar.js";
import { Topbar } from "./components/Topbar.js";
import { NewEventSelection } from "./components/NewEventSelection.js";
import { CustomEventForm } from "./components/CustomEventForm.js";
import { EventTemplatesGrid } from "./components/EventTemplatesGrid.js";

console.log("Main.js cargado - Ruta:", window.location.pathname);

function renderPage() {
  const path = window.location.pathname;

  if (isAuthenticated() && (path === "/" || path === "/auth" || path === "/login" || path === "/register")) {
    window.history.replaceState({}, "", "/events/new");
    renderPage();
    return;
  }

  if (path === '/auth' || path === '/login' || path === '/register' || path === '/') {
    document.querySelector("#app").innerHTML = Auth();
    
  } else if (path === '/dashboard' || path === '/home') {
    if (!isAuthenticated()) {
      window.history.replaceState({}, "", "/login");
      renderPage();
      return;
    }

    document.querySelector("#app").innerHTML = `
      <div class="flex h-screen">
        ${Sidebar("dashboard")}
        <div class="flex-1 flex flex-col">
          ${Topbar("Carlos")}
          <main class="flex-1 p-8 bg-[#FFF8F1] overflow-auto">
            <h1 class="text-4xl font-bold text-gray-900">Dashboard</h1>
            <p class="text-gray-600 mt-2">Bienvenido de vuelta</p>
          </main>
        </div>
      </div>
    `;

  } else if (path === "/events/new") {
    if (!isAuthenticated()) {
      window.history.replaceState({}, "", "/login");
      renderPage();
      return;
    }

    // 🔧 CAMBIO 1: innerHTML solo para el layout (Sidebar + contenedor vacío)
    document.querySelector("#app").innerHTML = `
      <div class="flex h-screen overflow-hidden">
        ${Sidebar("new-event")}
        <div id="new-event-content" class="flex-1 overflow-auto bg-[#FFF8F1]"></div>
      </div>
    `;

    // 🔧 CAMBIO 2: appendChild para insertar el componente DOM
    const contentArea = document.querySelector("#new-event-content");
    contentArea.appendChild(NewEventSelection());

  } else {
    document.querySelector("#app").innerHTML = `
      <div class="min-h-screen flex items-center justify-center">
        <div class="text-center">
          <h1 class="text-6xl font-bold text-red-500">404</h1>
          <p class="text-2xl mt-4">Página no encontrada</p>
          <a href="/events/new" class="mt-6 inline-block px-6 py-3 bg-amber-600 text-white rounded-2xl">Ir a Crear Evento</a>
        </div>
      </div>
    `;
  }
}

renderPage();

window.addEventListener('popstate', renderPage);