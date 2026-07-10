// Formulario basado en el trabajo original(rama
// feature/event-management). Adaptaciones para encajar en el patrón
// del proyecto:
// 1. Ya no es un modal insertado sobre otra página (insertAdjacentHTML) -
//    aquí ES la página completa de la ruta /events/new/custom.
// 2. Cancelar/cerrar navega de vuelta a /events/new en vez de remover
//    un nodo del DOM (no aplica: no hay una página "debajo" que revelar).
// 3. Se agrega prefillCustomEventForm(), que se llama después de insertar
//    el HTML (los <script> embebidos en un string no se ejecutan con
//    innerHTML) para rellenar el formulario si el usuario viene desde
//    una plantilla seleccionada en EventTemplatesGrid.

import { apiFetch } from "../service/api.js";

export function CustomEventForm() {
    return `
    <div class="w-full max-w-3xl mx-auto bg-white rounded-3xl shadow-xl">

      <div id="templateBanner" class="hidden px-10 pt-6">
        <div class="bg-[#FEF3C7] border border-[#FDE68A] rounded-2xl px-6 py-4 text-sm text-[#4D4637]">
          Formulario pre-rellenado desde la plantilla: <span id="templateBannerName" class="font-semibold"></span>
        </div>
      </div>

      <div class="px-10 pt-8 pb-5 border-b border-[#E9E1D7]">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="font-display text-3xl text-[#1E1B15]">Nuevo Evento</h2>
            <p class="text-[#4D4637]">Completa toda la información requerida</p>
          </div>
          <button onclick="window.history.pushState({}, '', '/events/new'); window.dispatchEvent(new PopStateEvent('popstate'))"
            class="text-4xl text-gray-400 hover:text-black">×</button>
        </div>
      </div>

      <form id="createEventForm" class="p-10 space-y-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7">

          <div class="md:col-span-2">
            <label class="block text-xs font-medium tracking-widest text-[#4D4637] mb-2">NOMBRE DEL EVENTO</label>
            <input type="text" id="eventName" required class="w-full px-6 py-4 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00]" placeholder="Lanzamiento Nuevo Producto 2026">
          </div>

          <div>
            <label class="block text-xs font-medium tracking-widest text-[#4D4637] mb-2">FECHA</label>
            <input type="date" id="eventDate" required class="w-full px-6 py-4 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00]">
          </div>
          <div>
            <label class="block text-xs font-medium tracking-widest text-[#4D4637] mb-2">HORA INICIO</label>
            <input type="time" id="eventTime" class="w-full px-6 py-4 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00]">
          </div>

          <div class="md:col-span-2">
            <label class="block text-xs font-medium tracking-widest text-[#4D4637] mb-2">LUGAR / SEDE</label>
            <input type="text" id="eventLocation" class="w-full px-6 py-4 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00]" placeholder="Hotel Hilton - Salón Imperial">
          </div>

          <div>
            <label class="block text-xs font-medium tracking-widest text-[#4D4637] mb-2">N° DE ASISTENTES</label>
            <input type="number" id="guestCount" required class="w-full px-6 py-4 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00]">
          </div>

          <div>
            <label class="block text-xs font-medium tracking-widest text-[#4D4637] mb-2">TIPO DE EVENTO</label>
            <select id="eventType" required class="w-full px-6 py-4 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00]">
              <option value="">Seleccionar...</option>
              <option value="launch">Lanzamiento de Producto</option>
              <option value="conference">Conferencia</option>
              <option value="seminar">Seminario / Taller</option>
              <option value="team-building">Team Building</option>
              <option value="gala">Gala / Cena Corporativa</option>
              <option value="wedding">Boda</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <div class="md:col-span-2">
            <label class="block text-xs font-medium tracking-widest text-[#4D4637] mb-2">PRESUPUESTO MÁXIMO (COP)</label>
            <div class="relative">
              <span class="absolute left-6 top-1/2 -translate-y-1/2 text-2xl text-[#755B00]">$</span>
              <input type="number" id="maxBudget" required class="w-full pl-12 pr-6 py-4 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00]">
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium tracking-widest text-[#4D4637] mb-2">¿CATERING?</label>
            <select id="catering" class="w-full px-6 py-4 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00]">
              <option value="full">Sí - Completo (Comida + Bebida)</option>
              <option value="light">Sí - Ligero (Coffee Break)</option>
              <option value="no">No</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-medium tracking-widest text-[#4D4637] mb-2">EQUIPO AUDIOVISUAL</label>
            <select id="audiovisual" class="w-full px-6 py-4 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00]">
              <option value="full">Completo (Proyector, Sonido, Micrófonos)</option>
              <option value="basic">Básico</option>
              <option value="no">No requerido</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-medium tracking-widest text-[#4D4637] mb-2">¿STREAMING / TRANSMISIÓN?</label>
            <select id="streaming" class="w-full px-6 py-4 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00]">
              <option value="yes">Sí</option>
              <option value="no">No</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-medium tracking-widest text-[#4D4637] mb-2">DURACIÓN (HORAS)</label>
            <input type="number" id="duration" value="8" class="w-full px-6 py-4 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00]">
          </div>

          <div>
            <label class="block text-xs font-medium tracking-widest text-[#4D4637] mb-2">N° DE SPEAKERS / INVITADOS ESPECIALES</label>
            <input type="number" id="speakers" value="3" class="w-full px-6 py-4 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00]">
          </div>

          <div>
            <label class="block text-xs font-medium tracking-widest text-[#4D4637] mb-2">¿MATERIAL PROMOCIONAL?</label>
            <select id="promotional" class="w-full px-6 py-4 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00]">
              <option value="yes">Sí (Roll-ups, brochures, gifts)</option>
              <option value="no">No</option>
            </select>
          </div>

          <div class="md:col-span-2">
            <label class="block text-xs font-medium tracking-widest text-[#4D4637] mb-2">OBJETIVOS DEL EVENTO / NOTAS ESPECIALES</label>
            <textarea id="notes" rows="5" class="w-full px-6 py-4 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00]"
              placeholder="Ej: Generar leads, motivar equipo, lanzamiento oficial, protocolo de bioseguridad, invitados VIP..."></textarea>
          </div>

        </div>

        <div class="pt-8 flex gap-4">
          <button type="button" onclick="window.history.pushState({}, '', '/events/new'); window.dispatchEvent(new PopStateEvent('popstate'))"
            class="flex-1 py-4 border border-[#D0C5B2] rounded-2xl font-medium hover:bg-gray-50">Cancelar</button>
          <button type="submit" class="flex-1 py-4 bg-[#755B00] hover:bg-[#5F4A00] text-white font-semibold rounded-2xl">Crear Evento →</button>
        </div>

        <p id="createEventError" class="hidden text-sm text-red-600 text-center"></p>
      </form>
    </div>
  `;
}

