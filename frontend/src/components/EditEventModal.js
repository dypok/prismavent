import { getEventById, updateEvent } from "../service/api.js";

export function EditEventModal(eventId) {
  const event = null;
  const overlay = document.createElement("div");
  overlay.id = "edit-event-overlay";
  overlay.className = "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in";
  overlay.innerHTML = `
    <div onclick="event.stopPropagation()" class="bg-white rounded-3xl w-full max-w-lg mx-4 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
      <div class="px-8 pt-6 pb-4 border-b border-[#E9E1D7] flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-[#1E1B15]">Editar Evento</h2>
          <p class="text-sm text-[#9E8E6E] mt-0.5">Actualiza la información del evento</p>
        </div>
        <button onclick="document.getElementById('edit-event-overlay').remove()"
          class="w-10 h-10 rounded-xl hover:bg-[#F8F5F0] transition-colors flex items-center justify-center text-2xl text-[#9E8E6E] hover:text-[#1E1B15]">✕</button>
      </div>
      <div class="p-8">
        <div id="edit-event-loading" class="space-y-5 animate-pulse">
          <div class="h-4 bg-[#E9E1D7] rounded w-1/3"></div>
          <div class="h-10 bg-[#E9E1D7] rounded-2xl"></div>
          <div class="h-4 bg-[#E9E1D7] rounded w-1/4"></div>
          <div class="h-10 bg-[#E9E1D7] rounded-2xl"></div>
          <div class="grid grid-cols-2 gap-4">
            <div><div class="h-4 bg-[#E9E1D7] rounded w-1/2 mb-2"></div><div class="h-10 bg-[#E9E1D7] rounded-2xl"></div></div>
            <div><div class="h-4 bg-[#E9E1D7] rounded w-1/2 mb-2"></div><div class="h-10 bg-[#E9E1D7] rounded-2xl"></div></div>
          </div>
        </div>
        <form id="edit-event-form" class="hidden space-y-5">
          <div>
            <label class="block text-xs font-semibold tracking-widest text-[#4D4637] mb-1.5">NOMBRE DEL EVENTO</label>
            <input type="text" id="edit-name" required
              class="w-full px-5 py-3.5 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00] focus:outline-none text-sm">
          </div>
          <div>
            <label class="block text-xs font-semibold tracking-widest text-[#4D4637] mb-1.5">FECHA</label>
            <input type="date" id="edit-date"
              class="w-full px-5 py-3.5 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00] focus:outline-none text-sm">
          </div>
          <div>
            <label class="block text-xs font-semibold tracking-widest text-[#4D4637] mb-1.5">UBICACIÓN</label>
            <input type="text" id="edit-location"
              class="w-full px-5 py-3.5 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00] focus:outline-none text-sm" placeholder="Ej: Hotel Hilton">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold tracking-widest text-[#4D4637] mb-1.5">INVITADOS</label>
              <input type="number" id="edit-guest-count" min="0"
                class="w-full px-5 py-3.5 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00] focus:outline-none text-sm">
            </div>
            <div>
              <label class="block text-xs font-semibold tracking-widest text-[#4D4637] mb-1.5">PRESUPUESTO MÁX.</label>
              <input type="number" id="edit-max-budget" min="0"
                class="w-full px-5 py-3.5 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00] focus:outline-none text-sm">
            </div>
          </div>
          <div>
            <label class="block text-xs font-semibold tracking-widest text-[#4D4637] mb-1.5">DESCRIPCIÓN</label>
            <textarea id="edit-description" rows="3"
              class="w-full px-5 py-3.5 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00] focus:outline-none text-sm resize-none"></textarea>
          </div>
          <div class="flex gap-3 pt-2">
            <button type="button" onclick="document.getElementById('edit-event-overlay').remove()"
              class="flex-1 py-3.5 border-2 border-[#D0C5B2] rounded-2xl font-medium text-[#4D4637] hover:bg-[#F8F5F0] transition-all text-sm">Cancelar</button>
            <button type="submit"
              class="flex-1 py-3.5 bg-[#755B00] hover:bg-[#5F4A00] text-white font-semibold rounded-2xl transition-all text-sm shadow-sm">Guardar Cambios</button>
          </div>
          <p id="edit-event-error" class="hidden text-sm text-red-600 text-center bg-red-50 rounded-xl py-2"></p>
        </form>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.onclick = (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  };

  getEventById(eventId).then(event => {
    document.getElementById("edit-event-loading").classList.add("hidden");
    const form = document.getElementById("edit-event-form");
    form.classList.remove("hidden");

    document.getElementById("edit-name").value = event.name || "";
    document.getElementById("edit-date").value = event.event_date || "";
    document.getElementById("edit-location").value = event.location || "";
    document.getElementById("edit-guest-count").value = event.guest_count || "";
    document.getElementById("edit-max-budget").value = event.max_budget || "";
    document.getElementById("edit-description").value = event.description || "";

    form.onsubmit = async (e) => {
      e.preventDefault();
      const errorEl = document.getElementById("edit-event-error");
      const submitBtn = form.querySelector('button[type="submit"]');

      const payload = {
        name: document.getElementById("edit-name").value,
        event_date: document.getElementById("edit-date").value || null,
        location: document.getElementById("edit-location").value || null,
        guest_count: parseInt(document.getElementById("edit-guest-count").value, 10) || null,
        max_budget: parseFloat(document.getElementById("edit-max-budget").value) || null,
        description: document.getElementById("edit-description").value || null,
      };

      Object.keys(payload).forEach(k => { if (payload[k] === null) delete payload[k]; });

      errorEl.classList.add("hidden");
      submitBtn.disabled = true;
      submitBtn.textContent = "Guardando...";

      try {
        await updateEvent(eventId, payload);
        overlay.remove();
        window.dispatchEvent(new CustomEvent("events-updated"));
      } catch (err) {
        errorEl.textContent = err.message || "No se pudo actualizar el evento.";
        errorEl.classList.remove("hidden");
        submitBtn.disabled = false;
        submitBtn.textContent = "Guardar Cambios";
      }
    };
  }).catch(err => {
    document.getElementById("edit-event-loading").innerHTML = `
      <p class="text-red-500">Error al cargar el evento</p>
      <button onclick="document.getElementById('edit-event-overlay').remove()" class="mt-3 px-4 py-2 bg-[#755B00] text-white rounded-xl text-sm">Cerrar</button>
    `;
  });
}
