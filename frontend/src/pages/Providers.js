import { Sidebar } from "../components/Sidebar.js";
import { Topbar } from "../components/Topbar.js";
import { ProviderCard } from "../components/ProviderCard.js";
import { getProviders, getCategories } from "../service/api.js";
import { icon } from "../components/Icons.js";

let state = {
  providers: [],
  categories: [],
  activeCategory: null,
  searchTerm: "",
  page: 0,
  hasMore: true,
  loading: false,
};

let searchTimeout = null;

async function loadProviders(reset = false) {
  if (state.loading) return;
  state.loading = true;

  try {
    const params = { page: reset ? 0 : state.page, limit: 8 };
    if (state.activeCategory) params.category_id = state.activeCategory;
    if (state.searchTerm) params.search = state.searchTerm;

    const data = await getProviders(params);

    if (reset) {
      state.providers = data.providers || data;
    } else {
      state.providers = [...state.providers, ...(data.providers || data)];
    }

    state.hasMore = data.has_more !== undefined ? data.has_more : (data.providers || data).length >= 8;
    state.page = reset ? 1 : state.page + 1;
  } catch (err) {
    console.error("Error loading providers:", err);
  } finally {
    state.loading = false;
  }
}

function renderProvidersGrid() {
  const grid = document.getElementById("providers-grid");
  const empty = document.getElementById("providers-empty");
  const loadMore = document.getElementById("btn-load-more");

  if (state.providers.length === 0) {
    if (grid) grid.innerHTML = "";
    if (empty) empty.classList.remove("hidden");
    if (loadMore) loadMore.classList.add("hidden");
    return;
  }

  if (empty) empty.classList.add("hidden");
  grid.innerHTML = state.providers.map(p => ProviderCard(p)).join("");
  if (loadMore) {
    if (state.hasMore) {
      loadMore.classList.remove("hidden");
    } else {
      loadMore.classList.add("hidden");
    }
  }
}

async function refreshProviders(reset = true) {
  await loadProviders(reset);
  renderProvidersGrid();
}

function handleSearch(value) {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    state.searchTerm = value.trim();
    state.page = 0;
    refreshProviders(true);
  }, 300);
}

function handleCategoryClick(categoryId) {
  state.activeCategory = categoryId;
  state.page = 0;
  document.querySelectorAll(".category-pill").forEach(p => {
    p.classList.toggle("bg-[#755B00]", p.dataset.categoryId === String(categoryId));
    p.classList.toggle("text-white", p.dataset.categoryId === String(categoryId));
    p.classList.toggle("bg-[#F8F5F0]", p.dataset.categoryId !== String(categoryId));
    p.classList.toggle("text-[#4D4637]", p.dataset.categoryId !== String(categoryId));
  });
  refreshProviders(true);
}

export async function ProvidersPage() {
  state = { providers: [], categories: [], activeCategory: null, searchTerm: "", page: 0, hasMore: true, loading: false };

  try {
    state.categories = await getCategories();
  } catch (err) {
    console.error("Error loading categories:", err);
  }

  await refreshProviders(true);

  const html = `
    <div class="flex min-h-screen bg-[#FFF8F1]">
      ${Sidebar("providers")}
      <main class="flex-1 flex flex-col overflow-hidden">
        ${Topbar(`
          <div class="animate-fade-in">
            <h1 class="text-2xl font-bold text-[#1E1B15]">Proveedores</h1>
            <p class="text-[#9E8E6E] text-xs mt-0.5">Encuentra los mejores proveedores para tu evento</p>
          </div>
        `)}
        <div class="flex-1 overflow-auto">
          <div class="p-8 max-w-7xl mx-auto">

            <div class="flex items-center gap-4 mb-8">
              <div class="flex-1 flex items-center gap-3 overflow-x-auto pb-1" id="categories-container">
                <button class="category-pill shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer bg-[#755B00] text-white" data-category-id="null">
                  Todos
                </button>
                ${state.categories.map(cat => `
                  <button class="category-pill shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer bg-[#F8F5F0] text-[#4D4637] hover:bg-[#FEF3C7]" data-category-id="${cat.id}">
                    ${cat.name}
                  </button>
                `).join('')}
              </div>
              <div class="relative shrink-0 w-72">
                ${icon('search', 16, 'absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#9E8E6E]')}
                <input type="text" id="provider-search" placeholder="Buscar proveedor..." class="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E9E1D7] rounded-xl text-sm text-[#1E1B15] placeholder:text-[#9E8E6E] focus:outline-none focus:border-[#755B00] transition-colors">
              </div>
            </div>

            <div id="providers-empty" class="hidden flex flex-col items-center justify-center py-20 text-[#9E8E6E]">
              <span class="text-5xl mb-4 opacity-50">🔍</span>
              <p class="text-lg font-medium">No se encontraron proveedores</p>
              <p class="text-sm mt-1">Intenta con otros filtros o términos de búsqueda</p>
            </div>

            <div id="providers-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              ${state.providers.map(p => ProviderCard(p)).join('')}
            </div>

            <div class="flex justify-center mt-10 ${state.hasMore && state.providers.length > 0 ? '' : 'hidden'}" id="btn-load-more-container">
              <button id="btn-load-more" class="px-8 py-3 bg-white border-2 border-[#755B00] text-[#755B00] rounded-xl font-semibold hover:bg-[#FEF3C7] transition-all cursor-pointer ${state.hasMore && state.providers.length > 0 ? '' : 'hidden'}">
                Cargar más proveedores
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  `;

  return html;
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

  document.getElementById("btn-load-more")?.addEventListener("click", async () => {
    await loadProviders(false);
    renderProvidersGrid();
  });

  document.addEventListener("click", (e) => {
    const profileBtn = e.target.closest(".view-provider-profile");
    if (profileBtn) {
      e.preventDefault();
    }

    const quoteBtn = e.target.closest(".quote-provider");
    if (quoteBtn) {
      e.preventDefault();
    }
  });
}
