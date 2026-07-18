import { Sidebar } from "../components/Sidebar.js";
import { Topbar } from "../components/Topbar.js";
import { ProviderCard } from "../components/ProviderCard.js";
import { getProviders, getCategories, getEvents, createEventItem } from "../service/api.js";
import { ProviderDrawer, openProviderDrawer } from "../components/ProviderDrawer.js";
import { AddToEventModal } from "../components/AddToEventModal.js";
import { showToast } from "../components/Toast.js";

let state = {
  providers: [],
  categories: [],
  categoryMap: {},
  activeCategory: null,
  searchTerm: "",
  loading: false,
};

let searchTimeout = null;

async function loadProviders() {
  if (state.loading) return;
  state.loading = true;

  try {
    const params = {};
    if (state.activeCategory) params.category_id = state.activeCategory;
    if (state.searchTerm) params.search = state.searchTerm;

    state.providers = await getProviders(params);
  } catch (err) {
    console.error("Error loading providers:", err);
    state.providers = [];
  } finally {
    state.loading = false;
  }
}

function renderProvidersGrid() {
  const grid = document.getElementById("providers-grid");
  const empty = document.getElementById("providers-empty");

  if (state.providers.length === 0) {
    if (grid) grid.innerHTML = "";
    if (empty) empty.classList.remove("hidden");
    return;
  }

  if (empty) empty.classList.add("hidden");
  if (grid) {
    grid.innerHTML = state.providers
      .map(p => ProviderCard(p, state.categoryMap[p.category_id]))
      .join('');
  }
}

async function refreshProviders() {
  await loadProviders();
  renderProvidersGrid();
}

function handleSearch(value) {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    state.searchTerm = value.trim();
    refreshProviders();
  }, 300);
}

function handleCategoryClick(categoryId) {
  state.activeCategory = categoryId;
  document.querySelectorAll(".category-pill").forEach(p => {
    const isActive = p.dataset.categoryId === String(categoryId);
    p.classList.toggle("bg-[#755B00]", isActive);
    p.classList.toggle("text-white", isActive);
    p.classList.toggle("bg-[#F8F5F0]", !isActive);
    p.classList.toggle("text-[#4D4637]", !isActive);
  });
  refreshProviders();
}

export async function ProvidersPage() {
  state = { providers: [], categories: [], categoryMap: {}, activeCategory: null, searchTerm: "", loading: false };

  try {
    const cats = await getCategories();
    state.categories = cats;
    state.categoryMap = Object.fromEntries(cats.map(c => [c.id, c.name]));
  } catch (err) {
    console.error("Error loading categories:", err);
  }

  await refreshProviders();

  return `
    <div class="flex min-h-screen bg-[#FFF8F1]">

      ${Sidebar("providers")}

      <main class="flex-1 flex flex-col overflow-hidden">

        ${Topbar()}

        <div class="flex-1 overflow-auto">
          <div class="px-6 lg:px-10 py-8 lg:py-10 max-w-[1600px] mx-auto">

            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 lg:mb-10">
              <div>
                <h1 class="text-4xl lg:text-5xl font-bold text-[#1E1B15] tracking-tight">Proveedores</h1>
                <p class="text-base lg:text-lg text-[#9E8E6E] mt-1.5">Encuentra los mejores proveedores para tu evento</p>
              </div>
              <div class="relative w-full sm:w-80 lg:w-96 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9E8E6E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input type="text" id="provider-search" placeholder="Buscar proveedor..." class="w-full pl-11 pr-4 py-3 bg-white border border-[#E9E1D7] rounded-xl text-sm text-[#1E1B15] placeholder:text-[#9E8E6E] focus:outline-none focus:border-[#755B00] focus:ring-1 focus:ring-[#755B00]/20 transition-all">
              </div>
            </div>

            <div class="flex items-center gap-3 overflow-x-auto pb-1 mb-8" id="categories-container">
              <button class="category-pill shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer bg-[#755B00] text-white" data-category-id="null">
                Todos
              </button>
              ${state.categories.map(cat => `
                <button class="category-pill shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer bg-[#F8F5F0] text-[#4D4637] hover:bg-[#FEF3C7]" data-category-id="${cat.id}">
                  ${cat.name}
                </button>
              `).join('')}
            </div>

            <div id="providers-empty" class="hidden flex flex-col items-center justify-center py-20 text-[#9E8E6E]">
              <span class="text-5xl mb-4 opacity-50">🔍</span>
              <p class="text-lg font-medium">No se encontraron proveedores</p>
              <p class="text-sm mt-1">Intenta con otros filtros o términos de búsqueda</p>
            </div>

            <div id="providers-grid" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              ${state.providers.map(p => ProviderCard(p, state.categoryMap[p.category_id])).join('')}
            </div>

          </div>
        </div>
      </main>
    </div>
    ${ProviderDrawer()}
    ${AddToEventModal()}
    ${QuoteModal()}
  `;
}

