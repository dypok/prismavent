import { Sidebar } from "../components/Sidebar.js";
import { Topbar } from "../components/Topbar.js";
import { icon } from "../components/Icons.js";
import { showToast } from "../components/Toast.js";
import { getCategories, apiFetch, getProviders } from "../service/api.js";

let state = {
  providers: [],
  categories: [],
  categoryMap: {},
  page: 1,
  total: 0,
  pages: 0,
  perPage: 10,
  searchTerm: "",
  selectedCategory: "",
  loading: false,
  modalMode: null,
  editingProvider: null,
  deleteTarget: null
};

let searchTimeout = null;

function starsHtml(rating) {
  const full = Math.floor(Number(rating) || 0);
  const half = (Number(rating) || 0) % 1 >= 0.5;
  return Array.from({ length: 5 }, (_, i) => {
    if (i < full) return `<span class="text-amber-400 text-lg">&#9733;</span>`;
    if (i === full && half) return `<span class="text-amber-400 text-lg">&#9733;</span>`;
    return `<span class="text-gray-300 text-lg">&#9733;</span>`;
  }).join('');
}

async function loadProviders() {
  if (state.loading) return;
  state.loading = true;

  try {
    const params = `?page=${state.page}&per_page=${state.perPage}${state.searchTerm ? `&search=${encodeURIComponent(state.searchTerm)}` : ''}${state.selectedCategory ? `&category_id=${state.selectedCategory}` : ''}`;
    const data = await apiFetch(`/admin/providers${params}`);
    state.providers = data.providers || [];
    state.total = data.total || 0;
    state.pages = data.pages || 0;
  } catch (err) {
    console.error("Error loading providers:", err);
    state.providers = [];
    state.total = 0;
    state.pages = 0;
  } finally {
    state.loading = false;
  }
}