// Rellena el formulario con el preset guardado en localStorage por
// EventTemplatesGrid, si existe. Se debe llamar manualmente después de
// insertar el HTML de arriba en el DOM (ver pages/CustomEventFlow.js).
// NOTA: no mapea "eventType" porque los IDs del <select> (en inglés)
// no coinciden 1:1 con los nombres de plantilla (en español) - se deja
// que el usuario lo elija manualmente por ahora.
export function prefillCustomEventForm() {
    const raw = localStorage.getItem("selectedEventTemplate");
    if (!raw) return;

    let preset;
    try {
        preset = JSON.parse(raw);
    } catch {
        return;
    }

    const banner = document.getElementById("templateBanner");
    const bannerName = document.getElementById("templateBannerName");
    if (banner && bannerName && preset.type) {
        banner.classList.remove("hidden");
        bannerName.textContent = preset.type;
    }

    const cateringSelect = document.getElementById("catering");
    if (cateringSelect && preset.catering) {
        if (preset.catering.startsWith("Sí")) {
            cateringSelect.value = preset.catering.includes("Ligero") ? "light" : "full";
        } else {
            cateringSelect.value = "no";
        }
    }

    const durationInput = document.getElementById("duration");
    if (durationInput && preset.duration != null) durationInput.value = preset.duration;

    const streamingSelect = document.getElementById("streaming");
    if (streamingSelect && preset.streaming) {
        streamingSelect.value = preset.streaming === "Sí" ? "yes" : "no";
    }

    const speakersInput = document.getElementById("speakers");
    if (speakersInput && preset.speakers != null) speakersInput.value = preset.speakers;

    const promotionalSelect = document.getElementById("promotional");
    if (promotionalSelect && preset.promotional) {
        promotionalSelect.value = preset.promotional.startsWith("Sí") ? "yes" : "no";
    }

    const notesTextarea = document.getElementById("notes");
    if (notesTextarea && preset.notes) notesTextarea.value = preset.notes;

    // Se consume una sola vez: si el usuario navega a /events/new/custom
    // directamente después, no debe seguir viendo datos de una plantilla vieja.
    localStorage.removeItem("selectedEventTemplate");
}

// Al confirmar: llama a POST /events con los campos que sí existen en
// el schema del backend (EventCreate). Los campos del formulario que
// todavía no tienen equivalente en el backend (catering, audiovisual,
// streaming, speakers, material promocional) NO se envían por ahora
// -- ver nota más abajo, es una limitación conocida, no un descuido.
document.addEventListener("submit", async (e) => {
    if (e.target.id !== "createEventForm") return;
    e.preventDefault();

    const errorEl = document.getElementById("createEventError");
    const submitBtn = e.target.querySelector('button[type="submit"]');

    const payload = {
        name: document.getElementById("eventName").value,
        event_date: document.getElementById("eventDate").value,
        guest_count: parseInt(document.getElementById("guestCount").value, 10) || 0,
        location: document.getElementById("eventLocation").value || null,
        description: document.getElementById("notes").value || null,
    };

    const maxBudgetValue = document.getElementById("maxBudget").value;
    if (maxBudgetValue) payload.max_budget = parseFloat(maxBudgetValue);

    if (errorEl) errorEl.classList.add("hidden");
    submitBtn.disabled = true;
    submitBtn.textContent = "Creando evento...";

    try {
        const createdEvent = await apiFetch("/events", {
            method: "POST",
            body: JSON.stringify(payload),
        });

        localStorage.removeItem("selectedEventTemplate");
        window.history.pushState({}, "", `/events/detail?id=${createdEvent.id}`);
        window.dispatchEvent(new PopStateEvent("popstate"));
    } catch (err) {
        if (errorEl) {
            errorEl.textContent = err.message || "No se pudo crear el evento.";
            errorEl.classList.remove("hidden");
        }
        submitBtn.disabled = false;
        submitBtn.textContent = "Crear Evento →";
    }
});