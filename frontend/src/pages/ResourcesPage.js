import { Sidebar } from "../components/Sidebar.js";
import { Topbar } from "../components/Topbar.js";
import { getEventById, createEventItem, updateEventItem, deleteEventItem } from "../service/api.js";
import { showToast } from "../components/Toast.js";
import { icon } from "../components/Icons.js";

const _fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

let allResources = [];
let currentEventId = null;
let currentEventName = '';
let currentPage = 1;
const pageSize = 15;

export async function ResourcesPage(eventId) {
  let event = null;
  if (eventId) {
    try {
      event = await getEventById(eventId);
    } catch (error) {
      console.error(error);
    }
  }
  if (!event) {
    return `
      <div class="flex min-h-screen bg-[#F8F5F0]">
        ${Sidebar("events")}
        <main class="flex-1 flex flex-col overflow-hidden">
          ${Topbar()}
          <div class="flex-1 flex items-center justify-center p-8">
            <div class="text-center">
              <h2 class="text-2xl font-bold text-[#1E1B15] mb-4">Evento no encontrado</h2>
              <button onclick="window.history.back()" class="px-6 py-3 bg-[#755B00] text-white rounded-xl hover:bg-[#5F4A00] transition">Volver</button>
            </div>
          </div>
        </main>
      </div>
    `;
  }

  const resources = event.event_items || [];
  const confirmedCount = resources.filter(r => r.confirmed).length;
  const pendingCount = resources.length - confirmedCount;
  const totalCost = resources.reduce((s, r) => s + r.quantity * r.unit_price, 0);

  return `
    <div class="flex min-h-screen bg-[#F8F5F0]">
      ${Sidebar("events")}
      <main class="flex-1 flex flex-col overflow-hidden">
        ${Topbar(`
          <div class="flex items-center gap-6 lg:gap-8 animate-fade-in">
            <div class="flex items-center gap-4">
              <button onclick="window.history.back()" class="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#9E8E6E] hover:text-[#1E1B15] hover:shadow-sm transition-all border border-[#E9E1D7]">
                ${icon('chevron-left', 18)}
              </button>
              <div>
                <h1 class="text-2xl font-bold text-[#1E1B15]">Recursos</h1>
                <p class="text-[#9E8E6E] text-xs mt-0.5">${event.name}</p>
              </div>
            </div>
            <button id="btn-add-resource-page"
              class="px-5 py-2.5 bg-[#755B00] text-white rounded-xl text-sm font-semibold hover:bg-[#5F4A00] transition-all shadow-sm flex items-center gap-2">
              ${icon('plus', 18)}
              Agregar Recurso
            </button>
          </div>
        `)}

        <div class="flex-1 overflow-auto custom-scrollbar">
          <div class="p-4 lg:p-8 max-w-7xl mx-auto">

            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-fade-in-up">
              <div class="bg-white rounded-2xl border border-gray-200 p-4 lg:p-5 shadow-sm">
                <p class="text-sm text-[#9E8E6E]">Total recursos</p>
                <p class="text-3xl font-bold text-[#1E1B15] mt-1">${resources.length}</p>
              </div>
              <div class="bg-white rounded-2xl border border-gray-200 p-4 lg:p-5 shadow-sm">
                <p class="text-sm text-[#9E8E6E]">Confirmados</p>
                <p class="text-3xl font-bold text-green-600 mt-1">${confirmedCount}</p>
              </div>
              <div class="bg-white rounded-2xl border border-gray-200 p-4 lg:p-5 shadow-sm">
                <p class="text-sm text-[#9E8E6E]">Pendientes</p>
                <p class="text-3xl font-bold text-amber-600 mt-1">${pendingCount}</p>
              </div>
              <div class="bg-white rounded-2xl border border-gray-200 p-4 lg:p-5 shadow-sm">
                <p class="text-sm text-[#9E8E6E]">Costo total</p>
                <p class="text-3xl font-bold text-[#755B00] mt-1">${_fmt(totalCost)}</p>
              </div>
            </div>

            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in-up">
              <div class="p-4 lg:p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div class="relative w-full md:max-w-md">
                  ${icon('search', 20, 'absolute left-3 top-1/2 -translate-y-1/2 text-gray-400')}
                  <input type="text" id="resource-search" placeholder="Buscar por nombre o nota..."
                    class="w-full pl-10 pr-4 py-2.5 border border-[#E9E1D7] rounded-xl focus:border-[#755B00] focus:outline-none text-sm bg-white">
                </div>
                <div class="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-3 w-full md:w-auto">
                  <select id="resource-filter" class="w-full md:w-auto px-4 py-2.5 border border-[#E9E1D7] rounded-xl focus:border-[#755B00] focus:outline-none text-sm bg-white">
                    <option value="all">Todos</option>
                    <option value="confirmed">Confirmados</option>
                    <option value="pending">Pendientes</option>
                  </select>
                  <select id="resource-sort" class="w-full md:w-auto px-4 py-2.5 border border-[#E9E1D7] rounded-xl focus:border-[#755B00] focus:outline-none text-sm bg-white">
                    <option value="name-asc">Nombre A-Z</option>
                    <option value="name-desc">Nombre Z-A</option>
                    <option value="qty-desc">Cantidad</option>
                    <option value="price-desc">Precio</option>
                    <option value="total-desc">Total</option>
                    <option value="status">Estado</option>
                  </select>
                </div>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-sm" id="resources-table">
                  <thead class="bg-[#F8F5F0]">
                    <tr class="border-b border-gray-100">
                      <th class="text-left py-3 px-5 font-semibold text-[#9E8E6E] uppercase tracking-wider text-xs">Nombre</th>
                      <th class="text-left py-3 px-5 font-semibold text-[#9E8E6E] uppercase tracking-wider text-xs">Cantidad</th>
                      <th class="text-left py-3 px-5 font-semibold text-[#9E8E6E] uppercase tracking-wider text-xs">Precio unit.</th>
                      <th class="text-left py-3 px-5 font-semibold text-[#9E8E6E] uppercase tracking-wider text-xs">Total</th>
                      <th class="text-left py-3 px-5 font-semibold text-[#9E8E6E] uppercase tracking-wider text-xs">Notas</th>
                      <th class="text-center py-3 px-5 font-semibold text-[#9E8E6E] uppercase tracking-wider text-xs">Estado</th>
                      <th class="text-center py-3 px-5 font-semibold text-[#9E8E6E] uppercase tracking-wider text-xs">Acciones</th>
                    </tr>
                  </thead>
                  <tbody id="resources-tbody"></tbody>
                </table>
              </div>

              <div class="p-4 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-3" id="pagination-container">
                <p class="text-sm text-[#9E8E6E]" id="pagination-info">Mostrando 0 de 0 recursos</p>
                <div class="flex gap-2 flex-wrap justify-center" id="pagination-buttons"></div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  `;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildResourceRow(item) {
  const total = item.quantity * item.unit_price;
  return `
    <tr class="border-b border-gray-50 hover:bg-[#FFF8F1]/50 transition-colors" data-item-id="${item.id}">
      <td class="py-4 px-5 font-medium text-[#1E1B15]">${escapeHtml(item.name)}</td>
      <td class="py-4 px-5 text-[#4D4637]">${item.quantity}</td>
      <td class="py-4 px-5 text-[#4D4637]">${_fmt(item.unit_price)}</td>
      <td class="py-4 px-5 font-semibold text-[#755B00]">${_fmt(total)}</td>
      <td class="py-4 px-5 text-[#9E8E6E] max-w-[150px] truncate block" title="${escapeHtml(item.notes || '')}">${item.notes ? escapeHtml(item.notes) : '—'}</td>
      <td class="py-4 px-5 text-center">
        <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${item.confirmed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}">
          ${item.confirmed ? 'Confirmado' : 'Pendiente'}
        </span>
      </td>
      <td class="py-4 px-5 text-center">
        <div class="flex items-center justify-center gap-2">
          <button class="toggle-resource relative w-10 h-5 rounded-full transition-colors cursor-pointer border-none ${item.confirmed ? 'bg-[#C9A84C]' : 'bg-gray-300'}" data-id="${item.id}" title="${item.confirmed ? 'Marcar pendiente' : 'Marcar confirmado'}">
            <span class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${item.confirmed ? 'translate-x-5' : ''}"></span>
          </button>
          <button class="edit-resource p-1.5 rounded-lg hover:bg-green-50 transition-colors cursor-pointer" data-id="${item.id}" data-name="${escapeHtml(item.name)}" data-quantity="${item.quantity}" data-price="${item.unit_price}" data-notes="${escapeHtml(item.notes || '')}" title="Editar">
            ${icon('pencil', 16, 'text-green-600')}
          </button>
          <button class="delete-resource p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer" data-id="${item.id}" title="Eliminar">
            ${icon('trash', 16, 'text-red-600')}
          </button>
        </div>
      </td>
    </tr>
  `;
}

function renderSkeletonRows(count = 5) {
  const tbody = document.getElementById("resources-tbody");
  if (!tbody) return;
  tbody.innerHTML = Array(count).fill(0).map(() => `
    <tr class="border-b border-gray-50">
      <td class="py-4 px-5"><div class="h-4 w-3/4 bg-gray-200 animate-pulse rounded"></div></td>
      <td class="py-4 px-5"><div class="h-4 w-12 bg-gray-200 animate-pulse rounded"></div></td>
      <td class="py-4 px-5"><div class="h-4 w-16 bg-gray-200 animate-pulse rounded"></div></td>
      <td class="py-4 px-5"><div class="h-4 w-16 bg-gray-200 animate-pulse rounded"></div></td>
      <td class="py-4 px-5"><div class="h-4 w-full bg-gray-200 animate-pulse rounded"></div></td>
      <td class="py-4 px-5 text-center"><div class="h-6 w-24 mx-auto bg-gray-200 animate-pulse rounded-full"></div></td>
      <td class="py-4 px-5 text-center"><div class="h-4 w-20 mx-auto bg-gray-200 animate-pulse rounded"></div></td>
    </tr>
  `).join("");
}

function filterAndSortResources(resources, search, filter, sort) {
  let result = [...resources];
  if (search) {
    const s = search.toLowerCase();
    result = result.filter(r =>
      r.name.toLowerCase().includes(s) ||
      (r.notes || "").toLowerCase().includes(s)
    );
  }
  if (filter === "confirmed") result = result.filter(r => r.confirmed);
  else if (filter === "pending") result = result.filter(r => !r.confirmed);
  switch (sort) {
    case "name-asc": result.sort((a, b) => a.name.localeCompare(b.name)); break;
    case "name-desc": result.sort((a, b) => b.name.localeCompare(a.name)); break;
    case "qty-desc": result.sort((a, b) => b.quantity - a.quantity); break;
    case "price-desc": result.sort((a, b) => b.unit_price - a.unit_price); break;
    case "total-desc": result.sort((a, b) => (b.quantity * b.unit_price) - (a.quantity * a.unit_price)); break;
    case "status": result.sort((a, b) => (b.confirmed === a.confirmed ? 0 : b.confirmed ? 1 : -1)); break;
  }
  return result;
}

function renderResourcesTable(resources) {
  const tbody = document.getElementById("resources-tbody");
  if (!tbody) return;
  if (resources.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="py-12 text-center text-[#9E8E6E]">
          No hay recursos registrados
        </td>
      </tr>
    `;
    return;
  }
  tbody.innerHTML = resources.map(r => buildResourceRow(r)).join("");
}

function updatePagination(resources) {
  const totalPages = Math.ceil(resources.length / pageSize) || 1;
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, resources.length);
  const info = document.getElementById("pagination-info");
  if (info) info.textContent = `Mostrando ${resources.length ? start : 0}-${end} de ${resources.length} recursos`;
  const btnContainer = document.getElementById("pagination-buttons");
  if (!btnContainer) return;
  btnContainer.innerHTML = "";
  if (totalPages <= 1) return;
  const createBtn = (page, text, disabled = false, active = false) => {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.disabled = disabled;
    btn.className = `px-3 py-1.5 rounded-lg text-sm font-medium transition ${active ? 'bg-[#755B00] text-white' : 'bg-white border border-[#E9E1D7] text-[#4D4637] hover:bg-[#FEF3C7]'}`;
    if (!disabled) btn.onclick = () => goToPage(page);
    return btn;
  };
  btnContainer.appendChild(createBtn(currentPage - 1, "← Anterior", currentPage === 1));
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);
  if (startPage > 1) {
    btnContainer.appendChild(createBtn(1, "1"));
    if (startPage > 2) {
      const ellipsis = document.createElement("span");
      ellipsis.className = "px-2 text-[#9E8E6E]";
      ellipsis.textContent = "…";
      btnContainer.appendChild(ellipsis);
    }
  }
  for (let p = startPage; p <= endPage; p++) {
    btnContainer.appendChild(createBtn(p, String(p), false, p === currentPage));
  }
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      const ellipsis = document.createElement("span");
      ellipsis.className = "px-2 text-[#9E8E6E]";
      ellipsis.textContent = "…";
      btnContainer.appendChild(ellipsis);
    }
    btnContainer.appendChild(createBtn(totalPages, String(totalPages)));
  }
  btnContainer.appendChild(createBtn(currentPage + 1, "Siguiente →", currentPage === totalPages));
}

function goToPage(page) {
  currentPage = page;
  const search = document.getElementById("resource-search")?.value || "";
  const filter = document.getElementById("resource-filter")?.value || "all";
  const sort = document.getElementById("resource-sort")?.value || "name-asc";
  const filtered = filterAndSortResources(allResources, search, filter, sort);
  updatePagination(filtered);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  renderResourcesTable(paginated);
}

async function loadResources(eventId, onLoaded) {
  try {
    const event = await getEventById(eventId);
    allResources = event.event_items || [];
    onLoaded();
  } catch (error) {
    console.error(error);
    showToast("Error al cargar recursos", "error");
  }
}

export function initResourcesPage(eventId) {
  currentEventId = eventId;
  currentPage = 1;
  renderSkeletonRows();

  const searchInput = document.getElementById("resource-search");
  const filterSelect = document.getElementById("resource-filter");
  const sortSelect = document.getElementById("resource-sort");

  const refresh = () => {
    const search = searchInput?.value || "";
    const filter = filterSelect?.value || "all";
    const sort = sortSelect?.value || "name-asc";
    const filtered = filterAndSortResources(allResources, search, filter, sort);
    updatePagination(filtered);
    const paginated = filtered.slice(0, pageSize);
    renderResourcesTable(paginated);
  };

  searchInput?.addEventListener("input", () => { currentPage = 1; refresh(); });
  filterSelect?.addEventListener("change", () => { currentPage = 1; refresh(); });
  sortSelect?.addEventListener("change", () => { currentPage = 1; refresh(); });

  document.getElementById("btn-add-resource-page")?.addEventListener("click", () => {
    const name = prompt("Nombre del recurso:");
    if (!name) return;
    const quantity = parseInt(prompt("Cantidad:"), 10);
    if (!quantity) return;
    const price = parseFloat(prompt("Precio unitario:"));
    if (isNaN(price)) return;
    const notes = prompt("Notas (opcional):") || "";
    (async () => {
      try {
        const updated = await createEventItem(eventId, { name, quantity, unit_price: price, notes: notes || null });
        allResources = updated.event_items || [];
        refresh();
        showToast("Recurso agregado");
      } catch (err) {
        showToast(err.message || "Error al crear recurso", "error");
      }
    })();
  });

  document.getElementById("resources-tbody")?.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const row = btn.closest("tr[data-item-id]");
    if (!row) return;
    const itemId = row.dataset.itemId;

    if (btn.classList.contains("toggle-resource")) {
      const item = allResources.find(r => r.id === itemId);
      if (!item) return;
      const newConfirmed = !item.confirmed;
      (async () => {
        try {
          const updated = await updateEventItem(eventId, itemId, { confirmed: newConfirmed });
          allResources = updated.event_items || [];
          refresh();
        } catch (err) {
          showToast(err.message || "Error al actualizar recurso", "error");
        }
      })();
    }

    if (btn.classList.contains("edit-resource")) {
      const name = prompt("Nombre:", btn.dataset.name);
      if (!name) return;
      const quantity = parseInt(prompt("Cantidad:", btn.dataset.quantity), 10);
      if (!quantity) return;
      const price = parseFloat(prompt("Precio unitario:", btn.dataset.price));
      if (isNaN(price)) return;
      const notes = prompt("Notas:", btn.dataset.notes) || "";
      (async () => {
        try {
          const updated = await updateEventItem(eventId, itemId, { name, quantity, unit_price: price, notes: notes || null });
          allResources = updated.event_items || [];
          refresh();
          showToast("Recurso actualizado");
        } catch (err) {
          showToast(err.message || "Error al actualizar recurso", "error");
        }
      })();
    }

    if (btn.classList.contains("delete-resource")) {
      if (!confirm("¿Eliminar este recurso?")) return;
      (async () => {
        try {
          const updated = await deleteEventItem(eventId, itemId);
          allResources = updated.event_items || [];
          refresh();
          showToast("Recurso eliminado");
        } catch (err) {
          showToast(err.message || "Error al eliminar recurso", "error");
        }
      })();
    }
  });

  loadResources(eventId, refresh);
}