function renderTable() {
  const container = document.getElementById("admin-providers-content");
  if (!container) return;

  const start = state.total === 0 ? 0 : (state.page - 1) * state.perPage + 1;
  const end = Math.min(state.page * state.perPage, state.total);

  container.innerHTML = `
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-3xl lg:text-4xl font-bold text-[#1E1B15] tracking-tight">Proveedores</h1>
        <p class="text-sm text-[#9E8E6E] mt-1">Panel de administración de proveedores</p>
      </div>
      <button onclick="window.openCreateModal()" class="flex items-center gap-2 px-5 py-2.5 bg-[#755B00] text-white font-semibold rounded-xl hover:bg-[#5F4A00] transition-all cursor-pointer shrink-0">
        ${icon('plus', 18)} Nuevo proveedor
      </button>
    </div>

    <div class="flex flex-col sm:flex-row gap-3 mb-6">
      <div class="relative flex-1">
        ${icon('search', 16, 'absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9E8E6E] pointer-events-none')}
        <input type="text" id="admin-provider-search" value="${state.searchTerm}" placeholder="Buscar por nombre..." class="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E9E1D7] rounded-xl text-sm text-[#1E1B15] placeholder:text-[#9E8E6E] focus:outline-none focus:border-[#755B00] transition-all">
      </div>
      <select id="admin-category-filter" class="px-4 py-2.5 bg-white border border-[#E9E1D7] rounded-xl text-sm text-[#1E1B15] focus:outline-none focus:border-[#755B00] transition-all cursor-pointer">
        <option value="">Todas las categorías</option>
        ${state.categories.map(c => `
          <option value="${c.id}" ${state.selectedCategory === c.id ? 'selected' : ''}>${c.name}</option>
        `).join('')}
      </select>
    </div>

    ${state.providers.length === 0 ? `
      <div class="flex flex-col items-center justify-center py-20 text-[#9E8E6E]">
        <span class="text-5xl mb-4 opacity-50">${icon('store', 48, 'opacity-30')}</span>
        <p class="text-lg font-medium">No se encontraron proveedores</p>
        <p class="text-sm mt-1">Intenta con otros filtros o crea uno nuevo</p>
      </div>
    ` : `
      <div class="bg-white rounded-2xl border border-[#E9E1D7] overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-[#E9E1D7] bg-[#F8F5F0]">
                <th class="text-left px-4 py-3 font-semibold text-[#4D4637] text-xs tracking-widest uppercase">Nombre</th>
                <th class="text-left px-4 py-3 font-semibold text-[#4D4637] text-xs tracking-widest uppercase hidden md:table-cell">Categoría</th>
                <th class="text-left px-4 py-3 font-semibold text-[#4D4637] text-xs tracking-widest uppercase hidden lg:table-cell">Ubicación</th>
                <th class="text-center px-4 py-3 font-semibold text-[#4D4637] text-xs tracking-widest uppercase hidden sm:table-cell">Rating</th>
                <th class="text-right px-4 py-3 font-semibold text-[#4D4637] text-xs tracking-widest uppercase hidden sm:table-cell">Precio ref.</th>
                <th class="text-center px-4 py-3 font-semibold text-[#4D4637] text-xs tracking-widest uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${state.providers.map(p => `
                <tr class="border-b border-[#E9E1D7] hover:bg-[#FEF3C7]/30 transition-colors" data-provider-id="${p.id}">
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-[#FEF3C7] to-[#F8F5F0] flex items-center justify-center shrink-0">
                        ${icon('store', 16, 'text-[#755B00] opacity-60')}
                      </div>
                      <div class="min-w-0">
                        <p class="font-semibold text-[#1E1B15] truncate max-w-[180px]">${p.name}</p>
                        <p class="text-xs text-[#9E8E6E] truncate max-w-[180px]">${p.phone || ''}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3 hidden md:table-cell">
                    <span class="inline-block px-3 py-0.5 text-xs font-medium bg-[#FEF3C7] text-[#755B00] rounded-full">${state.categoryMap[p.category_id] || 'General'}</span>
                  </td>
                  <td class="px-4 py-3 text-[#4D4637] hidden lg:table-cell">${p.address || '-'}</td>
                  <td class="px-4 py-3 text-center hidden sm:table-cell">
                    <div class="flex items-center justify-center gap-1">
                      ${starsHtml(p.display_rating || p.rating)}
                      <span class="text-xs text-[#9E8E6E] ml-0.5">(${Number(p.display_rating || p.rating) || 0})</span>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-right hidden sm:table-cell">
                    <span class="font-semibold text-[#755B00]">${p.reference_price != null ? `$${Number(p.reference_price).toLocaleString()}` : '-'}</span>
                    ${p.price_unit ? `<span class="text-xs text-[#9E8E6E] block">${p.price_unit}</span>` : ''}
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center justify-center gap-2">
                      <button onclick="window.openEditModal('${p.id}')" class="w-8 h-8 flex items-center justify-center rounded-lg text-[#9E8E6E] hover:text-[#755B00] hover:bg-[#FEF3C7] transition-all cursor-pointer" title="Editar">
                        ${icon('pencil', 16)}
                      </button>
                      <button onclick="window.openDeleteModal('${p.id}', '${p.name.replace(/'/g, "\\'")}')" class="w-8 h-8 flex items-center justify-center rounded-lg text-[#9E8E6E] hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer" title="Eliminar">
                        ${icon('trash-2', 16)}
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-[#E9E1D7] bg-[#F8F5F0]">
          <p class="text-xs text-[#9E8E6E]">
            Mostrando ${start}-${end} de ${state.total} proveedores
          </p>
          <div class="flex items-center gap-2">
            <button onclick="window.goToPage(${state.page - 1})" ${state.page <= 1 ? 'disabled' : ''} class="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#E9E1D7] bg-white text-[#4D4637] hover:bg-[#FEF3C7] hover:border-[#755B00] transition-all ${state.page <= 1 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}">
              Anterior
            </button>
            <span class="text-xs text-[#4D4637] font-medium">Página ${state.page} de ${state.pages || 1}</span>
            <button onclick="window.goToPage(${state.page + 1})" ${state.page >= state.pages ? 'disabled' : ''} class="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#E9E1D7] bg-white text-[#4D4637] hover:bg-[#FEF3C7] hover:border-[#755B00] transition-all ${state.page >= state.pages ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}">
              Siguiente
            </button>
          </div>
        </div>
      </div>
    `}

    ${state.modalMode ? renderFormModal() : ''}
    ${state.deleteTarget ? renderDeleteModal() : ''}
  `;

  attachFormListeners();
}

function renderFormModal() {
  const isEdit = state.modalMode === "edit";
  const p = state.editingProvider || {};

  return `
    <div id="provider-form-modal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-12 overflow-y-auto" onclick="if(event.target===this)window.closeFormModal()">
      <div class="bg-white rounded-2xl shadow-2xl border border-[#E9E1D7] w-full max-w-2xl animate-scale-in my-4" onclick="event.stopPropagation()">
        <div class="flex items-center justify-between p-5 border-b border-[#E9E1D7]">
          <h3 class="text-lg font-bold text-[#1E1B15]">${isEdit ? 'Editar proveedor' : 'Nuevo proveedor'}</h3>
          <button onclick="window.closeFormModal()" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F8F5F0] transition-colors cursor-pointer">
            ${icon('x', 18)}
          </button>
        </div>

        <form id="provider-form" class="p-5 space-y-4" onsubmit="return false;">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-xs font-semibold tracking-widest text-[#4D4637] mb-1 uppercase">Nombre <span class="text-red-500">*</span></label>
              <input type="text" id="pf-name" value="${p.name || ''}" required class="w-full px-4 py-2.5 border border-[#E9E1D7] rounded-xl focus:outline-none focus:border-[#755B00] text-sm text-[#1E1B15]">
            </div>

            <div>
              <label class="block text-xs font-semibold tracking-widest text-[#4D4637] mb-1 uppercase">Categoría <span class="text-red-500">*</span></label>
              <select id="pf-category" required class="w-full px-4 py-2.5 border border-[#E9E1D7] rounded-xl focus:outline-none focus:border-[#755B00] text-sm text-[#1E1B15] bg-white">
                <option value="">Seleccionar...</option>
                ${state.categories.map(c => `
                  <option value="${c.id}" ${String(p.category_id) === String(c.id) ? 'selected' : ''}>${c.name}</option>
                `).join('')}
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold tracking-widest text-[#4D4637] mb-1 uppercase">Ubicación <span class="text-red-500">*</span></label>
              <input type="text" id="pf-address" value="${p.address || ''}" required class="w-full px-4 py-2.5 border border-[#E9E1D7] rounded-xl focus:outline-none focus:border-[#755B00] text-sm text-[#1E1B15]">
            </div>

            <div>
              <label class="block text-xs font-semibold tracking-widest text-[#4D4637] mb-1 uppercase">Teléfono</label>
              <input type="text" id="pf-phone" value="${p.phone || ''}" class="w-full px-4 py-2.5 border border-[#E9E1D7] rounded-xl focus:outline-none focus:border-[#755B00] text-sm text-[#1E1B15]">
            </div>

            <div>
              <label class="block text-xs font-semibold tracking-widest text-[#4D4637] mb-1 uppercase">Email</label>
              <input type="email" id="pf-email" value="${p.email || ''}" class="w-full px-4 py-2.5 border border-[#E9E1D7] rounded-xl focus:outline-none focus:border-[#755B00] text-sm text-[#1E1B15]">
            </div>

            <div>
              <label class="block text-xs font-semibold tracking-widest text-[#4D4637] mb-1 uppercase">Sitio web</label>
              <input type="url" id="pf-website" value="${p.website || ''}" placeholder="https://..." class="w-full px-4 py-2.5 border border-[#E9E1D7] rounded-xl focus:outline-none focus:border-[#755B00] text-sm text-[#1E1B15]">
            </div>

            <div class="md:col-span-2">
              <label class="block text-xs font-semibold tracking-widest text-[#4D4637] mb-1 uppercase">Descripción</label>
              <textarea id="pf-description" rows="3" class="w-full px-4 py-2.5 border border-[#E9E1D7] rounded-xl focus:outline-none focus:border-[#755B00] text-sm text-[#1E1B15] resize-none">${p.description || ''}</textarea>
            </div>

            <div>
              <label class="block text-xs font-semibold tracking-widest text-[#4D4637] mb-1 uppercase">Precio referencial</label>
              <input type="number" id="pf-price" value="${p.reference_price || ''}" min="0" step="0.01" class="w-full px-4 py-2.5 border border-[#E9E1D7] rounded-xl focus:outline-none focus:border-[#755B00] text-sm text-[#1E1B15]">
            </div>

            <div>
              <label class="block text-xs font-semibold tracking-widest text-[#4D4637] mb-1 uppercase">Unidad</label>
              <select id="pf-price-unit" class="w-full px-4 py-2.5 border border-[#E9E1D7] rounded-xl focus:outline-none focus:border-[#755B00] text-sm text-[#1E1B15] bg-white">
                <option value="">Seleccionar...</option>
                ${['por persona', 'por evento', 'por día', 'por hora'].map(u => `
                  <option value="${u}" ${p.price_unit === u ? 'selected' : ''}>${u}</option>
                `).join('')}
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold tracking-widest text-[#4D4637] mb-1 uppercase">Rating inicial</label>
              <input type="number" id="pf-rating" value="${p.rating || ''}" min="0" max="5" step="0.1" class="w-full px-4 py-2.5 border border-[#E9E1D7] rounded-xl focus:outline-none focus:border-[#755B00] text-sm text-[#1E1B15]">
            </div>

            <div>
              <label class="block text-xs font-semibold tracking-widest text-[#4D4637] mb-1 uppercase">URL de imagen</label>
              <input type="url" id="pf-image" value="${p.image_url || ''}" placeholder="https://..." class="w-full px-4 py-2.5 border border-[#E9E1D7] rounded-xl focus:outline-none focus:border-[#755B00] text-sm text-[#1E1B15]">
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-2 border-t border-[#E9E1D7]">
            <button type="button" onclick="window.closeFormModal()" class="px-5 py-2.5 text-sm font-medium text-[#4D4637] hover:text-[#1E1B15] transition-colors cursor-pointer rounded-xl hover:bg-[#F8F5F0]">
              Cancelar
            </button>
            <button type="submit" id="pf-submit" class="px-6 py-2.5 bg-[#755B00] text-white font-semibold rounded-xl text-sm hover:bg-[#5F4A00] transition-all cursor-pointer shadow-sm">
              ${isEdit ? 'Guardar cambios' : 'Crear proveedor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderDeleteModal() {
  return `
    <div id="delete-provider-modal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onclick="if(event.target===this)window.closeDeleteModal()">
      <div class="bg-white rounded-2xl shadow-2xl border border-[#E9E1D7] w-full max-w-sm p-6 text-center animate-scale-in" onclick="event.stopPropagation()">
        <div class="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          ${icon('alert-triangle', 24, 'text-red-600')}
        </div>
        <h3 class="text-xl font-bold text-[#1E1B15] mb-2">Eliminar proveedor</h3>
        <p class="text-sm text-[#4D4637] mb-1">¿Estás seguro de eliminar a <strong>${state.deleteTarget?.name || ''}</strong>?</p>
        <p class="text-xs text-[#9E8E6E] mb-6">Esta acción no se puede deshacer.</p>
        <div class="flex gap-3">
          <button onclick="window.closeDeleteModal()" class="flex-1 py-2.5 text-sm font-medium rounded-xl border border-[#E9E1D7] text-[#4D4637] hover:bg-[#F8F5F0] transition-all cursor-pointer">
            Cancelar
          </button>
          <button onclick="window.confirmDelete()" class="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all cursor-pointer shadow-sm">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  `;
}

function attachFormListeners() {
  const form = document.getElementById("provider-form");
  if (form) {
    form.addEventListener("submit", handleFormSubmit);
  }

  const searchInput = document.getElementById("admin-provider-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        state.searchTerm = e.target.value.trim();
        state.page = 1;
        refresh();
      }, 300);
    });
  }

  const categoryFilter = document.getElementById("admin-category-filter");
  if (categoryFilter) {
    categoryFilter.addEventListener("change", (e) => {
      state.selectedCategory = e.target.value;
      state.page = 1;
      refresh();
    });
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const isEdit = state.modalMode === "edit";
  const submitBtn = document.getElementById("pf-submit");
  if (!submitBtn) return;

  submitBtn.disabled = true;
  submitBtn.textContent = isEdit ? "Guardando..." : "Creando...";

  const body = {
    name: document.getElementById("pf-name").value,
    category_id: document.getElementById("pf-category").value,
    city_id: "d1000000-0000-0000-0000-000000000001",
    address: document.getElementById("pf-address").value,
    phone: document.getElementById("pf-phone").value || null,
    email: document.getElementById("pf-email").value || null,
    website: document.getElementById("pf-website").value || null,
    description: document.getElementById("pf-description").value || null,
    reference_price: parseFloat(document.getElementById("pf-price").value) || null,
    price_unit: document.getElementById("pf-price-unit").value || null,
    rating: parseFloat(document.getElementById("pf-rating").value) || null,
    image_url: document.getElementById("pf-image").value || null
  };

  try {
    if (isEdit) {
      await apiFetch(`/admin/providers/${state.editingProvider.id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      });
      showToast("Proveedor actualizado correctamente", "success");
    } else {
      await apiFetch("/admin/providers", {
        method: "POST",
        body: JSON.stringify(body)
      });
      showToast("Proveedor creado correctamente", "success");
    }
    state.modalMode = null;
    state.editingProvider = null;
    await refresh();
  } catch (err) {
    showToast(`Error: ${err.message}`, "error");
    submitBtn.disabled = false;
    submitBtn.textContent = isEdit ? "Guardar cambios" : "Crear proveedor";
  }
}

