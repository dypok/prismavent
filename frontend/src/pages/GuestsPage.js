import { Sidebar } from "../components/Sidebar.js";
import { Topbar } from "../components/Topbar.js";
import { GuestModal } from "../components/GuestModal.js";
import { getEventById, getEventGuests, createGuest, updateGuest, deleteGuest } from "../service/api.js";
import { showToast } from "../components/Toast.js";
import { icon } from "../components/Icons.js";

export async function GuestsPage(eventId) {
  let event = null;
  let guests = [];

  if (eventId) {
    try {
      event = await getEventById(eventId);
      guests = await getEventGuests(eventId);
    } catch (error) {
      console.error(error);
    }
  }

  const confirmedCount = guests.filter(g => g.confirmed).length;
  const pendingCount = guests.length - confirmedCount;

  return `
    <div class="flex min-h-screen bg-[#F8F5F0]" id="guests-page">
      ${Sidebar("events")}

      <main class="flex-1 flex flex-col overflow-hidden">
        ${Topbar(`
          <div class="flex items-center gap-6 lg:gap-8 animate-fade-in" style="animation-delay: 0.1s;">
            <div class="flex items-center gap-4">
              <button onclick="window.history.back()" class="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#9E8E6E] hover:text-[#1E1B15] hover:shadow-sm transition-all border border-[#E9E1D7]">
                ${icon('chevron-left', 18)}
              </button>
              <div>
                <h1 class="text-2xl font-bold text-[#1E1B15]">Invitados</h1>
                <p class="text-[#9E8E6E] text-xs mt-0.5">${event?.name || "Evento"}</p>
              </div>
            </div>
            <button
              id="btn-add-guest-page"
              class="px-5 py-2.5 bg-[#755B00] text-white rounded-xl text-sm font-semibold hover:bg-[#5F4A00] transition-all shadow-sm flex items-center gap-2"
            >
              ${icon('plus', 18)}
              Agregar Invitado
            </button>
          </div>
        `)}

        <div class="flex-1 overflow-auto custom-scrollbar">
          <div class="p-8 max-w-7xl mx-auto">
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-fade-in-up" style="animation-delay: 0.2s;">
              <div class="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <p class="text-sm text-[#9E8E6E]">Total invitados</p>
                <p class="text-3xl font-bold text-[#1E1B15] mt-1">${guests.length}</p>
              </div>
              <div class="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <p class="text-sm text-[#9E8E6E]">Confirmados</p>
                <p class="text-3xl font-bold text-green-600 mt-1">${confirmedCount}</p>
              </div>
              <div class="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <p class="text-sm text-[#9E8E6E]">Pendientes</p>
                <p class="text-3xl font-bold text-amber-600 mt-1">${pendingCount}</p>
              </div>
            </div>

            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in-up" style="animation-delay: 0.3s;">
              <div class="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div class="relative max-w-md w-full">
                  ${icon('search', 20, 'absolute left-3 top-1/2 -translate-y-1/2 text-gray-400')}
                  <input
                    type="text"
                    id="guest-search"
                    placeholder="Buscar por nombre o nota..."
                    class="w-full pl-10 pr-4 py-2.5 border border-[#E9E1D7] rounded-xl focus:border-[#755B00] focus:outline-none text-sm bg-white"
                  >
                </div>
                <div class="flex items-center gap-3">
                  <select id="guest-filter" class="px-4 py-2.5 border border-[#E9E1D7] rounded-xl focus:border-[#755B00] focus:outline-none text-sm bg-white">
                    <option value="all">Todos</option>
                    <option value="confirmed">Confirmados</option>
                    <option value="pending">Pendientes</option>
                  </select>
                  <select id="guest-sort" class="px-4 py-2.5 border border-[#E9E1D7] rounded-xl focus:border-[#755B00] focus:outline-none text-sm bg-white">
                    <option value="name-asc">Nombre A-Z</option>
                    <option value="name-desc">Nombre Z-A</option>
                    <option value="status">Estado</option>
                    <option value="recent">Más recientes</option>
                  </select>
                </div>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-sm" id="guests-table">
                  <thead class="bg-[#F8F5F0]">
                    <tr class="border-b border-gray-100">
                      <th class="text-left py-3 px-5 font-semibold text-[#9E8E6E] uppercase tracking-wider text-xs">Nombre</th>
                      <th class="text-left py-3 px-5 font-semibold text-[#9E8E6E] uppercase tracking-wider text-xs">Nota</th>
                      <th class="text-center py-3 px-5 font-semibold text-[#9E8E6E] uppercase tracking-wider text-xs">Estado</th>
                      <th class="text-center py-3 px-5 font-semibold text-[#9E8E6E] uppercase tracking-wider text-xs">Acciones</th>
                    </tr>
                  </thead>
                  <tbody id="guests-tbody">
                  </tbody>
                </table>
              </div>

              <div class="p-4 border-t border-gray-100 flex items-center justify-between" id="pagination-container">
                <p class="text-sm text-[#9E8E6E]" id="pagination-info">Mostrando 0 de 0 invitados</p>
                <div class="flex gap-2" id="pagination-buttons"></div>
              </div>
            </div>

          </div>
        </div>
      </main>

      ${GuestModal()}
    </div>
  `;
}

