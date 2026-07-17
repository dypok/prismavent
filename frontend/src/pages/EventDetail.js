import { Sidebar } from "../components/Sidebar.js";
import { Topbar } from "../components/Topbar.js";
import { EventStepper } from "../components/EventStepper.js";
import { getEventById, updateEvent, updateEventStatus, createEventItem, updateEventItem, deleteEventItem, getEventTasks } from "../service/api.js";
import { TasksPanel } from "../components/TasksPanel.js";
import { initWeatherWidget } from "../components/WeatherWidget.js";
import { icon } from "../components/Icons.js";

const _fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

function buildResourceCardHTML(item) {
  const isConfirmed = item.confirmed;
  return `
    <div class="bg-white rounded-xl p-4 flex items-center justify-between gap-2 flex-wrap shadow-sm ${isConfirmed ? 'border-2 border-[#C9A84C] border-l-4 border-[#C9A84C]' : 'border border-gray-200'}" data-item-id="${item.id}">
      <div class="flex-1 min-w-0">
        <p class="font-semibold truncate ${isConfirmed ? 'text-[#C9A84C]' : 'text-[#1E1B15]'}">${item.name}</p>
        <p class="text-sm text-[#9E8E6E]">${item.quantity} x ${_fmt(item.unit_price)}</p>
        ${item.notes ? `<p class="text-xs text-[#9E8E6E] truncate mt-1">📝 ${item.notes}</p>` : ''}
      </div>
      <div class="flex items-center gap-2 ml-3">
        <span class="text-sm font-bold text-[#755B00] whitespace-nowrap">${_fmt(item.quantity * item.unit_price)}</span>
        <button class="toggle-confirmed relative w-10 h-5 rounded-full transition-colors cursor-pointer border-none ${isConfirmed ? 'bg-[#C9A84C]' : 'bg-gray-300'}" data-id="${item.id}" title="${isConfirmed ? 'Marcar pendiente' : 'Marcar confirmado'}">
          <span class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isConfirmed ? 'translate-x-5' : ''}"></span>
        </button>
          <button class="edit-resource p-1.5 rounded-lg hover:bg-green-50 transition-colors cursor-pointer" data-id="${item.id}" data-name="${item.name.replace(/"/g, '&quot;')}" data-quantity="${item.quantity}" data-price="${item.unit_price}" data-notes="${(item.notes || '').replace(/"/g, '&quot;')}" title="Editar">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#16A34A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
            </svg>
        </button>
        <button class="delete-resource p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer" data-id="${item.id}" title="Eliminar">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#DC2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 7L18.133 19.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0h8"/>
          </svg>
        </button>
      </div>
    </div>
  `;
}
function ProgressRing(confirmed, total) {
  if (total === 0) return '';
  const pct = Math.round((confirmed / total) * 100);
  const r = 10;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return `
    <div class="relative inline-flex items-center justify-center w-7 h-7" title="${pct}% confirmado">
      <svg class="transform -rotate-90 w-7 h-7" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="${r}" fill="none" stroke="#E5E7EB" stroke-width="2.5"/>
        <circle cx="12" cy="12" r="${r}" fill="none" stroke="#C9A84C" stroke-width="2.5" stroke-dasharray="${circ}" stroke-dashoffset="${offset}" stroke-linecap="round"/>
      </svg>
    </div>
  `;
}

