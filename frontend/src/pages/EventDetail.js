import { Sidebar } from "../components/Sidebar.js";
import { Topbar } from "../components/Topbar.js";
import { EventStepper } from "../components/EventStepper.js";
import { getEventById, updateEvent, updateEventStatus, createEventItem, updateEventItem, deleteEventItem } from "../service/api.js";

const _fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

function buildResourceCardHTML(item) {
  return `
    <div class="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between shadow-sm" data-item-id="${item.id}">
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-[#1E1B15] truncate">${item.name}</p>
        <p class="text-sm text-[#9E8E6E]">${item.quantity} x ${_fmt(item.unit_price)}</p>
        ${item.notes ? `<p class="text-xs text-[#9E8E6E] truncate mt-1">📝 ${item.notes}</p>` : ''}
      </div>
      <div class="flex items-center gap-2 ml-3">
        <span class="text-sm font-bold text-[#755B00] whitespace-nowrap">${_fmt(item.quantity * item.unit_price)}</span>
        <span class="px-2 py-0.5 text-xs rounded-full ${item.confirmed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}">${item.confirmed ? '✅' : '⏳'}</span>
        <button class="edit-resource p-1.5 rounded-lg hover:bg-[#FEF3C7] transition-colors cursor-pointer" data-id="${item.id}" data-name="${item.name.replace(/"/g, '&quot;')}" data-quantity="${item.quantity}" data-price="${item.unit_price}" data-notes="${(item.notes || '').replace(/"/g, '&quot;')}" title="Editar">✏️</button>
        <button class="delete-resource p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer" data-id="${item.id}" title="Eliminar">🗑️</button>
      </div>
    </div>
  `;
}
function buildEditResourceCardHTML(item) {
  return `
    <div class="bg-white rounded-xl border-2 border-[#755B00] p-4 shadow-sm is-editing" data-item-id="${item.id}">
      <div class="flex-1 min-w-0 space-y-2">
        <input type="text" class="edit-name w-full px-3 py-1.5 border border-[#D0C5B2] rounded-lg text-sm focus:border-[#755B00] focus:outline-none" value="${item.name.replace(/"/g, '&quot;')}" placeholder="Nombre del recurso">
        <div class="flex gap-2">
          <input type="number" class="edit-qty w-24 px-3 py-1.5 border border-[#D0C5B2] rounded-lg text-sm focus:border-[#755B00] focus:outline-none" value="${item.quantity}" min="1" placeholder="Cantidad">
          <input type="number" class="edit-price flex-1 px-3 py-1.5 border border-[#D0C5B2] rounded-lg text-sm focus:border-[#755B00] focus:outline-none" value="${item.unit_price}" min="0" step="0.01" placeholder="Precio unitario">
          <input type="text" class="edit-notes flex-1 px-3 py-1.5 border border-[#D0C5B2] rounded-lg text-sm focus:border-[#755B00] focus:outline-none" value="${(item.notes || '').replace(/"/g, '&quot;')}" placeholder="Notas">
        </div>
      </div>
      <div class="flex items-center gap-2 ml-3">
        <button class="save-edit-resource w-9 h-9 flex items-center justify-center rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors cursor-pointer font-bold text-lg" title="Guardar (Enter)">✓</button>
        <button class="cancel-edit-resource w-9 h-9 flex items-center justify-center rounded-lg border border-gray-300 text-[#4D4637] hover:bg-red-50 hover:border-red-300 transition-colors cursor-pointer font-bold text-lg" title="Cancelar (Escape)">✕</button>
      </div>
    </div>
  `;
}

import { BudgetPanel } from "../components/BudgetPanel.js";
import { DeleteEventModal } from "../components/DeleteEventModal.js";
import { GuestsPanel } from "../components/GuestPanel.js";
import { GuestModal } from "../components/GuestModal.js";