let currentPage = 1;
const pageSize = 20;
let allGuests = [];
let currentEventId = null;

function renderGuestsTable(guests, eventId) {
  const tbody = document.getElementById("guests-tbody");
  if (!tbody) return;

  if (guests.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="py-12 text-center text-[#9E8E6E]">
          No hay invitados registrados
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = guests.map(guest => `
    <tr class="border-b border-gray-50 hover:bg-[#FFF8F1]/50 transition-colors">
      <td class="py-4 px-5 font-medium text-[#1E1B15]">${escapeHtml(guest.full_name)}</td>
      <td class="py-4 px-5 text-[#9E8E6E] max-w-xs truncate block" title="${escapeHtml(guest.notes || "")}">${escapeHtml(guest.notes || "—")}</td>
      <td class="py-4 px-5 text-center">
        <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${guest.confirmed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}">
          ${guest.confirmed ? icon('check-circle', 14, 'text-green-700') + ' Confirmado' : icon('clock', 14, 'text-amber-700') + ' Pendiente'}
        </span>
      </td>
      <td class="py-4 px-5 text-center">
        <div class="flex items-center justify-center gap-2">
          <button
            class="edit-guest text-[#755B00] font-medium hover:underline text-sm"
            data-id="${guest.id}"
            data-name="${escapeHtml(guest.full_name)}"
            data-notes="${escapeHtml(guest.notes || "")}"
            data-confirmed="${guest.confirmed}"
          >
            Editar
          </button>
          <button
            class="delete-guest text-red-600 font-medium hover:underline text-sm"
            data-id="${guest.id}"
          >
            Eliminar
          </button>
        </div>
      </td>
    </tr>
  `).join("");
}

function renderSkeletonRows(count = 5) {
  const tbody = document.getElementById("guests-tbody");
  if (!tbody) return;
  
  tbody.innerHTML = Array(count).fill(0).map(() => `
    <tr class="border-b border-gray-50">
      <td class="py-4 px-5"><div class="h-4 w-3/4 bg-gray-200 animate-pulse rounded"></div></td>
      <td class="py-4 px-5"><div class="h-4 w-full bg-gray-200 animate-pulse rounded"></div></td>
      <td class="py-4 px-5 text-center"><div class="h-6 w-24 mx-auto bg-gray-200 animate-pulse rounded-full"></div></td>
      <td class="py-4 px-5 text-center"><div class="h-4 w-20 mx-auto bg-gray-200 animate-pulse rounded"></div></td>
    </tr>
  `).join("");
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, String.fromCharCode(39) + '#39;');
}

function filterAndSortGuests(guests, search, filter, sort) {
  let result = [...guests];

  if (search) {
    const s = search.toLowerCase();
    result = result.filter(g => 
      g.full_name.toLowerCase().includes(s) || 
      (g.notes || "").toLowerCase().includes(s)
    );
  }

  if (filter === "confirmed") result = result.filter(g => g.confirmed);
  else if (filter === "pending") result = result.filter(g => !g.confirmed);

  switch (sort) {
    case "name-asc": result.sort((a,b) => a.full_name.localeCompare(b.full_name)); break;
    case "name-desc": result.sort((a,b) => b.full_name.localeCompare(a.full_name)); break;
    case "status": result.sort((a,b) => (b.confirmed === a.confirmed ? 0 : b.confirmed ? 1 : -1)); break;
    case "recent": result.sort((a,b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)); break;
  }

  return result;
}

