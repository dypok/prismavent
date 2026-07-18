import { Sidebar } from "../components/Sidebar.js";
import { Topbar } from "../components/Topbar.js";
import { icon } from "../components/Icons.js";
import { showToast } from "../components/Toast.js";
import { apiFetch } from "../service/api.js";

let state = { categories: [], loading: false, modalMode: null, editingCategory: null, deleteTarget: null };

async function loadCategories() {
  try {
    const data = await apiFetch("/admin/provider-categories");
    state.categories = data || [];
  } catch (err) {
    console.error("Error loading categories:", err);
    state.categories = [];
  }
}

function render() {
  const container = document.getElementById("admin-categories-content");
  if (!container) return;

  container.innerHTML = `
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-3xl lg:text-4xl font-bold text-[#1E1B15] tracking-tight">Categorías</h1>
        <p class="text-sm text-[#9E8E6E] mt-1">Administra las categorías de proveedores</p>
      </div>
      <button onclick="window.openCreateCategoryModal()" class="flex items-center gap-2 px-5 py-2.5 bg-[#755B00] text-white font-semibold rounded-xl hover:bg-[#5F4A00] transition-all cursor-pointer shrink-0">
        ${icon('plus', 18)} Nueva categoría
      </button>
    </div>

    ${state.categories.length === 0 ? `
      <div class="flex flex-col items-center justify-center py-20 text-[#9E8E6E]">
        <span class="text-5xl mb-4 opacity-50">${icon('folder', 48, 'opacity-30')}</span>
        <p class="text-lg font-medium">No hay categorías</p>
        <p class="text-sm mt-1">Crea una nueva categoría para empezar</p>
      </div>
    ` : `
      <div class="bg-white rounded-2xl border border-[#E9E1D7] overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-[#E9E1D7] bg-[#F8F5F0]">
                <th class="text-left px-4 py-3 font-semibold text-[#4D4637] text-xs tracking-widest uppercase">Nombre</th>
                <th class="text-center px-4 py-3 font-semibold text-[#4D4637] text-xs tracking-widest uppercase hidden sm:table-cell">Proveedores</th>
                <th class="text-center px-4 py-3 font-semibold text-[#4D4637] text-xs tracking-widest uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${state.categories.map(c => `
                <tr class="border-b border-[#E9E1D7] hover:bg-[#FEF3C7]/30 transition-colors">
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-[#FEF3C7] to-[#F8F5F0] flex items-center justify-center shrink-0">
                        ${icon('folder', 16, 'text-[#755B00] opacity-60')}
                      </div>
                      <span class="font-semibold text-[#1E1B15]">${c.name}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-center hidden sm:table-cell">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#F8F5F0] text-sm font-semibold text-[#4D4637]">${c.provider_count || 0}</span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center justify-center gap-2">
                      <button onclick="window.openEditCategoryModal('${c.id}')" class="w-8 h-8 flex items-center justify-center rounded-lg text-[#9E8E6E] hover:text-[#755B00] hover:bg-[#FEF3C7] transition-all cursor-pointer" title="Editar">
                        ${icon('pencil', 16)}
                      </button>
                      <button onclick="window.openDeleteCategoryModal('${c.id}', '${c.name.replace(/'/g, "\\'")}')" class="w-8 h-8 flex items-center justify-center rounded-lg text-[#9E8E6E] hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer" title="Eliminar">
                        ${icon('trash-2', 16)}
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `}

    ${state.modalMode ? renderFormModal() : ''}
    ${state.deleteTarget ? renderDeleteModal() : ''}
  `;

  attachListeners();
}

function renderFormModal() {
  const isEdit = state.modalMode === "edit";
  const c = state.editingCategory || {};

  return `
    <div id="category-form-modal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onclick="if(event.target===this)window.closeCategoryFormModal()">
      <div class="bg-white rounded-2xl shadow-2xl border border-[#E9E1D7] w-full max-w-md animate-scale-in" onclick="event.stopPropagation()">
        <div class="flex items-center justify-between p-5 border-b border-[#E9E1D7]">
          <h3 class="text-lg font-bold text-[#1E1B15]">${isEdit ? 'Editar categoría' : 'Nueva categoría'}</h3>
          <button onclick="window.closeCategoryFormModal()" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F8F5F0] transition-colors cursor-pointer">
            ${icon('x', 18)}
          </button>
        </div>
        <form id="category-form" class="p-5 space-y-4" onsubmit="return false;">
          <div>
            <label class="block text-xs font-semibold tracking-widest text-[#4D4637] mb-1 uppercase">Nombre <span class="text-red-500">*</span></label>
            <input type="text" id="cf-name" value="${c.name || ''}" required class="w-full px-4 py-2.5 border border-[#E9E1D7] rounded-xl focus:outline-none focus:border-[#755B00] text-sm text-[#1E1B15]" placeholder="Ej: Catering, Sonido, Decoración...">
          </div>
          <div class="flex justify-end gap-3 pt-2 border-t border-[#E9E1D7]">
            <button type="button" onclick="window.closeCategoryFormModal()" class="px-5 py-2.5 text-sm font-medium text-[#4D4637] hover:text-[#1E1B15] transition-colors cursor-pointer rounded-xl hover:bg-[#F8F5F0]">
              Cancelar
            </button>
            <button type="submit" id="cf-submit" class="px-6 py-2.5 bg-[#755B00] text-white font-semibold rounded-xl text-sm hover:bg-[#5F4A00] transition-all cursor-pointer shadow-sm">
              ${isEdit ? 'Guardar cambios' : 'Crear categoría'}
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderDeleteModal() {
  return `
    <div id="delete-category-modal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onclick="if(event.target===this)window.closeDeleteCategoryModal()">
      <div class="bg-white rounded-2xl shadow-2xl border border-[#E9E1D7] w-full max-w-sm p-6 text-center animate-scale-in" onclick="event.stopPropagation()">
        <div class="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          ${icon('alert-triangle', 24, 'text-red-600')}
        </div>
        <h3 class="text-xl font-bold text-[#1E1B15] mb-2">Eliminar categoría</h3>
        <p class="text-sm text-[#4D4637] mb-1">¿Estás seguro de eliminar <strong>${state.deleteTarget?.name || ''}</strong>?</p>
        <p class="text-xs text-[#9E8E6E] mb-2">Esta acción no se puede deshacer.</p>
        <p id="delete-category-warning" class="text-xs text-amber-600 hidden mb-4"></p>
        <div class="flex gap-3">
          <button onclick="window.closeDeleteCategoryModal()" class="flex-1 py-2.5 text-sm font-medium rounded-xl border border-[#E9E1D7] text-[#4D4637] hover:bg-[#F8F5F0] transition-all cursor-pointer">
            Cancelar
          </button>
          <button onclick="window.confirmDeleteCategory()" class="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all cursor-pointer shadow-sm">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  `;
}

function attachListeners() {
  document.getElementById("category-form")?.addEventListener("submit", handleFormSubmit);
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const isEdit = state.modalMode === "edit";
  const submitBtn = document.getElementById("cf-submit");
  if (!submitBtn) return;

  submitBtn.disabled = true;
  submitBtn.textContent = isEdit ? "Guardando..." : "Creando...";

  const name = document.getElementById("cf-name").value.trim();
  if (!name) { submitBtn.disabled = false; submitBtn.textContent = isEdit ? "Guardar cambios" : "Crear categoría"; return; }

  try {
    if (isEdit) {
      await apiFetch(`/admin/provider-categories/${state.editingCategory.id}`, {
        method: "PUT", body: JSON.stringify({ name })
      });
      showToast("Categoría actualizada", "success");
    } else {
      await apiFetch("/admin/provider-categories", {
        method: "POST", body: JSON.stringify({ name })
      });
      showToast("Categoría creada", "success");
    }
    state.modalMode = null;
    state.editingCategory = null;
    await loadCategories();
    render();
  } catch (err) {
    showToast(`Error: ${err.message}`, "error");
    submitBtn.disabled = false;
    submitBtn.textContent = isEdit ? "Guardar cambios" : "Crear categoría";
  }
}

window.openCreateCategoryModal = function () {
  state.modalMode = "create"; state.editingCategory = null; render();
};

window.openEditCategoryModal = async function (id) {
  const cat = state.categories.find(c => c.id === id);
  if (!cat) return;
  state.modalMode = "edit"; state.editingCategory = cat; render();
};

window.closeCategoryFormModal = function () {
  state.modalMode = null; state.editingCategory = null; render();
};

window.openDeleteCategoryModal = function (id, name) {
  const cat = state.categories.find(c => c.id === id);
  const hasProviders = cat && cat.provider_count > 0;
  state.deleteTarget = { id, name, hasProviders };
  render();

  const warning = document.getElementById("delete-category-warning");
  if (warning && hasProviders) {
    warning.textContent = `⚠ ${cat.provider_count} proveedor(es) usan esta categoría. No se puede eliminar.`;
    warning.classList.remove("hidden");
  }
};

window.closeDeleteCategoryModal = function () {
  state.deleteTarget = null; render();
};

window.confirmDeleteCategory = async function () {
  if (!state.deleteTarget || state.deleteTarget.hasProviders) return;
  try {
    await apiFetch(`/admin/provider-categories/${state.deleteTarget.id}`, { method: "DELETE" });
    showToast("Categoría eliminada", "success");
    state.deleteTarget = null;
    await loadCategories();
    render();
  } catch (err) {
    showToast(`Error: ${err.message}`, "error");
    state.deleteTarget = null; render();
  }
};

export async function AdminCategoriesPage() {
  state = { categories: [], loading: false, modalMode: null, editingCategory: null, deleteTarget: null };

  try {
    const data = await apiFetch("/admin/provider-categories");
    state.categories = data || [];
  } catch (err) {
    console.error("Error loading categories:", err);
  }

  return `
    <div class="flex min-h-screen bg-[#FFF8F1]">
      ${Sidebar("admin/categories")}
      <main class="flex-1 flex flex-col overflow-hidden">
        ${Topbar()}
        <div class="flex-1 overflow-auto">
          <div class="px-6 lg:px-10 py-8 lg:py-10 max-w-[1200px] mx-auto">
            <div class="flex items-center gap-4 mb-8 border-b border-[#E9E1D7] pb-4">
              <a href="/admin/providers" onclick="event.preventDefault(); navigateTo('/admin/providers')" class="px-4 py-2 text-sm font-medium rounded-lg text-[#4D4637] hover:bg-[#FEF3C7] hover:text-[#755B00] transition-all">Proveedores</a>
              <a href="/admin/categories" onclick="event.preventDefault(); navigateTo('/admin/categories')" class="px-4 py-2 text-sm font-medium rounded-lg bg-[#755B00] text-white transition-all">Categorías</a>
            </div>
            <div id="admin-categories-content">
              ${state.categories.length === 0 ? `
                <div class="flex flex-col items-center justify-center py-20 text-[#9E8E6E]">
                  <span class="text-5xl mb-4 opacity-50">${icon('layout', 48, 'opacity-30')}</span>
                  <p class="text-lg font-medium">No hay categorías</p>
                  <p class="text-sm mt-1">Crea una nueva categoría para empezar</p>
                </div>
              ` : `
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h1 class="text-3xl lg:text-4xl font-bold text-[#1E1B15] tracking-tight">Categorías</h1>
                    <p class="text-sm text-[#9E8E6E] mt-1">Administra las categorías de proveedores</p>
                  </div>
                  <button onclick="window.openCreateCategoryModal()" class="flex items-center gap-2 px-5 py-2.5 bg-[#755B00] text-white font-semibold rounded-xl hover:bg-[#5F4A00] transition-all cursor-pointer shrink-0">
                    ${icon('plus', 18)} Nueva categoría
                  </button>
                </div>
                <div class="bg-white rounded-2xl border border-[#E9E1D7] overflow-hidden shadow-sm">
                  <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                      <thead>
                        <tr class="border-b border-[#E9E1D7] bg-[#F8F5F0]">
                          <th class="text-left px-4 py-3 font-semibold text-[#4D4637] text-xs tracking-widest uppercase">Nombre</th>
                          <th class="text-center px-4 py-3 font-semibold text-[#4D4637] text-xs tracking-widest uppercase hidden sm:table-cell">Proveedores</th>
                          <th class="text-center px-4 py-3 font-semibold text-[#4D4637] text-xs tracking-widest uppercase">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${state.categories.map(c => `
                          <tr class="border-b border-[#E9E1D7] hover:bg-[#FEF3C7]/30 transition-colors">
                            <td class="px-4 py-3">
                              <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-[#FEF3C7] to-[#F8F5F0] flex items-center justify-center shrink-0">
                                  ${icon('layout', 16, 'text-[#755B00] opacity-60')}
                                </div>
                                <span class="font-semibold text-[#1E1B15]">${c.name}</span>
                              </div>
                            </td>
                            <td class="px-4 py-3 text-center hidden sm:table-cell">
                              <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#F8F5F0] text-sm font-semibold text-[#4D4637]">${c.provider_count || 0}</span>
                            </td>
                            <td class="px-4 py-3">
                              <div class="flex items-center justify-center gap-2">
                                <button onclick="window.openEditCategoryModal('${c.id}')" class="w-8 h-8 flex items-center justify-center rounded-lg text-[#9E8E6E] hover:text-[#755B00] hover:bg-[#FEF3C7] transition-all cursor-pointer" title="Editar">
                                  ${icon('pencil', 16)}
                                </button>
                                <button onclick="window.openDeleteCategoryModal('${c.id}', '${c.name.replace(/'/g, "\\'")}')" class="w-8 h-8 flex items-center justify-center rounded-lg text-[#9E8E6E] hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer" title="Eliminar">
                                  ${icon('trash-2', 16)}
                                </button>
                              </div>
                            </td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                </div>
              `}
            </div>
          </div>
        </div>
      </main>
    </div>
  `;
}