export async function EventDetail(eventId) {
  let event = null;
  let original = null;

  if (eventId) {
    try {
      event = await getEventById(eventId);
      original = event ? { ...event } : null;
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
              <p class="text-[#9E8E6E] mb-6">No se pudo cargar la información del evento.</p>
              <button onclick="window.history.back()" class="px-6 py-3 bg-[#755B00] text-white rounded-xl hover:bg-[#5F4A00] transition">
                Volver
              </button>
            </div>
          </div>
        </main>
      </div>
    `;
  }
  
  const totalResources = event?.event_items?.length || 0;

  const confirmedResources =
    event?.event_items?.filter(item => item.confirmed).length || 0;

  const isFinalized = event?.status === 'finalizado';

  const nextStatusLabel = {
    borrador: "Confirm Event",
    confirmado: "Finish Event",
  };

  const nextButtonText = nextStatusLabel[event?.status];

  const stepMap = {
    borrador: 1,
    confirmado: 2,
    finalizado: 3,
  };

  const nextStatus = {
    borrador: "planificando",
    confirmado: "finalizado",
  };

  // ── Guardar referencia al evento original (ANTES del return) ──
  window.__eventData = { event, original, eventId };

  return `
    <div class="flex min-h-screen bg-[#F8F5F0]">

      ${Sidebar("events")}

      <main class="flex-1 flex flex-col overflow-hidden">

        ${Topbar(`
          <div class="flex items-center gap-4 animate-fade-in">
            <button onclick="window.history.back()" class="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#9E8E6E] hover:text-[#1E1B15] hover:shadow-sm transition-all border border-[#E9E1D7]">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div>
              <div class="flex items-center gap-3">
                <h1 class="text-2xl font-bold text-[#1E1B15]" id="detail-title">${event?.name}</h1>
                <span class="px-3 py-1 text-[10px] font-semibold bg-[#FEF3C7] text-[#755B00] rounded-full uppercase tracking-wider">${event?.status || "Borrador"}</span>
              </div>
              <p class="text-[#9E8E6E] text-xs mt-0.5" id="detail-date-display">${event?.event_date}</p>
            </div>
          </div>
        `)}

        <div class="flex-1 overflow-auto custom-scrollbar">
          <div class="p-8 max-w-7xl mx-auto">

            <div class="flex justify-end mb-8 animate-fade-in" id="detail-actions">
            </div>

            <section class="flex gap-6">

              <div class="flex-1 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                ${EventStepper(stepMap[event?.status] || 1)}

                ${isFinalized ? `
                <div class="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-3 text-blue-800 text-sm">
                  Este evento esta finalizado. No se permiten modificaciones.
                </div>
                ` : ''}

                <div class="flex justify-between items-center mb-6">
                  <h2 class="text-xl font-bold text-[#1E1B15] flex items-center gap-2">🎯 Recursos del Evento</h2>
                  <span class="text-sm text-[#9E8E6E] bg-[#F8F5F0] px-3 py-1 rounded-lg">${confirmedResources} de ${totalResources} confirmados</span>
                </div>
                <div id="resources-canvas" class="rounded-xl border-2 border-dashed border-gray-300 bg-[#F8F5F0]/50">
                  <div class="p-4 space-y-3 max-h-[380px] overflow-y-auto" id="resources-list">
                    ${event.event_items && event.event_items.length > 0
                      ? event.event_items.map(item => buildResourceCardHTML(item)).join('')
                      : `
                        <div class="flex flex-col items-center justify-center py-12 text-[#9E8E6E]">
                          <span class="text-5xl mb-4 opacity-50">🎨</span>
                          <p class="text-lg font-medium">Lienzo de Recursos</p>
                          <p class="text-sm mt-1">Agrega recursos a tu evento</p>
                        </div>
                      `
                    }
                  </div>

                  <form id="add-resource-form" class="hidden border-t border-dashed border-gray-300 p-4 bg-white/80 space-y-3">
                    <div class="grid grid-cols-3 gap-3">
                      <input type="text" id="res-name" placeholder="Nombre del recurso" required
                        class="col-span-3 w-full px-4 py-2.5 border border-[#D0C5B2] rounded-xl text-sm focus:border-[#755B00] focus:outline-none">
                      <input type="number" id="res-quantity" placeholder="Cantidad" min="1" required
                        class="w-full px-4 py-2.5 border border-[#D0C5B2] rounded-xl text-sm focus:border-[#755B00] focus:outline-none">
                      <input type="number" id="res-price" placeholder="Precio unitario" min="0" step="0.01" required
                        class="w-full px-4 py-2.5 border border-[#D0C5B2] rounded-xl text-sm focus:border-[#755B00] focus:outline-none">
                      <input type="text" id="res-notes" placeholder="Notas (opcional)"
                        class="w-full px-4 py-2.5 border border-[#D0C5B2] rounded-xl text-sm focus:border-[#755B00] focus:outline-none">
                    </div>
                    <p id="res-error" class="hidden text-sm text-red-600 text-center"></p>
                    <div class="flex gap-2 justify-end">
                      <button type="button" id="cancel-add-resource"
                        class="px-4 py-2 border border-[#D0C5B2] rounded-xl text-sm text-[#4D4637] hover:bg-gray-50">Cancelar</button>
                      <button type="submit"
                        class="px-4 py-2 bg-[#755B00] text-white rounded-xl text-sm font-semibold hover:bg-[#5F4A00]">Guardar Recurso</button>
                    </div>
                  </form>

                  <div class="border-t border-dashed border-gray-300 p-3 flex justify-center">
                    <button id="btn-add-resource"
                      class="px-5 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-[#4D4637] hover:border-[#755B00] hover:text-[#755B00] transition-all shadow-sm">+ Añadir Recurso</button>
                  </div>
                </div>
              </div>

              <aside class="w-2/5 space-y-6 animate-fade-in-up">
                ${BudgetPanel(event)}

                <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm" id="detail-info-panel">
                  <div class="flex items-center justify-between mb-5">
                    <h2 class="text-lg font-bold text-[#1E1B15] flex items-center gap-2">
                      <span></span> Información del Evento
                    </h2>
                    <span id="edit-indicator" class="hidden text-xs bg-[#FEF3C7] text-[#755B00] px-2.5 py-1 rounded-full font-medium">Editando</span>
                  </div>

                  <div id="detail-view" class="space-y-4">
                    <div class="flex justify-between items-center py-2.5 border-b border-[#F5EDE0] last:border-b-0">
                      <span class="text-sm text-[#9E8E6E]">Nombre</span>
                      <span class="text-sm font-medium text-[#1E1B15] text-right max-w-[200px]" id="view-name">${event?.name || "—"}</span>
                    </div>
                    <div class="flex justify-between items-center py-2.5 border-b border-[#F5EDE0]">
                      <span class="text-sm text-[#9E8E6E]">Fecha</span>
                      <span class="text-sm font-medium text-[#1E1B15]" id="view-date">${event?.event_date || "—"}</span>
                    </div>
                    <div class="flex justify-between items-center py-2.5 border-b border-[#F5EDE0]">
                      <span class="text-sm text-[#9E8E6E]">Ubicación</span>
                      <span class="text-sm font-medium text-[#1E1B15] text-right max-w-[200px]" id="view-location">${event?.location || "—"}</span>
                    </div>
                    <div class="flex justify-between items-center py-2.5 border-b border-[#F5EDE0]">
                      <span class="text-sm text-[#9E8E6E]">Invitados</span>
                      <span class="text-sm font-medium text-[#1E1B15]" id="view-guests">${event?.guest_count ?? "—"}</span>
                    </div>
                    <div class="flex justify-between items-center py-2.5 border-b border-[#F5EDE0]">
                      <span class="text-sm text-[#9E8E6E]">Presupuesto Máx.</span>
                      <span class="text-sm font-semibold text-[#755B00]" id="view-budget">${event?.max_budget ? "$" + parseFloat(event.max_budget).toLocaleString() : "—"}</span>
                    </div>
                    <div class="flex justify-between items-start py-2.5 border-b border-[#F5EDE0] last:border-b-0">
                      <span class="text-sm text-[#9E8E6E]">Estado</span>
                      <span class="text-sm font-medium px-3 py-0.5 rounded-full bg-[#FEF3C7] text-[#755B00]" id="view-status">${event?.status || "Borrador"}</span>
                    </div>
                    ${event?.description ? `
                    <div class="pt-2">
                      <span class="text-sm text-[#9E8E6E] block mb-1">Descripción</span>
                      <p class="text-sm text-[#1E1B15]" id="view-description">${event.description}</p>
                    </div>` : ''}
                    
                    ${GuestsPanel(event)}

                    <div class="flex gap-3" id="detail-actions">

                      ${
                        nextButtonText
                          ? `
                            <button
                              id="btn-next-status"
                              data-current-status="${event?.status}"
                              class="px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-all shadow-sm"
                            >
                              ${nextButtonText}
                            </button>
                          `
                          : ""
                      }

                      <button
                        id="btn-edit"
                        onclick="toggleEdit()"
                        class="px-5 py-2.5 bg-[#755B00] text-white rounded-xl text-sm font-semibold hover:bg-[#5F4A00] transition-all shadow-sm"
                      >
                        Editar
                      </button>

                    </div>

                    
                    ${
                          event?.status === "borrador"
                            ? `
                              <div class="rounded-2xl border border-red-200 bg-red-50/40 p-5">

                                <div class="flex items-center gap-2 mb-2">

                                  <svg xmlns="http://www.w3.org/2000/svg"
                                      width="18"
                                      height="18"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="#DC2626"
                                      stroke-width="2">
                                    <path stroke-linecap="round"
                                          stroke-linejoin="round"
                                          d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                                  </svg>

                                  <h3 class="text-sm font-semibold text-red-700">
                                    Delete Event
                                  </h3>

                                </div>

                                <p class="text-sm text-gray-600 mb-4">
                                  This action permanently deletes this event and cannot be undone.
                                </p>

                                <button
                                  id="open-delete-modal"
                                  class="w-full py-3 rounded-xl border border-red-300 bg-white text-red-600 font-medium hover:bg-red-100 hover:border-red-500 transition flex items-center justify-center gap-2"
                                >

                                  <svg xmlns="http://www.w3.org/2000/svg"
                                      width="18"
                                      height="18"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      stroke-width="2">

                                    <path stroke-linecap="round"
                                          stroke-linejoin="round"
                                          d="M19 7L18.133 19.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0h8"/>

                                  </svg>

                                  Delete Event

                                </button>

                              </div>
                            `
                            : ""
                        }
                  </div>

                  <form id="detail-edit" class="hidden space-y-4">
                    <div>
                      <label class="block text-xs font-semibold tracking-widest text-[#4D4637] mb-1">NOMBRE</label>
                      <input type="text" id="edit-name" value="${event?.name || ""}"
                        class="w-full px-4 py-3 border border-[#D0C5B2] rounded-xl focus:border-[#755B00] focus:outline-none text-sm">
                    </div>
                    <div>
                      <label class="block text-xs font-semibold tracking-widest text-[#4D4637] mb-1">FECHA</label>
                      <input type="date" id="edit-date" value="${event?.event_date || ""}"
                        class="w-full px-4 py-3 border border-[#D0C5B2] rounded-xl focus:border-[#755B00] focus:outline-none text-sm">
                    </div>
                    <div>
                      <label class="block text-xs font-semibold tracking-widest text-[#4D4637] mb-1">UBICACIÓN</label>
                      <input type="text" id="edit-location" value="${event?.location || ""}"
                        class="w-full px-4 py-3 border border-[#D0C5B2] rounded-xl focus:border-[#755B00] focus:outline-none text-sm" placeholder="Ej: Hotel Hilton">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-xs font-semibold tracking-widest text-[#4D4637] mb-1">INVITADOS</label>
                        <input type="number" id="edit-guests" min="0" value="${event?.guest_count ?? ""}"
                          class="w-full px-4 py-3 border border-[#D0C5B2] rounded-xl focus:border-[#755B00] focus:outline-none text-sm">
                      </div>
                      <div>
                        <label class="block text-xs font-semibold tracking-widest text-[#4D4637] mb-1">PRESUPUESTO MÁX.</label>
                        <input type="number" id="edit-budget" min="0" value="${event?.max_budget ?? ""}"
                          class="w-full px-4 py-3 border border-[#D0C5B2] rounded-xl focus:border-[#755B00] focus:outline-none text-sm">
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs font-semibold tracking-widest text-[#4D4637] mb-1">ESTADO</label>
                      <select id="edit-status"
                        class="w-full px-4 py-3 border border-[#D0C5B2] rounded-xl focus:border-[#755B00] focus:outline-none text-sm">
                        <option value="borrador" ${event?.status === "borrador" || !event?.status ? "selected" : ""}>Borrador</option>
                        <option value="confirmado" ${event?.status === "confirmado" ? "selected" : ""}>Confirmado</option>
                        <option value="finalizado" ${event?.status === "finalizado" ? "selected" : ""}>Finalizado</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-semibold tracking-widest text-[#4D4637] mb-1">DESCRIPCIÓN</label>
                      <textarea id="edit-description" rows="3"
                        class="w-full px-4 py-3 border border-[#D0C5B2] rounded-xl focus:border-[#755B00] focus:outline-none text-sm resize-none">${event?.description || ""}</textarea>
                    </div>
                    <div class="flex gap-3 pt-2">
                      <button type="button" onclick="cancelEdit()"
                        class="flex-1 py-3 border-2 border-[#D0C5B2] rounded-xl font-medium text-[#4D4637] hover:bg-[#F8F5F0] transition-all text-sm">Cancelar</button>
                      <button type="submit"
                        class="flex-1 py-3 bg-[#755B00] hover:bg-[#5F4A00] text-white font-semibold rounded-xl transition-all text-sm shadow-sm">Guardar Cambios</button>
                    </div>
                    <p id="edit-error" class="hidden text-sm text-red-600 text-center bg-red-50 rounded-xl py-2"></p>
                  </form>
                </div>
              </aside>

            </section>

          </div>
        </div>

      </main>
    ${GuestModal()}
    ${DeleteEventModal()}
    </div>
  `;

  // ── Guardar referencia al evento original (ANTES del return) ──
  window.__eventData = { event, original, eventId };
  
  return template;
}

// ── Alternar entre vista y edición ──
window.toggleEdit = function () {
  const { event, original } = window.__eventData;
  
  // Populate form with current data
  document.getElementById("edit-name").value = event?.name || "";
  document.getElementById("edit-date").value = event?.event_date || "";
  document.getElementById("edit-location").value = event?.location || "";
  document.getElementById("edit-guests").value = event?.guest_count ?? "";
  document.getElementById("edit-budget").value = event?.max_budget ?? "";
  document.getElementById("edit-description").value = event?.description || "";
  document.getElementById("edit-status").value = event?.status || "borrador";

  document.getElementById("detail-view").classList.add("hidden");
  document.getElementById("detail-edit").classList.remove("hidden");
  document.getElementById("btn-edit").classList.add("hidden");
  document.getElementById("edit-indicator").classList.remove("hidden");
};

window.cancelEdit = function () {
  const { original } = window.__eventData;
  
  // Restore form to original values
  if (original) {
    document.getElementById("edit-name").value = original.name || "";
    document.getElementById("edit-date").value = original.event_date || "";
    document.getElementById("edit-location").value = original.location || "";
    document.getElementById("edit-guests").value = original.guest_count ?? "";
    document.getElementById("edit-budget").value = original.max_budget ?? "";
    document.getElementById("edit-description").value = original.description || "";
    document.getElementById("edit-status").value = original.status || "borrador";
  }
  
  document.getElementById("detail-view").classList.remove("hidden");
  document.getElementById("detail-edit").classList.add("hidden");
  document.getElementById("btn-edit").classList.remove("hidden");
  document.getElementById("edit-indicator").classList.add("hidden");
  document.getElementById("edit-error").classList.add("hidden");
};

// ── Submit del formulario de edición ──
document.addEventListener("submit", async (e) => {
  if (e.target.id !== "detail-edit") return;
  e.preventDefault();

  const { eventId, original } = window.__eventData;
  const errorEl = document.getElementById("edit-error");
  const submitBtn = e.target.querySelector('button[type="submit"]');

  const newStatus = document.getElementById("edit-status").value;
  const payload = {
    name: document.getElementById("edit-name").value,
    event_date: document.getElementById("edit-date").value || null,
    location: document.getElementById("edit-location").value || null,
    guest_count: parseInt(document.getElementById("edit-guests").value, 10) || null,
    max_budget: parseFloat(document.getElementById("edit-budget").value) || null,
    description: document.getElementById("edit-description").value || null,
  };

  Object.keys(payload).forEach((k) => { if (payload[k] === null) delete payload[k]; });

  errorEl.classList.add("hidden");
  submitBtn.disabled = true;
  submitBtn.textContent = "Guardando...";

  try {
    await updateEvent(eventId, payload);
    
    // Update status if changed
    if (newStatus && newStatus !== original?.status) {
      await updateEventStatus(eventId, newStatus);
    }

    const updated = await getEventById(eventId);

    window.__eventData.event = updated;
    window.__eventData.original = { ...updated };
    window.__eventData.original = { ...updated };

    document.getElementById("detail-title").textContent = updated.name;
    document.getElementById("detail-date-display").textContent = updated.event_date
      ? new Date(updated.event_date).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      : "";
    document.getElementById("view-name").textContent = updated.name || "—";
    document.getElementById("view-date").textContent = updated.event_date || "—";
    document.getElementById("view-location").textContent = updated.location || "—";
    document.getElementById("view-guests").textContent = updated.guest_count ?? "—";
    document.getElementById("view-budget").textContent = updated.max_budget ? "$" + parseFloat(updated.max_budget).toLocaleString() : "—";

    const statusBadge = document.getElementById("view-status");
    statusBadge.textContent = updated.status || "Borrador";

    const descEl = document.getElementById("view-description");
    if (descEl) descEl.textContent = updated.description || "";

    document.getElementById("detail-view").classList.remove("hidden");
    document.getElementById("detail-edit").classList.add("hidden");
    document.getElementById("btn-edit").classList.remove("hidden");
    document.getElementById("edit-indicator").classList.add("hidden");
  } catch (err) {
    errorEl.textContent = err.message || "No se pudo actualizar el evento.";
    errorEl.classList.remove("hidden");
    submitBtn.disabled = false;
    submitBtn.textContent = "Guardar Cambios";
  }
});

// ── Helpers de CRUD inline ──
async function saveInlineEdit(card) {
  const itemId = card.dataset.itemId;
  const name = card.querySelector(".edit-name").value.trim();
  const quantity = parseInt(card.querySelector(".edit-qty").value, 10);
  const unit_price = parseFloat(card.querySelector(".edit-price").value);
  const notes = card.querySelector(".edit-notes").value.trim();
  if (!name || !quantity || isNaN(unit_price)) { alert("Todos los campos son obligatorios."); return; }
  const { eventId } = window.__eventData;
  try {
    const payload = { name, quantity, unit_price, notes: notes || null };
    const updated = await updateEventItem(eventId, itemId, payload);
    window.__eventData.event = updated;
    window.__eventData.original = { ...updated };
    card.outerHTML = buildResourceCardHTML(updated.event_items.find(i => i.id === itemId));
    await refreshBudgetAndCounter(updated);
  } catch (err) {
    alert(err.message || "Error al actualizar el recurso.");
  }
}

function cancelInlineEdit(card) {
  const item = window.__eventData.event.event_items.find(i => i.id === card.dataset.itemId);
  if (item) card.outerHTML = buildResourceCardHTML(item);
}

async function refreshBudgetAndCounter(updated) {
  const panel = document.getElementById("budget-panel");
  if (panel) {
    const { BudgetPanel } = await import("../components/BudgetPanel.js");
    panel.outerHTML = BudgetPanel(updated);
  }
  const confirmedResources = updated.event_items.filter(i => i.confirmed).length;
  const totalResources = updated.event_items.length;
  const counterEl = document.querySelector(".flex.justify-between.items-center.mb-6 span");
  if (counterEl) {
    counterEl.textContent = totalResources > 0 ? `${confirmedResources} de ${totalResources} confirmados` : "Sin recursos";
  }
}

function showEmptyStateIfNeeded(list) {
  if (!list.hasChildNodes() || list.children.length === 0) {
    list.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12 text-[#9E8E6E]">
        <span class="text-5xl mb-4 opacity-50">🎨</span>
        <p class="text-lg font-medium">Lienzo de Recursos</p>
        <p class="text-sm mt-1">Agrega recursos a tu evento</p>
      </div>
    `;
  }
}

// ── Toggle formulario de agregar recurso ──
document.addEventListener("click", (e) => {
  const form = document.getElementById("add-resource-form");
  const btnAdd = document.getElementById("btn-add-resource");
  const btnCancel = document.getElementById("cancel-add-resource");
  const errorEl = document.getElementById("res-error");

  if (btnAdd && e.target.closest("#btn-add-resource")) {
    form.classList.remove("hidden");
    btnAdd.classList.add("hidden");
    errorEl.classList.add("hidden");
    document.getElementById("res-name").focus();
  }

  if (btnCancel && e.target.closest("#cancel-add-resource")) {
    form.classList.add("hidden");
    btnAdd.classList.remove("hidden");
    form.reset();
    errorEl.classList.add("hidden");
  }

  // ── Editar inline ──
  const editBtn = e.target.closest(".edit-resource");
  if (editBtn) {
    const list = document.getElementById("resources-list");
    if (list.querySelector(".is-editing")) return;
    const card = editBtn.closest('[data-item-id]');
    const item = window.__eventData.event.event_items.find(i => i.id === editBtn.dataset.id);
    if (card && item) {
      card.outerHTML = buildEditResourceCardHTML(item);
      const newCard = list.querySelector(`[data-item-id="${item.id}"]`);
      if (newCard) newCard.querySelector(".edit-name").focus();
    }
  }

  // ── Guardar ediciOn inline ──
  const saveBtn = e.target.closest(".save-edit-resource");
  if (saveBtn) {
    const card = saveBtn.closest('[data-item-id].is-editing');
    if (card) saveInlineEdit(card);
  }

  // ── Cancelar ediciOn inline ──
  const cancelBtn = e.target.closest(".cancel-edit-resource");
  if (cancelBtn) {
    const card = cancelBtn.closest('[data-item-id].is-editing');
    if (card) cancelInlineEdit(card);
  }

  // ── Eliminar ──
  const delBtn = e.target.closest(".delete-resource");
  if (delBtn && confirm("¿Eliminar este recurso?")) {
    const itemId = delBtn.dataset.id;
    const card = delBtn.closest('[data-item-id]');
    (async () => {
      try {
        const { eventId } = window.__eventData;
        const updated = await deleteEventItem(eventId, itemId);
        window.__eventData.event = updated;
        window.__eventData.original = { ...updated };
        if (card) card.remove();
        const list = document.getElementById("resources-list");
        showEmptyStateIfNeeded(list);
        await refreshBudgetAndCounter(updated);
      } catch (err) {
        alert(err.message || "Error al eliminar el recurso.");
      }
    })();
  }
});

// ── Enter / Escape en edicion inline ──
document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== "Escape") return;
  const card = e.target.closest(".is-editing");
  if (!card) return;
  e.preventDefault();
  if (e.key === "Enter") {
    saveInlineEdit(card);
  } else {
    cancelInlineEdit(card);
  }
});

// ── Submit del formulario de agregar recurso ──
document.addEventListener("submit", async (e) => {
  if (e.target.id !== "add-resource-form") return;
  e.preventDefault();

  const { eventId } = window.__eventData;
  const errorEl = document.getElementById("res-error");
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const name = document.getElementById("res-name").value.trim();
  const quantity = parseInt(document.getElementById("res-quantity").value, 10);
  const unit_price = parseFloat(document.getElementById("res-price").value);
  const notes = document.getElementById("res-notes").value.trim();

  if (!name || !quantity || isNaN(unit_price)) {
    errorEl.textContent = "Todos los campos son obligatorios.";
    errorEl.classList.remove("hidden");
    return;
  }

  errorEl.classList.add("hidden");
  submitBtn.disabled = true;
  submitBtn.textContent = "Guardando...";

  try {
    const updated = await createEventItem(eventId, {
      name, quantity, unit_price, notes: notes || null
    });

    window.__eventData.event = updated;
    window.__eventData.original = { ...updated };

    const list = document.getElementById("resources-list");
    const emptyState = list.querySelector(".flex.flex-col.items-center.justify-center");
    if (emptyState) list.innerHTML = "";

    const newItem = updated.event_items[updated.event_items.length - 1];
    list.innerHTML += buildResourceCardHTML(newItem);

    document.getElementById("add-resource-form").classList.add("hidden");
    document.getElementById("btn-add-resource").classList.remove("hidden");
    e.target.reset();

    await refreshBudgetAndCounter(updated);

  } catch (err) {
    errorEl.textContent = err.message || "Error al crear el recurso.";
    errorEl.classList.remove("hidden");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Guardar Recurso";
  }
});