function buildEditResourceCardHTML(item) {
  return `
    <div class="bg-white rounded-xl border-2 border-[#755B00] p-4 flex flex-wrap items-center shadow-sm is-editing" data-item-id="${item.id}">
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
import { DeleteResourceModal } from "../components/DeleteResourceModal.js";
import { GuestsPanel } from "../components/GuestPanel.js";
import { GuestModal } from "../components/GuestModal.js";
import { initSaveTemplateModal } from "../components/SaveTemplateModal.js";

export async function EventDetail(eventId) {
  let event = null;
  let original = null;
  let tasks = [];

  if (eventId) {
    try {
      event = await getEventById(eventId);
      original = event ? { ...event } : null;
      try {
        tasks = await getEventTasks(eventId);
      } catch (tErr) {
        console.error("Error fetching tasks for EventDetail", tErr);
      }
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

  const isFinalized = event?.status === 'finalizado' || event?.status === 'done';

  const nextStatusLabel = {
    borrador: "Confirm Event",
  };

  window.__currentEventData = event;

  const nextButtonText = nextStatusLabel[event?.status];

  const stepMap = {
    borrador: 1,
    confirmado: 2,
    in_progress: 3,
    done: 4,
    finalizado: 4,
  };

  const statusLabels = {
    borrador: "Borrador",
    confirmado: "Confirmado",
    in_progress: "En Progreso",
    done: "Realizado",
    finalizado: "Finalizado",
  };
  window.__eventData = { event, original, eventId };
  setTimeout(() => {
    initSaveTemplateModal();
    initWeatherWidget(eventId, isFinalized);
  }, 0);

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
                <span class="px-3 py-1 text-[10px] font-semibold bg-[#FEF3C7] text-[#755B00] rounded-full uppercase tracking-wider">${statusLabels[event?.status] || "Borrador"}</span>
              </div>
              <p class="text-[#9E8E6E] text-xs mt-0.5" id="detail-date-display">${event?.event_date ? new Date(event.event_date).toLocaleString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}</p>
            </div>
          </div>
        `)}

        <div class="flex-1 overflow-auto custom-scrollbar">
          <div class="p-4 lg:p-8">

            <section class="flex flex-col lg:flex-row gap-6">

              <div class="w-full bg-white rounded-2xl border border-gray-200 p-4 lg:p-6 shadow-sm">
                ${EventStepper(stepMap[event?.status] || 1)}

                ${isFinalized ? `
                <div class="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-3 text-blue-800 text-sm">
                  Este evento esta finalizado. No se permiten modificaciones.
                </div>
                ` : ''}

                <div class="flex justify-between items-center flex-wrap gap-2 mb-6">
                  <h2 class="text-xl font-bold text-[#1E1B15] flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-[#755B00]">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                      <line x1="12" y1="22.08" x2="12" y2="12"/>
                    </svg>
                    Recursos del Evento
                  </h2>
                  <div class="flex items-center gap-2 flex-wrap" id="resources-counter-wrapper">
                    <span class="text-sm text-[#9E8E6E] bg-[#F8F5F0] px-3 py-1 rounded-lg">${confirmedResources} de ${totalResources} confirmados</span>
                    ${ProgressRing(confirmedResources, totalResources)}
                  </div>
                </div>
                <div id="resources-canvas" class="rounded-xl border-2 border-dashed border-gray-300 bg-[#F8F5F0]/50 overflow-x-auto">
                  <div class="p-4 space-y-3" id="resources-list">
                    ${event.event_items && event.event_items.length > 0
                      ? event.event_items.slice(0, 10).map(item => buildResourceCardHTML(item)).join('')
                      : `
                        <div class="flex flex-col items-center justify-center py-12 text-[#9E8E6E]">
                          <svg class="w-16 h-16 mb-4 opacity-50 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17a.75.75 0 01-.75-.75v-4.5a.75.75 0 011.5 0v4.5A.75.75 0 017 17z"/>
                          </svg>
                          <p class="text-lg font-medium">Lienzo de Recursos</p>
                          <p class="text-sm mt-1">Agrega recursos a tu evento</p>
                        </div>
                      `
                    }
                  </div>

                  <form id="add-resource-form" class="hidden border-t border-dashed border-gray-300 p-4 bg-white/80 space-y-3">
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

                  <div class="border-t border-dashed border-gray-300 p-3 flex justify-center ${(event.event_items?.length || 0) > 10 ? 'hidden' : ''}" id="add-resource-btn-wrapper">
                    <button id="btn-add-resource"
                      class="px-5 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-[#4D4637] hover:border-[#755B00] hover:text-[#755B00] transition-all shadow-sm">+ Añadir Recurso</button>
                  </div>
                  <div class="border-t border-dashed border-gray-300 p-3 flex justify-center ${(event.event_items?.length || 0) <= 10 ? 'hidden' : ''}">
                    <button id="btn-view-all-resources" data-event-id="${event.id}"
                      class="px-5 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-[#755B00] hover:bg-[#FEF3C7] transition-all shadow-sm flex items-center gap-2">
                      ${icon('arrow-right', 16)}
                      Ver todos (${event.event_items?.length || 0})
                    </button>
                  </div>
                </div>
              </div>

              <aside class="w-full lg:w-2/5 space-y-6 animate-fade-in-up">
                ${BudgetPanel(event)}

                <div class="bg-white rounded-2xl border border-gray-200 p-4 lg:p-6 shadow-sm" id="detail-info-panel">
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
                      <span class="text-sm font-medium text-[#1E1B15]" id="view-date">${event?.event_date ? new Date(event.event_date).toLocaleString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}</span>
                    </div>
                    <div class="flex justify-between items-center py-2.5 border-b border-[#F5EDE0]">
                      <span class="text-sm text-[#9E8E6E]">Ciudad</span>
                      <span class="text-sm font-medium text-[#1E1B15] text-right max-w-[200px]" id="view-city">${event?.city_name || event?.city_custom || "—"}</span>
                    </div>
                    ${!isFinalized ? `
                    <div class="flex justify-between items-center py-2.5 border-b border-[#F5EDE0]">
                      <span class="text-sm text-[#9E8E6E]">Clima</span>
                      <span id="weather-widget" class="flex items-center gap-2 text-sm"></span>
                    </div>` : ''}
                    <div class="flex justify-between items-center py-2.5 border-b border-[#F5EDE0]">
                      <span class="text-sm text-[#9E8E6E]">Ubicación</span>
                      <span class="text-sm font-medium text-[#1E1B15] text-right max-w-[200px]" id="view-location">${event?.location || "—"}</span>
                    </div>
                    <div class="flex justify-between items-center py-2.5 border-b border-[#F5EDE0]">
                      <span class="text-sm text-[#9E8E6E]">Duración</span>
                      <span class="text-sm font-medium text-[#1E1B15]" id="view-duration">${event?.duration ? formatDuration(event.duration) : "—"}</span>
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

                    <div class="flex flex-wrap gap-3" id="detail-actions">

                      ${
                        nextButtonText
                          ? `
                            <button
                              id="btn-next-status"
                              data-current-status="${event?.status}"
                              class="px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-all shadow-sm flex items-center gap-2"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                              ${nextButtonText}
                            </button>
                          `
                          : ""
                      }

                      <button
                        id="btn-edit"
                        onclick="toggleEdit()"
                        class="px-5 py-2.5 bg-[#755B00] text-white rounded-xl text-sm font-semibold hover:bg-[#5F4A00] transition-all shadow-sm flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        Editar
                      </button>

                      <button
                        onclick="window.__currentEventData && window.openSaveTemplateModal(window.__currentEventData)"
                        class="px-5 py-2.5 bg-white border border-[#E9E1D7] text-[#755B00] rounded-xl text-sm font-semibold hover:bg-[#FEF3C7] transition-all shadow-sm flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                        Guardar como Plantilla
                      </button>

                    </div>
                  </div>

                  <form id="detail-edit" class="hidden space-y-4">
                    <div>
                      <label class="block text-xs font-semibold tracking-widest text-[#4D4637] mb-1">NOMBRE</label>
                      <input type="text" id="edit-name" value="${event?.name || ""}"
                        class="w-full px-4 py-3 border border-[#D0C5B2] rounded-xl focus:border-[#755B00] focus:outline-none text-sm">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-xs font-semibold tracking-widest text-[#4D4637] mb-1">FECHA</label>
                        <div class="relative">
                          <div id="editDateDisplay" class="w-full px-4 py-3 border border-[#D0C5B2] rounded-xl text-sm cursor-pointer bg-white flex items-center justify-between select-none z-10 relative">
                            <span id="editDateDisplayText" class="truncate">${event?.event_date ? new Date(event.event_date).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "Selecciona una fecha"}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-[#9E8E6E] shrink-0 ml-2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          </div>
                          <input type="hidden" id="edit-date" value="${event?.event_date ? event.event_date.slice(0, 10) : ""}">
                          <div id="editCalendar" class="calendar-popup hidden absolute top-full left-0 mt-1.5 bg-white border border-[#D0C5B2] rounded-2xl shadow-xl z-[100] p-4 w-72">
                            <div class="flex items-center justify-between mb-3">
                              <button type="button" id="editPrevMonth" class="text-[#755B00] text-lg font-bold px-2 hover:text-[#5F4A00]">&lsaquo;</button>
                              <span class="text-sm font-semibold text-[#1E1B15] capitalize"></span>
                              <button type="button" id="editNextMonth" class="text-[#755B00] text-lg font-bold px-2 hover:text-[#5F4A00]">&rsaquo;</button>
                            </div>
                            <div class="grid grid-cols-7 gap-1 text-center text-xs font-medium text-[#9E8E6E] mb-1">
                              <span>Do</span><span>Lu</span><span>Ma</span><span>Mi</span><span>Ju</span><span>Vi</span><span>Sá</span>
                            </div>
                            <div id="editDaysGrid" class="grid grid-cols-7 gap-1 text-center"></div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label class="block text-xs font-semibold tracking-widest text-[#4D4637] mb-1">HORA</label>
                        <div id="editTimeWrapper">
                          ${window.customSelectHTML ? window.customSelectHTML('edit-time', (() => {
                            const p = (n) => String(n).padStart(2, '0');
                            const opts = [];
                            for (let h = 0; h < 24; h++) {
                              for (let m = 0; m < 60; m += 30) {
                                const v = `${p(h)}:${p(m)}`;
                                opts.push({ value: v, label: v });
                              }
                            }
                            return opts;
                          })(), event?.event_date ? (() => { const d = new Date(event.event_date); return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; })() : '18:00', 'Selecciona hora') : `<select id="edit-time" class="w-full px-4 py-3 border border-[#D0C5B2] rounded-xl text-sm bg-white"></select>`}
                        </div>
                      </div>
                    </div>
                      <div>
                        <label class="block text-xs font-semibold tracking-widest text-[#4D4637] mb-1">CIUDAD</label>
                        <div id="editCityWrapper">
                          ${window.customSelectHTML ? window.customSelectHTML('edit-city', [], '', 'Cargando ciudades...') : '<select id="edit-city" class="w-full px-4 py-3 border border-[#D0C5B2] rounded-xl text-sm bg-white"><option value="">Cargando...</option></select>'}
                        </div>
                      </div>
                    <div>
                      <label class="block text-xs font-semibold tracking-widest text-[#4D4637] mb-1">UBICACIÓN (lugar/recinto)</label>
                      <input type="text" id="edit-location" value="${event?.location || ""}"
                        class="w-full px-4 py-3 border border-[#D0C5B2] rounded-xl focus:border-[#755B00] focus:outline-none text-sm" placeholder="Ej: Hotel Hilton">
                    </div>
                    <div>
                      <label class="block text-xs font-semibold tracking-widest text-[#4D4637] mb-1">DURACIÓN</label>
                      <div class="flex gap-2">
                        <input type="number" id="edit-duration-hours" min="0" value="${Math.floor((event?.duration || 0) / 60)}" class="flex-1 min-w-0 w-full px-4 py-3 border border-[#D0C5B2] rounded-xl focus:border-[#755B00] text-sm" placeholder="Horas">
                        <div class="w-24 shrink-0">
                          ${window.customSelectHTML ? window.customSelectHTML('edit-duration-minutes', [
                            { value: '0', label: '0 min' },
                            { value: '15', label: '15 min' },
                            { value: '30', label: '30 min' },
                            { value: '45', label: '45 min' },
                          ], '0') : `<select id="edit-duration-minutes" class="w-full px-3 py-3 border border-[#D0C5B2] rounded-xl text-sm bg-white"><option value="0">0 min</option></select>`}
                        </div>
                      </div>
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
                        <option value="in_progress" ${event?.status === "in_progress" ? "selected" : ""}>En Progreso</option>
                        <option value="done" ${event?.status === "done" ? "selected" : ""}>Realizado</option>
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

            <div class="flex flex-col lg:flex-row gap-6 mt-6">
              <div class="w-full">
                ${TasksPanel(event, tasks)}
              </div>
              ${event?.status === "borrador" ? `
              <div class="w-full lg:w-2/5">
                <div class="rounded-2xl border border-red-200 bg-red-50/40 p-5">
                  <div class="flex items-center gap-2 mb-2">
                    ${icon('alert-triangle', 18, 'text-red-600')}
                    <h3 class="text-sm font-semibold text-red-700">Delete Event</h3>
                  </div>
                  <p class="text-sm text-gray-600 mb-4">This action permanently deletes this event and cannot be undone.</p>
                  <button id="open-delete-modal" class="w-full py-3 rounded-xl border border-red-300 bg-white text-red-600 font-medium hover:bg-red-100 hover:border-red-500 transition flex items-center justify-center gap-2">
                    ${icon('trash', 18)}
                    Delete Event
                  </button>
                </div>
              </div>
              ` : ''}
            </div>

          </div>
        </div>

      </main>
    ${GuestModal()}
    ${DeleteEventModal()}
    ${DeleteResourceModal()}
    </div>
  `;
}

window.formatDuration = function(minutes) {
    if (!minutes || minutes <= 0) return "—";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h} h ${m} min`;
    if (h > 0) return `${h} h`;
    return `${m} min`;
};

window.loadEditCities = async function () {
    try {
        const { getCities } = await import("../service/api.js");
        const cities = await getCities();
        const wrapper = document.getElementById("editCityWrapper");
        if (!wrapper) return;
        const opts = cities.map(c => ({ value: c.id, label: `${c.name}${c.department ? `, ${c.department}` : ''}` }));
        wrapper.innerHTML = window.customSelectHTML ? window.customSelectHTML('edit-city', opts, '', 'Selecciona una ciudad...') : '<input type="text" placeholder="Ciudad">';
        if (window.initCustomSelect) window.initCustomSelect('edit-city');

        const event = window.__eventData?.event;
        if (event?.city_id) {
            document.getElementById("edit-city").value = event.city_id;
            const display = document.getElementById("edit-cityDisplay");
            if (display) {
                const match = cities.find(c => c.id === event.city_id);
                if (match) display.querySelector('span').textContent = `${match.name}${match.department ? `, ${match.department}` : ''}`;
            }
        }
    } catch {
        const wrapper = document.getElementById("editCityWrapper");
        if (wrapper) {
            wrapper.innerHTML = window.customSelectHTML
                ? window.customSelectHTML('edit-city', [], '', 'Sin conexión')
                : '<input type="text" class="w-full px-4 py-3 border border-[#D0C5B2] rounded-xl text-sm" placeholder="Ciudad">';
        }
    }
};

// ── Alternar entre vista y edición ──
window.toggleEdit = function () {
  const { event, original } = window.__eventData;

  const pad = (n) => String(n).padStart(2, '0');

  document.getElementById("edit-name").value = event?.name || "";
  document.getElementById("edit-location").value = event?.location || "";
  document.getElementById("edit-guests").value = event?.guest_count ?? "";
  document.getElementById("edit-budget").value = event?.max_budget ?? "";
  document.getElementById("edit-description").value = event?.description || "";
  document.getElementById("edit-status").value = event?.status || "borrador";

  // date
  if (event?.event_date) {
      const dt = new Date(event.event_date);
      document.getElementById("edit-date").value = `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}`;
      document.getElementById("editDateDisplayText").textContent = dt.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }

  // populate & set time
  const p2 = (n) => String(n).padStart(2, '0');
  const timeVal = event?.event_date ? (() => {
      const dt = new Date(event.event_date);
      return `${p2(dt.getHours())}:${p2(dt.getMinutes())}`;
  })() : '18:00';
  document.getElementById("edit-time").value = timeVal;
  const timeDisplay = document.getElementById("edit-timeDisplay");
  if (timeDisplay) timeDisplay.querySelector('span').textContent = timeVal;

  const dur = event?.duration || 0;
  document.getElementById("edit-duration-hours").value = Math.floor(dur / 60);
  document.getElementById("edit-duration-minutes").value = dur % 60;
  const minDisplay = document.getElementById("edit-duration-minutesDisplay");
  if (minDisplay) {
      const mins = dur % 60;
      const labels = { 0: '0 min', 15: '15 min', 30: '30 min', 45: '45 min' };
      minDisplay.querySelector('span').textContent = labels[mins] || '0 min';
  }

  if (event?.city_id) {
      document.getElementById("edit-city").value = event.city_id;
  }

  if (window.initCustomSelect) {
      window.initCustomSelect('edit-time');
      window.initCustomSelect('edit-duration-minutes');
  }
  window.initCalendar('edit', 'edit-date', 'editDateDisplay');

  window.loadEditCities();

  document.getElementById("detail-view").classList.add("hidden");
  document.getElementById("detail-edit").classList.remove("hidden");
  document.getElementById("btn-edit").classList.add("hidden");
  document.getElementById("edit-indicator").classList.remove("hidden");
};

window.cancelEdit = function () {
  const { original } = window.__eventData;

  const pad = (n) => String(n).padStart(2, '0');
  
  if (original) {
    document.getElementById("edit-name").value = original.name || "";
    document.getElementById("edit-location").value = original.location || "";
    document.getElementById("edit-guests").value = original.guest_count ?? "";
    document.getElementById("edit-budget").value = original.max_budget ?? "";
    document.getElementById("edit-description").value = original.description || "";
    document.getElementById("edit-status").value = original.status || "borrador";

    if (original.event_date) {
        const dt = new Date(original.event_date);
        document.getElementById("edit-date").value = `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}`;
        document.getElementById("editDateDisplayText").textContent = dt.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
        const tv = `${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
        document.getElementById("edit-time").value = tv;
        const td = document.getElementById("edit-timeDisplay");
        if (td) td.querySelector('span').textContent = tv;
    }

    const dur = original.duration || 0;
    document.getElementById("edit-duration-hours").value = Math.floor(dur / 60);
    document.getElementById("edit-duration-minutes").value = dur % 60;
    const md = document.getElementById("edit-duration-minutesDisplay");
    if (md) {
        const mins = dur % 60;
        const labels = { 0: '0 min', 15: '15 min', 30: '30 min', 45: '45 min' };
        md.querySelector('span').textContent = labels[mins] || '0 min';
    }

    if (original.city_id) {
        document.getElementById("edit-city").value = original.city_id;
    } else {
        document.getElementById("edit-city").value = "";
    }
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
  const citySelect = document.getElementById("edit-city");

  const durHours = parseInt(document.getElementById("edit-duration-hours").value, 10) || 0;
  const durMinutes = parseInt(document.getElementById("edit-duration-minutes").value, 10) || 0;

  const dateVal = document.getElementById("edit-date").value;
  const timeVal = document.getElementById("edit-time").value;

  const payload = {
    name: document.getElementById("edit-name").value,
    event_date: dateVal ? new Date(dateVal + 'T' + timeVal + ':00').toISOString() : null,
    location: document.getElementById("edit-location").value || null,
    guest_count: parseInt(document.getElementById("edit-guests").value, 10) || null,
    max_budget: parseFloat(document.getElementById("edit-budget").value) || null,
    description: document.getElementById("edit-description").value || null,
    duration: durHours * 60 + durMinutes,
  };

  if (citySelect.value) payload.city_id = citySelect.value;

  const cityFields = ['city_id'];
  Object.keys(payload).forEach((k) => {
      if (k === 'city_id' && payload[k] === '') delete payload[k];
      if (!cityFields.includes(k) && payload[k] === null) delete payload[k];
  });

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
      ? new Date(updated.event_date).toLocaleString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
      : "";
    document.getElementById("view-name").textContent = updated.name || "—";
    document.getElementById("view-date").textContent = updated.event_date
      ? new Date(updated.event_date).toLocaleString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
      : "—";
    document.getElementById("view-city").textContent = updated.city_name || updated.city_custom || "—";
    document.getElementById("view-location").textContent = updated.location || "—";
    document.getElementById("view-guests").textContent = updated.guest_count ?? "—";
    document.getElementById("view-budget").textContent = updated.max_budget ? "$" + parseFloat(updated.max_budget).toLocaleString() : "—";
    document.getElementById("view-duration").textContent = updated.duration ? window.formatDuration(updated.duration) : "—";

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
    renderResourceList();
  } catch (err) {
    alert(err.message || "Error al actualizar el recurso.");
  }
}

function cancelInlineEdit(card) {
  renderResourceList();
}

function refreshBudgetAndCounter(updated) {
  if (!updated) return;
  const panel = document.getElementById("budget-panel");
  if (panel) {
    panel.outerHTML = BudgetPanel(updated);
  }
  const counterWrap = document.getElementById("resources-counter-wrapper");
  if (counterWrap) {
    const confirmed = updated.event_items.filter(i => i.confirmed).length;
    const total = updated.event_items.length;
    counterWrap.innerHTML = `
      <span class="text-sm text-[#9E8E6E] bg-[#F8F5F0] px-3 py-1 rounded-lg">${confirmed} de ${total} confirmados</span>
      ${ProgressRing(confirmed, total)}
    `;
  }
}

function renderResourceList() {
  const list = document.getElementById("resources-list");
  if (!list) return;
  const items = window.__eventData?.event?.event_items || [];
  const maxVisible = 10;
  const visible = items.slice(0, maxVisible);
  if (visible.length === 0) {
    list.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12 text-[#9E8E6E]">
        <svg class="w-16 h-16 mb-4 opacity-50 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17a.75.75 0 01-.75-.75v-4.5a.75.75 0 011.5 0v4.5A.75.75 0 017 17z"/>
        </svg>
        <p class="text-lg font-medium">Lienzo de Recursos</p>
        <p class="text-sm mt-1">Agrega recursos a tu evento</p>
      </div>
    `;
  } else {
    list.innerHTML = visible.map(item => buildResourceCardHTML(item)).join('');
  }
  const event = window.__eventData?.event;
  const hasMoreThanMax = (event?.event_items?.length || 0) > maxVisible;
  const showAllBtn = document.getElementById("btn-view-all-resources");
  if (showAllBtn) {
    showAllBtn.closest('.border-t')?.classList.toggle('hidden', !hasMoreThanMax);
  }
  const addBtnWrapper = document.getElementById("add-resource-btn-wrapper");
  if (addBtnWrapper) {
    addBtnWrapper.classList.toggle('hidden', hasMoreThanMax);
  }
  refreshBudgetAndCounter(window.__eventData?.event);
}

function showEmptyStateIfNeeded(list) {
  if (!list.hasChildNodes() || list.children.length === 0) {
    list.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12 text-[#9E8E6E]">
        <svg class="w-16 h-16 mb-4 opacity-50 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17a.75.75 0 01-.75-.75v-4.5a.75.75 0 011.5 0v4.5A.75.75 0 017 17z"/>
                          </svg>
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

  // ── Toggle confirmado ──
  const toggleBtn = e.target.closest(".toggle-confirmed");
  if (toggleBtn) {
    e.preventDefault();
    const itemId = toggleBtn.dataset.id;
    const item = window.__eventData.event.event_items.find(i => i.id === itemId);
    if (!item) return;
    const newConfirmed = !item.confirmed;
    const { eventId } = window.__eventData;
    (async () => {
      try {
        const updated = await updateEventItem(eventId, itemId, { confirmed: newConfirmed });
        window.__eventData.event = updated;
        window.__eventData.original = { ...updated };
        renderResourceList();
      } catch (err) {
        alert(err.message || "Error al actualizar el recurso.");
      }
    })();
  }

  // ── Eliminar ──
  const delBtn = e.target.closest(".delete-resource");
  if (delBtn) {
    const modal = document.getElementById("resource-delete-modal");
    if (modal) {
      modal.dataset.pendingDeleteId = delBtn.dataset.id;
      modal.dataset.pendingDeleteCard = delBtn.closest('[data-item-id]')?.dataset.itemId || "";
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }
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

    renderResourceList();

    document.getElementById("add-resource-form").classList.add("hidden");
    document.getElementById("btn-add-resource").classList.remove("hidden");
    e.target.reset();

  } catch (err) {
    errorEl.textContent = err.message || "Error al crear el recurso.";
    errorEl.classList.remove("hidden");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Guardar Recurso";
  }
});

// ── Modal de confirmación para eliminar recurso ──
document.addEventListener("click", async (e) => {
  const modal = document.getElementById("resource-delete-modal");
  if (!modal) return;

  if (e.target.closest("#cancel-resource-delete")) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    delete modal.dataset.pendingDeleteId;
    delete modal.dataset.pendingDeleteCard;
    return;
  }

  if (e.target.closest("#confirm-resource-delete")) {
    const itemId = modal.dataset.pendingDeleteId;
    const cardItemId = modal.dataset.pendingDeleteCard;
    if (!itemId) return;

    modal.classList.add("hidden");
    modal.classList.remove("flex");

    const card = cardItemId
      ? document.querySelector(`[data-item-id="${cardItemId}"]`)
      : null;

    try {
      const { eventId } = window.__eventData;
      const updated = await deleteEventItem(eventId, itemId);
      window.__eventData.event = updated;
      window.__eventData.original = { ...updated };
      renderResourceList();
    } catch (err) {
      alert(err.message || "Error al eliminar el recurso.");
    } finally {
      delete modal.dataset.pendingDeleteId;
      delete modal.dataset.pendingDeleteCard;
    }
    return;
  }

  if (e.target === modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    delete modal.dataset.pendingDeleteId;
    delete modal.dataset.pendingDeleteCard;
  }
});