function updatePagination(guests) {
  const totalPages = Math.ceil(guests.length / pageSize) || 1;
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, guests.length);
  const info = document.getElementById("pagination-info");
  if (info) info.textContent = `Mostrando ${guests.length ? start : 0}-${end} de ${guests.length} invitados`;

  const btnContainer = document.getElementById("pagination-buttons");
  if (!btnContainer) return;

  btnContainer.innerHTML = "";
  if (totalPages <= 1) return;

  const createBtn = (page, text, disabled = false, active = false) => {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.disabled = disabled;
    btn.className = `px-3 py-1.5 rounded-lg text-sm font-medium transition ${active 
      ? 'bg-[#755B00] text-white' 
      : 'bg-white border border-[#E9E1D7] text-[#4D4637] hover:bg-[#FEF3C7]'}`;
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
  const search = document.getElementById("guest-search")?.value || "";
  const filter = document.getElementById("guest-filter")?.value || "all";
  const sort = document.getElementById("guest-sort")?.value || "name-asc";
  const filtered = filterAndSortGuests(allGuests, search, filter, sort);
  updatePagination(filtered);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  renderGuestsTable(paginated, currentEventId);
}

export function initGuestsPage(eventId, triggerRect = null) {
  currentEventId = eventId;
  currentPage = 1;

  // Show skeleton rows immediately
  renderSkeletonRows();

  const searchInput = document.getElementById("guest-search");
  const filterSelect = document.getElementById("guest-filter");
  const sortSelect = document.getElementById("guest-sort");

  const refresh = () => {
    const search = searchInput?.value || "";
    const filter = filterSelect?.value || "all";
    const sort = sortSelect?.value || "name-asc";
    const filtered = filterAndSortGuests(allGuests, search, filter, sort);
    updatePagination(filtered);
    const paginated = filtered.slice(0, pageSize);
    renderGuestsTable(paginated, eventId);
  };

  searchInput?.addEventListener("input", () => { currentPage = 1; refresh(); });
  filterSelect?.addEventListener("change", () => { currentPage = 1; refresh(); });
  sortSelect?.addEventListener("change", () => { currentPage = 1; refresh(); });

  document.getElementById("btn-add-guest-page")?.addEventListener("click", () => openGuestModal());
  
  // Ensure modal handlers attach after DOM is ready
  requestAnimationFrame(() => attachGuestModalHandlers(eventId, refresh));

  loadGuests(eventId, refresh);
}

async function loadGuests(eventId, onLoaded) {
  try {
    allGuests = await getEventGuests(eventId);
    onLoaded();
  } catch (error) {
    console.error(error);
    showToast("Error al cargar invitados", "error");
  }
}

function openGuestModal(guest = null) {
  const modal = document.getElementById("guest-modal");
  const form = document.getElementById("guest-form");
  if (!modal || !form) return;

  form.reset();
  delete form.dataset.editing;

  document.getElementById("guest-name").value = guest?.full_name || "";
  document.getElementById("guest-notes").value = guest?.notes || "";
  document.getElementById("guest-confirmed").checked = guest?.confirmed || false;

  if (guest) form.dataset.editing = guest.id;

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.getElementById("guest-name").focus();
}

function closeGuestModal() {
  const modal = document.getElementById("guest-modal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

function attachGuestModalHandlers(eventId, onSaved) {
  const modal = document.getElementById("guest-modal");
  const form = document.getElementById("guest-form");
  const cancelBtn = document.getElementById("cancel-guest");
  if (!modal || !form) return;

  if (cancelBtn) cancelBtn.onclick = closeGuestModal;
  modal.onclick = (e) => { if (e.target === modal) closeGuestModal(); };

  form.onsubmit = async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const guestData = {
      full_name: document.getElementById("guest-name").value.trim(),
      notes: document.getElementById("guest-notes").value.trim(),
      confirmed: document.getElementById("guest-confirmed").checked,
    };

    if (!guestData.full_name) {
      showToast("El nombre es obligatorio", "error");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Guardando...";

    try {
      if (form.dataset.editing) {
        await updateGuest(eventId, form.dataset.editing, guestData);
        showToast("Invitado actualizado");
      } else {
        const event = await getEventById(eventId);
        if ((event.guests.length + 1) > event.guest_count) {
          if (!confirm("Supera el número previsto de asistentes. ¿Continuar?")) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Guardar";
            return;
          }
        }
        await createGuest(eventId, guestData);
        showToast("Invitado creado");
      }
      closeGuestModal();
      await loadGuests(eventId, onSaved);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Guardar";
    }
  };
}