async function refresh() {
  await loadProviders();
  renderTable();
}

// Global handlers
window.openCreateModal = function () {
  state.modalMode = "create";
  state.editingProvider = null;
  renderTable();
};

window.openEditModal = async function (providerId) {
  try {
    const provider = await apiFetch(`/admin/providers/${providerId}`);
    state.modalMode = "edit";
    state.editingProvider = provider;
    renderTable();
  } catch (err) {
    showToast(`Error al cargar proveedor: ${err.message}`, "error");
  }
};

window.closeFormModal = function () {
  state.modalMode = null;
  state.editingProvider = null;
  renderTable();
};

window.openDeleteModal = function (providerId, providerName) {
  state.deleteTarget = { id: providerId, name: providerName };
  renderTable();
};

window.closeDeleteModal = function () {
  state.deleteTarget = null;
  renderTable();
};

window.confirmDelete = async function () {
  if (!state.deleteTarget) return;
  try {
    await apiFetch(`/admin/providers/${state.deleteTarget.id}`, {
      method: "DELETE"
    });
    showToast("Proveedor eliminado", "success");
    state.deleteTarget = null;
    await refresh();
  } catch (err) {
    showToast(`Error: ${err.message}`, "error");
    state.deleteTarget = null;
    renderTable();
  }
};

window.goToPage = function (page) {
  if (page < 1 || page > state.pages) return;
  state.page = page;
  refresh();
};

export async function AdminProvidersPage() {
  state = {
    providers: [], categories: [], categoryMap: {},
    page: 1, total: 0, pages: 0, perPage: 10,
    searchTerm: "", selectedCategory: "",
    loading: false, modalMode: null, editingProvider: null, deleteTarget: null
  };

  try {
    const cats = await getCategories();
    state.categories = cats;
    state.categoryMap = Object.fromEntries(cats.map(c => [c.id, c.name]));
  } catch (err) {
    console.error("Error loading categories:", err);
  }

  await refresh();

  return `
    <div class="flex min-h-screen bg-[#FFF8F1]">
      ${Sidebar("admin/providers")}
      <main class="flex-1 flex flex-col overflow-hidden">
        ${Topbar()}
        <div class="flex-1 overflow-auto">
          <div class="px-6 lg:px-10 py-8 lg:py-10 max-w-[1600px] mx-auto" id="admin-providers-content">
          </div>
        </div>
      </main>
    </div>
  `;
}
