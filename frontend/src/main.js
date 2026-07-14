import "./style.css";
import { isAuthenticated } from "./utils/authUtils.js";
import { Auth } from "./components/Auth.js";
import { Sidebar } from "./components/Sidebar.js";
import { Topbar } from "./components/Topbar.js";
import { CreateEvent } from "./pages/CreateEvent.js";
import { EventDetail } from "./pages/EventDetail.js";
import { CustomEventFlow } from "./pages/CustomEventFlow.js";
import { TemplateEventFlow } from "./pages/TemplateEventFlow.js";
import { prefillCustomEventForm } from "./components/CustomEventForm.js";
import { deleteEvent } from "./service/api.js";
import { showToast } from "./components/Toast.js";

// === NUEVA IMPORTACIÓN ===
import MyEvents from "./pages/MyEvents.js";

console.log("Main.js cargado - Ruta:", window.location.pathname);

async function renderPage() {
  const path = window.location.pathname;

  if (
    isAuthenticated() &&
    (path === "/" || path === "/auth" || path === "/login")
  ) {
    window.history.replaceState({}, "", "/dashboard");
    renderPage();
    return;
  }

  // Rutas de autenticación
  if (path === '/auth' || path === '/login' || path === '/register' || path === '/') {
    document.querySelector("#app").innerHTML = Auth();

  // Rutas del Dashboard
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

  // === RUTA: MIS EVENTOS ===
  } else if (path === '/my-events' || path === '/events') {
    if (!isAuthenticated()) {
      window.history.replaceState({}, "", "/login");
      renderPage();
      return;
    }
    const myEventsPage = new MyEvents();
    await myEventsPage.init();

  // Ruta Crear Evento
  } else if (path === "/events/new") {
    if (!isAuthenticated()) {
      window.history.replaceState({}, "", "/login");
      renderPage();
      return;
    }
    document.querySelector("#app").innerHTML = CreateEvent();

  // Ruta Detalle del Evento
  } else if (path === "/events/detail") {
    if (!isAuthenticated()) {
      window.history.replaceState({}, "", "/login");
      renderPage();
      return;
    }
    const eventId = new URLSearchParams(window.location.search).get("id");
    document.querySelector("#app").innerHTML = await EventDetail(eventId);

    // Abrir modal
    const openDeleteModal = document.getElementById("open-delete-modal");
    const deleteModal = document.getElementById("delete-modal");
    const cancelDelete = document.getElementById("cancel-delete");

    if (openDeleteModal && deleteModal) {
      openDeleteModal.addEventListener("click", () => {
        deleteModal.classList.remove("hidden");
        deleteModal.classList.add("flex");
      });
    }

    if (cancelDelete && deleteModal) {
      cancelDelete.addEventListener("click", () => {
        deleteModal.classList.add("hidden");
        deleteModal.classList.remove("flex");
      });
    }

    const confirmDelete = document.getElementById("confirm-delete");
    if (confirmDelete && deleteModal) {
      confirmDelete.addEventListener("click", async () => {
        try {
          await deleteEvent(eventId);

          deleteModal.classList.add("hidden");
          deleteModal.classList.remove("flex");

          window.history.pushState({}, "", "/events");
          window.dispatchEvent(new PopStateEvent("popstate"));

          showToast("Event deleted successfully.");

        } catch (error) {
          showToast(error.message, "error");
          console.error(error);
        }
      });
    }

  // Flujo: evento personalizado
  } else if (path === "/events/new/custom") {
    if (!isAuthenticated()) {
      window.history.replaceState({}, "", "/login");
      renderPage();
      return;
    }
    document.querySelector("#app").innerHTML = CustomEventFlow();
    prefillCustomEventForm();

  // Flujo: evento desde plantilla
  } else if (path === "/events/new/template") {
    if (!isAuthenticated()) {
      window.history.replaceState({}, "", "/login");
      renderPage();
      return;
    }
    document.querySelector("#app").innerHTML = TemplateEventFlow();

  // 404
  } else {
    document.querySelector("#app").innerHTML = `
      <div class="min-h-screen flex items-center justify-center">
        <div class="text-center">
          <h1 class="text-6xl font-bold text-red-500">404</h1>
          <p class="text-2xl mt-4">Página no encontrada</p>
          <a href="/auth" class="mt-6 inline-block px-6 py-3 bg-amber-600 text-white rounded-2xl">Ir al Login</a>
        </div>
      </div>
    `;
  }
}

// Render inicial
renderPage();

// Soporte para botones atrás/adelante
window.addEventListener('popstate', renderPage);