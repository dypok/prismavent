import { Sidebar } from "../components/Sidebar.js";
import { Topbar } from "../components/Topbar.js";
import { ProviderCard } from "../components/ProviderCard.js";
import { getProviders, getCategories } from "../service/api.js";
import { ProviderDrawer, openProviderDrawer } from "../components/ProviderDrawer.js";

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
  grid.innerHTML = state.providers
    .map(p => ProviderCard(p, state.categoryMap[p.category_id]))
    .join('');
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
        ${Topbar(`
          <div class="animate-fade-in w-full">
            <div class="flex items-center justify-between gap-16">
              <div class="shrink-0">
                <h1 class="text-2xl font-bold text-[#1E1B15]">Proveedores</h1>
                <p class="text-[#9E8E6E] text-xs mt-0.5">Encuentra los mejores proveedores para tu evento</p>
              </div>
              <div class="relative w-full max-w-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9E8E6E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input type="text" id="provider-search" placeholder="Buscar proveedor..." class="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E9E1D7] rounded-xl text-sm text-[#1E1B15] placeholder:text-[#9E8E6E] focus:outline-none focus:border-[#755B00] transition-colors">
              </div>
            </div>
          </div>
        `)}
        <div class="flex-1 overflow-auto">
          <div class="p-8 max-w-7xl mx-auto">

            <div class="flex items-center gap-3 overflow-x-auto pb-1 mb-6" id="categories-container">
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

            <div id="providers-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              ${state.providers.map(p => ProviderCard(p, state.categoryMap[p.category_id])).join('')}
            </div>

          </div>
        </div>
      </main>
    </div>
    ${ProviderDrawer()}
  `;
}

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

  document.addEventListener("click", (e) => {
    const profileBtn = e.target.closest(".view-provider-profile");
    if (profileBtn) {
      e.preventDefault();
      const providerId = profileBtn.dataset.id;
      const provider = state.providers.find(p => String(p.id) === providerId);
      if (provider) {
        openProviderDrawer(provider, state.categoryMap[provider.category_id]);
      }
    }
    if (e.target.closest(".quote-provider")) {
      e.preventDefault();
    }
  });
}
