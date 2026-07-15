import { Sidebar } from "../components/Sidebar.js";
import { Topbar } from "../components/Topbar.js";
import { EventStepper } from "../components/EventStepper.js";
import { getEventById, updateEvent } from "../service/api.js";
import { BudgetPanel } from "../components/BudgetPanel.js";
import { DeleteEventModal } from "../components/DeleteEventModal.js";

export async function EventDetail(eventId) {
  let event = null;
  let original = null;

    if (eventId) {
      try {
        event = await getEventById(eventId);
    
      } catch (error) {
        console.error(error);
      }
  }
  
  const totalResources = event?.event_items?.length || 0;

  const confirmedResources =
    event?.event_items?.filter(item => item.confirmed).length || 0;

  const isFinalized = event?.status === 'finalizado';

  return `
    <div class="flex min-h-screen bg-[#F8F5F0]">

      ${Sidebar("events")}

      <main class="flex-1 flex flex-col overflow-hidden">

        ${Topbar()}

        <div class="flex-1 overflow-auto custom-scrollbar">
          <div class="p-8 max-w-7xl mx-auto">

            <div class="flex items-center justify-between mb-8 animate-fade-in">
              <div class="flex items-center gap-4">
                <button onclick="window.history.back()" class="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#9E8E6E] hover:text-[#1E1B15] hover:shadow-sm transition-all border border-[#E9E1D7]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <div>
                  <div class="flex items-center gap-3">
                    <h1 class="text-3xl font-bold text-[#1E1B15]" id="detail-title">${event?.name}</h1>
                    <span class="px-3 py-1 text-xs font-semibold bg-[#FEF3C7] text-[#755B00] rounded-full">${event?.status || "Borrador"}</span>
                  </div>
                  <p class="text-[#9E8E6E] mt-1" id="detail-date-display">${event?.event_date}</p>
                </div>
              </div>
              <div class="flex gap-3" id="detail-actions">
                <button id="btn-edit" onclick="toggleEdit()"
                  class="px-5 py-2.5 bg-[#755B00] text-white rounded-xl text-sm font-semibold hover:bg-[#5F4A00] transition-all shadow-sm">Editar</button>
              </div>
            </div>

            <section class="flex gap-6">

              <div class="flex-1 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                ${EventStepper(1)}

                ${isFinalized ? `
                <div class="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-3 text-blue-800 text-sm">
                  Este evento esta finalizado. No se permiten modificaciones.
                </div>
                ` : ''}

                <div class="flex justify-between items-center mb-6">
                  <h2 class="text-xl font-bold text-[#1E1B15] flex items-center gap-2">🎯 Recursos del Evento</h2>
                  <span class="text-sm text-[#9E8E6E] bg-[#F8F5F0] px-3 py-1 rounded-lg">${confirmedResources} de ${totalResources} confirmados</span>
                </div>
                <div class="h-[500px] rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-[#9E8E6E] bg-[#F8F5F0]/50">
                  <span class="text-5xl mb-4 opacity-50">🎨</span>
                  <p class="text-lg font-medium">Lienzo de Recursos</p>
                  <p class="text-sm mt-1">Arrastra y organiza tus recursos aquí</p>
                  <button class="mt-6 px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-[#4D4637] hover:border-[#755B00] hover:text-[#755B00] transition-all shadow-sm">+ Añadir Recurso</button>
                </div>
              </div>

              <aside class="w-2/5 space-y-6 animate-fade-in-up">
                ${BudgetPanel(event)}

                <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm" id="detail-info-panel">
                  <div class="flex items-center justify-between mb-5">
                    <h2 class="text-lg font-bold text-[#1E1B15] flex items-center gap-2">
                      <span>ℹ️</span> Información del Evento
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
                        <option value="planificando" ${event?.status === "planificando" ? "selected" : ""}>Planificando</option>
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
        </div>

      </main>
    ${DeleteEventModal()}
    </div>
  `;

  // ── Guardar referencia al evento original ──
  window.__eventData = { event, original, eventId };
}

// ── Alternar entre vista y edición ──
window.toggleEdit = function () {
  document.getElementById("detail-view").classList.add("hidden");
  document.getElementById("detail-edit").classList.remove("hidden");
  document.getElementById("btn-edit").classList.add("hidden");
  document.getElementById("edit-indicator").classList.remove("hidden");
};

window.cancelEdit = function () {
  const { original } = window.__eventData;
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

  const { eventId } = window.__eventData;
  const errorEl = document.getElementById("edit-error");
  const submitBtn = e.target.querySelector('button[type="submit"]');

  const payload = {
    name: document.getElementById("edit-name").value,
    event_date: document.getElementById("edit-date").value || null,
    location: document.getElementById("edit-location").value || null,
    guest_count: parseInt(document.getElementById("edit-guests").value, 10) || null,
    max_budget: parseFloat(document.getElementById("edit-budget").value) || null,
    visibility_status: document.getElementById("edit-status").value,
    description: document.getElementById("edit-description").value || null,
  };

  Object.keys(payload).forEach((k) => { if (payload[k] === null) delete payload[k]; });

  errorEl.classList.add("hidden");
  submitBtn.disabled = true;
  submitBtn.textContent = "Guardando...";

  try {
    await updateEvent(eventId, payload);

    const updated = await getEventById(eventId);

    window.__eventData.event = updated;
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