function QuoteModal() {
  return `
    <div id="quote-modal" class="hidden fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl border border-[#E9E1D7] w-full max-w-sm p-6 text-center animate-scale-in">
        <div class="w-16 h-16 rounded-full bg-[#FEF3C7] flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#755B00" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        </div>
        <h3 class="text-xl font-bold text-[#1E1B15] mb-2">Cotización</h3>
        <p class="text-sm text-[#9E8E6E] mb-6 leading-relaxed">Esta función estará disponible próximamente. Estamos trabajando para que puedas solicitar cotizaciones directamente desde la plataforma.</p>
        <button onclick="hideQuoteModal()" class="w-full py-3 bg-[#755B00] hover:bg-[#5A4700] text-white font-semibold rounded-xl transition-all cursor-pointer">Entendido</button>
      </div>
    </div>
  `;
}

window.showQuoteModal = function () {
  const modal = document.getElementById("quote-modal");
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
};

window.hideQuoteModal = function () {
  const modal = document.getElementById("quote-modal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.classList.remove("flex");
};

export function initProvidersPage() {
  document.getElementById("provider-search")?.addEventListener("input", (e) => {
    handleSearch(e.target.value);
  });

  document.getElementById("categories-container")?.addEventListener("click", (e) => {
    const pill = e.target.closest(".category-pill");
    if (pill) {
      const catId = pill.dataset.categoryId === "null" ? null : pill.dataset.categoryId;
      handleCategoryClick(catId);
    }
  });

  document.getElementById("close-add-to-event")?.addEventListener("click", () => {
    const modal = document.getElementById("add-to-event-modal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  });

  window.addToEventFromCard = function (btn) {
    openAddToEventModal(btn.dataset.providerName, btn.dataset.providerPrice);
  };

  window.selectEvent = async function (el) {
    const eventId = el.dataset.eventId;
    const eventName = el.dataset.eventName;
    const modal = document.getElementById("add-to-event-modal");
    const providerName = modal?.dataset?.providerName;
    const providerPrice = modal?.dataset?.providerPrice;

    if (!eventId || !providerName) return;

      try {
      await createEventItem(eventId, {
        name: providerName,
        quantity: 1,
        unit_price: parseFloat(providerPrice) || 0,
      });
      if (modal) {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
      }
      showToast(`\u2713 ${providerName} a\u00f1adido a ${eventName}`, "success");
    } catch (err) {
      showToast(`Error al a\u00f1adir: ${err.message}`, "error");
    }
  };

  document.addEventListener("click", async (e) => {
    const profileBtn = e.target.closest(".view-provider-profile");
    if (profileBtn) {
      e.preventDefault();
      const providerId = profileBtn.dataset.id;
      const provider = state.providers.find(p => String(p.id) === providerId);
      if (provider) {
        openProviderDrawer(provider, state.categoryMap[provider.category_id]);
      }
      return;
    }

    const addBtn = e.target.closest(".add-to-event");
    if (addBtn) {
      e.preventDefault();
      window.addToEventFromCard(addBtn);
      return;
    }

    if (e.target.closest(".quote-provider")) {
      e.preventDefault();
    }
  });
}

async function openAddToEventModal(providerName, providerPrice) {
  const modal = document.getElementById("add-to-event-modal");
  const content = document.getElementById("add-to-event-content");
  if (!modal || !content) return;

  modal.dataset.providerName = providerName;
  modal.dataset.providerPrice = providerPrice || "";

  content.innerHTML = `
    <div class="flex items-center justify-center py-8 text-[#9E8E6E]">
      <span class="animate-spin w-5 h-5 border-2 border-[#9E8E6E] border-t-transparent rounded-full mr-3"></span>
      Cargando eventos...
    </div>
  `;

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  try {
    const events = await getEvents();
    const activeEvents = events.filter(e => e.status !== "finalizado");

    if (activeEvents.length === 0) {
      content.innerHTML = `
        <div class="text-center py-8 text-[#9E8E6E]">
          <span class="text-4xl block mb-3 opacity-50">📋</span>
          <p class="text-lg font-medium">Crea un evento primero</p>
          <p class="text-sm mt-1">No tienes eventos activos disponibles</p>
        </div>
      `;
      return;
    }

    content.innerHTML = activeEvents.map(event => {
      const statusColors = {
        borrador: "bg-gray-100 text-gray-600",
        confirmado: "bg-green-100 text-green-700",
        finalizado: "bg-blue-100 text-blue-700",
      };
      const badgeClass = statusColors[event.status] || "bg-gray-100 text-gray-600";
      const date = event.event_date
        ? new Date(event.event_date + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
        : "Sin fecha";

      return `
        <div class="event-option flex items-center justify-between p-4 rounded-xl border border-[#E9E1D7] hover:border-[#755B00] hover:bg-[#FEF3C7] cursor-pointer transition-all" data-event-id="${event.id}" data-event-name="${event.name}" onclick="window.selectEvent(this)">
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-[#1E1B15] truncate">${event.name}</p>
            <p class="text-xs text-[#9E8E6E] mt-0.5">${date}</p>
          </div>
          <span class="shrink-0 ml-3 px-3 py-0.5 text-xs font-medium rounded-full ${badgeClass}">${event.status}</span>
        </div>
      `;
    }).join("");
  } catch (err) {
    content.innerHTML = `
      <div class="text-center py-8 text-red-500">
        <p>Error al cargar eventos</p>
        <p class="text-sm mt-1">${err.message}</p>
      </div>
    `;
  }
}
