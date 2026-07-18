import "./style.css";
import { isAuthenticated, isAdmin } from "./utils/authUtils.js";
import { Auth } from "./components/Auth.js";
import { Sidebar } from "./components/Sidebar.js";
import { Topbar } from "./components/Topbar.js";
import { CreateEvent } from "./pages/CreateEvent.js";
import { EventDetail } from "./pages/EventDetail.js";
import { GuestsPage, initGuestsPage } from "./pages/GuestsPage.js";
import { ResourcesPage, initResourcesPage } from "./pages/ResourcesPage.js";
import { TasksPage, initTasksPage } from "./pages/TasksPage.js";
import { CustomEventFlow } from "./pages/CustomEventFlow.js";
import { TemplateEventFlow } from "./pages/TemplateEventFlow.js";
import { MyTemplates } from "./pages/MyTemplates.js";
import { prefillCustomEventForm, loadCities } from "./components/CustomEventForm.js";
import { deleteEvent } from "./service/api.js";
import { showToast } from "./components/Toast.js";
import { 
  getEventById,
  updateEvent,
  updateEventStatus,
  createGuest,
  deleteGuest,
  updateGuest
 } from "./service/api.js";

// === NUEVA IMPORTACIÓN ===
import MyEvents from "./pages/MyEvents.js";
import { ProvidersPage, initProvidersPage } from "./pages/Providers.js";
import { AdminProvidersPage } from "./pages/AdminProvidersPage.js";
import { initDashboard } from "./pages/Dashboard.js";
import { LandingPage, initLandingPage } from "./pages/LandingPage.js";
import { HistoryPage, initHistory } from "./pages/History.js";
import { AdminCategoriesPage } from "./pages/AdminCategoriesPage.js";

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

  // Landing page
  if (path === '/') {
    document.querySelector("#app").innerHTML = LandingPage();
    initLandingPage();
  // Rutas de autenticación
  } else if (path === '/auth' || path === '/login' || path === '/register') {
    document.querySelector("#app").innerHTML = Auth();

  // Rutas del Dashboard
  } else if (path === '/dashboard' || path === '/home') {
    if (!isAuthenticated()) {
      window.history.replaceState({}, "", "/login");
      renderPage();
      return;
    }
    document.querySelector("#app").innerHTML = `
      <div class="flex h-screen animate-fade-in">
        ${Sidebar("dashboard")}
        <div class="flex-1 flex flex-col">
          ${Topbar(`
            <div class="animate-fade-in">
              <h1 class="text-2xl font-bold text-[#1E1B15]">Dashboard</h1>
              <p class="text-[#9E8E6E] text-xs mt-0.5">Bienvenido de vuelta a tu espacio</p>
            </div>
          `)}
          <main class="flex-1 p-6 lg:p-8 bg-[#FFF8F1] overflow-auto"></main>
        </div>
      </div>
    `;
    window.initDashboard = initDashboard;
    initDashboard();

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
    
    const nextButton = document.getElementById("btn-next-status");

      if (nextButton) {
        nextButton.addEventListener("click", async () => {
          try {
            const currentStatus = nextButton.dataset.currentStatus;

            const nextStatusMap = {
              borrador: "confirmado",
            };

            const updated = await updateEventStatus(
              eventId,
              nextStatusMap[currentStatus]
            );

            // Volver a cargar la página de detalle
            window.history.replaceState({}, "", `/events/detail?id=${eventId}`);
            window.dispatchEvent(new PopStateEvent("popstate"));

          } catch (error) {
            console.error(error);
            console.log(error.message);
          }
        });
      }

//modal de agregar invitados 
    const addGuestButton = document.getElementById("btn-add-guest");
    const guestModal = document.getElementById("guest-modal");
    const cancelGuest = document.getElementById("cancel-guest");

    if (addGuestButton && guestModal) {
      addGuestButton.addEventListener("click", () => {
        const ev = window.__eventData?.event;
        if (ev?.status === 'finalizado' || ev?.status === 'done') return;
        guestModal.classList.remove("hidden");
        guestModal.classList.add("flex");
      });
    }

    if (cancelGuest && guestModal) {
      cancelGuest.addEventListener("click", () => {
        guestModal.classList.add("hidden");
        guestModal.classList.remove("flex");
      });
    }

    // Handler para botón "Ver todos" en GuestPanel
    const viewAllBtn = document.getElementById("btn-view-all-guests");
    if (viewAllBtn) {
      viewAllBtn.addEventListener("click", (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        window.__genieTriggerRect = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
        const eventId = e.currentTarget.dataset.eventId;
        window.history.pushState({}, "", `/events/${eventId}/guests`);
        window.dispatchEvent(new PopStateEvent("popstate"));
      });
    }

    // Handler para botón "Ver todos" en recursos
    const viewAllResourcesBtn = document.getElementById("btn-view-all-resources");
    if (viewAllResourcesBtn) {
      viewAllResourcesBtn.addEventListener("click", (e) => {
        const eventId = e.currentTarget.dataset.eventId;
        window.history.pushState({}, "", `/events/${eventId}/resources`);
        window.dispatchEvent(new PopStateEvent("popstate"));
      });
    }

    // Handler para botón "Ver Tablero" en TasksPanel
    const viewKanbanBtn = document.getElementById("btn-view-kanban");
    if (viewKanbanBtn) {
      viewKanbanBtn.addEventListener("click", (e) => {
        const eventId = e.currentTarget.dataset.eventId;
        window.history.pushState({}, "", `/events/${eventId}/tasks`);
        window.dispatchEvent(new PopStateEvent("popstate"));
      });
    }

    const guestForm = document.getElementById("guest-form");

        if (guestForm) {
          guestForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const ev = window.__eventData?.event;
            if (ev?.status === 'finalizado' || ev?.status === 'done') return;

            const submitBtn = guestForm.querySelector('button[type="submit"]');
            const guestData = {
              full_name: document.getElementById("guest-name").value,
              confirmed: document.getElementById("guest-confirmed").checked,
              notes: document.getElementById("guest-notes").value,
            };

            // Disable button immediately to prevent double-click
            if (submitBtn) {
              submitBtn.disabled = true;
              submitBtn.textContent = "Guardando...";
            }

            try {

              const guestId = guestForm.dataset.editing;

              if (guestId) {

                await updateGuest(
                  eventId,
                  guestId,
                  guestData
                );

                delete guestForm.dataset.editing;

                showToast("Guest updated successfully.");

              } else {

                const event = await getEventById(eventId);

                if ((event.guests.length + 1) > event.guest_count) {

                  const confirmAdd = confirm(
                    "Este invitado supera el número previsto de asistentes. ¿Desea continuar?"
                  );

                  if (!confirmAdd) return;
                }

                await createGuest(
                  eventId,
                  guestData
                );

                showToast("Guest created successfully.");
              }

              guestModal.classList.add("hidden");
              guestModal.classList.remove("flex");

              window.history.replaceState({}, "", `/events/detail?id=${eventId}`);
              window.dispatchEvent(new PopStateEvent("popstate"));

            } catch (error) {
              console.error(error);
              showToast(error.message, "error");
              if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Guardar";
              }
            }
          });
        }

    document.querySelectorAll(".delete-guest").forEach((button) => {
      button.addEventListener("click", async () => {
        const ev = window.__eventData?.event;
        if (ev?.status === 'finalizado' || ev?.status === 'done') return;
        const guestId = button.dataset.id;

        if (!confirm("Delete this guest?")) return;

        try {
          await deleteGuest(eventId, guestId);

          window.history.replaceState({}, "", `/events/detail?id=${eventId}`);
          window.dispatchEvent(new PopStateEvent("popstate"));

          showToast("Guest deleted successfully.");
        } catch (error) {
          console.error(error);
          showToast(error.message, "error");
        }
      });
    });

    document.querySelectorAll(".edit-guest").forEach((button) => {

      button.addEventListener("click", () => {
        const ev = window.__eventData?.event;
        if (ev?.status === 'finalizado' || ev?.status === 'done') return;

        guestModal.classList.remove("hidden");
        guestModal.classList.add("flex");

        document.getElementById("guest-name").value =
          button.dataset.name;

        document.getElementById("guest-notes").value =
          button.dataset.notes;

        document.getElementById("guest-confirmed").checked =
          button.dataset.confirmed === "true";

        guestForm.dataset.editing = button.dataset.id;

      });

    });


  // Ruta: Lista de invitados del evento
  } else if (path.startsWith("/events/") && path.endsWith("/guests")) {
    if (!isAuthenticated()) {
      window.history.replaceState({}, "", "/login");
      renderPage();
      return;
    }
    const eventId = path.split("/events/")[1].split("/guests")[0];
    const triggerRect = window.__genieTriggerRect || null;
    document.querySelector("#app").innerHTML = await GuestsPage(eventId, triggerRect);
    if (triggerRect) delete window.__genieTriggerRect;
    initGuestsPage(eventId);

  // Ruta: Lista de recursos del evento
  } else if (path.startsWith("/events/") && path.endsWith("/resources")) {
    if (!isAuthenticated()) {
      window.history.replaceState({}, "", "/login");
      renderPage();
      return;
    }
    const eventId = path.split("/events/")[1].split("/resources")[0];
    document.querySelector("#app").innerHTML = await ResourcesPage(eventId);
    initResourcesPage(eventId);

  // Ruta: Tablero Kanban de tareas
  } else if (path.startsWith("/events/") && path.endsWith("/tasks")) {
    if (!isAuthenticated()) {
      window.history.replaceState({}, "", "/login");
      renderPage();
      return;
    }
    const eventId = path.split("/events/")[1].split("/tasks")[0];
    document.querySelector("#app").innerHTML = await TasksPage(eventId);
    initTasksPage(eventId);

  } else if (path === "/events/new/custom") {
    if (!isAuthenticated()) {
      window.history.replaceState({}, "", "/login");
      renderPage();
      return;
    }
    document.querySelector("#app").innerHTML = CustomEventFlow();
    prefillCustomEventForm();
    loadCities();

  // Flujo: evento desde plantilla
  } else if (path === "/events/new/template") {
    if (!isAuthenticated()) {
      window.history.replaceState({}, "", "/login");
      renderPage();
      return;
    }
    document.querySelector("#app").innerHTML = TemplateEventFlow();

  // Ruta Proveedores
  } else if (path === '/providers') {
    if (!isAuthenticated()) {
      window.history.replaceState({}, "", "/login");
      renderPage();
      return;
    }
    try {
      document.querySelector("#app").innerHTML = ProvidersPage();
      initProvidersPage();
    } catch (err) {
      console.error("Error al cargar ProvidersPage:", err);
      document.querySelector("#app").innerHTML = `
        <div class="flex items-center justify-center min-h-screen bg-[#FFF8F1]">
          <div class="text-center p-8">
            <h2 class="text-xl font-bold text-red-600 mb-2">Error al cargar proveedores</h2>
            <p class="text-[#9E8E6E] text-sm">${err.message}</p>
            <button onclick="navigateTo('/dashboard')" class="mt-4 px-6 py-2 bg-[#755B00] text-white rounded-xl">Volver al inicio</button>
          </div>
        </div>
      `;
    }

  // Ruta Mis Plantillas
  } else if (path === "/my-templates") {
    if (!isAuthenticated()) {
      window.history.replaceState({}, "", "/login");
      renderPage();
      return;
    }
    const myTemplatesPage = new MyTemplates();
    await myTemplatesPage.init();

  // Ruta Historial
  } else if (path === "/history") {
    if (!isAuthenticated()) {
      window.history.replaceState({}, "", "/login");
      renderPage();
      return;
    }
    document.querySelector("#app").innerHTML = HistoryPage();
    initHistory();

  // Ruta Admin - Proveedores (solo admin)
  } else if (path === "/admin/providers") {
    if (!isAuthenticated()) {
      window.history.replaceState({}, "", "/login");
      renderPage();
      return;
    }
    if (!isAdmin()) {
      window.history.replaceState({}, "", "/providers");
      renderPage();
      return;
    }
    try {
      document.querySelector("#app").innerHTML = await AdminProvidersPage();
    } catch (err) {
      console.error("Error al cargar Admin ProvidersPage:", err);
      document.querySelector("#app").innerHTML = `
        <div class="flex items-center justify-center min-h-screen bg-[#FFF8F1]">
          <div class="text-center p-8">
            <h2 class="text-xl font-bold text-red-600 mb-2">Error al cargar proveedores</h2>
            <p class="text-[#9E8E6E] text-sm">${err.message}</p>
            <button onclick="navigateTo('/dashboard')" class="mt-4 px-6 py-2 bg-[#755B00] text-white rounded-xl">Volver al inicio</button>
          </div>
        </div>
      `;
    }

  // Ruta Admin - Categorías (solo admin)
  } else if (path === "/admin/categories") {
    if (!isAuthenticated()) {
      window.history.replaceState({}, "", "/login");
      renderPage();
      return;
    }
    if (!isAdmin()) {
      window.history.replaceState({}, "", "/providers");
      renderPage();
      return;
    }
    try {
      document.querySelector("#app").innerHTML = await AdminCategoriesPage();
    } catch (err) {
      console.error("Error al cargar Admin CategoriesPage:", err);
      document.querySelector("#app").innerHTML = `
        <div class="flex items-center justify-center min-h-screen bg-[#FFF8F1]">
          <div class="text-center p-8">
            <h2 class="text-xl font-bold text-red-600 mb-2">Error al cargar categorías</h2>
            <p class="text-[#9E8E6E] text-sm">${err.message}</p>
            <button onclick="navigateTo('/dashboard')" class="mt-4 px-6 py-2 bg-[#755B00] text-white rounded-xl">Volver al inicio</button>
          </div>
        </div>
      `;
    }

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

// Exponer para navegación programática desde navigateTo()
window.renderPage = renderPage;

// Remover loading cover y mostrar prismas
setTimeout(() => {
  const cover = document.getElementById("loading-cover");
  if (cover) {
    cover.style.opacity = "0";
    setTimeout(() => cover.remove(), 300);
  }
  const prism = document.getElementById("prism-bg");
  if (prism) prism.classList.remove("opacity-0");
}, 50);