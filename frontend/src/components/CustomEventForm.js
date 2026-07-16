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

const today = new Date().toISOString().split('T')[0];

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
            <p class="text-[#4D4637]">Completa la información básica</p>
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

          <div class="md:col-span-2">
            <label class="block text-xs font-medium tracking-widest text-[#4D4637] mb-2">CIUDAD</label>
            <input type="text" id="eventCity" class="w-full px-6 py-4 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00]" placeholder="Ej: Bogotá, Medellín, Cali...">
          </div>

          <div>
            <label class="block text-xs font-medium tracking-widest text-[#4D4637] mb-2">FECHA</label>
            <input type="date" id="eventDate" required min="${today}" class="w-full px-6 py-4 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00]">
          </div>

          <div>
            <label class="block text-xs font-medium tracking-widest text-[#4D4637] mb-2">NÚMERO DE PARTICIPANTES</label>
            <input type="number" id="guestCount" required min="1" class="w-full px-6 py-4 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00]">
          </div>

          <div class="md:col-span-2">
            <label class="block text-xs font-medium tracking-widest text-[#4D4637] mb-2">PRESUPUESTO MÁXIMO (COP)</label>
            <div class="relative">
              <span class="absolute left-6 top-1/2 -translate-y-1/2 text-2xl text-[#755B00]">$</span>
              <input type="number" id="maxBudget" required min="0" class="w-full pl-12 pr-6 py-4 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00]">
            </div>
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

    const cityInput = document.getElementById("eventCity");
    if (cityInput && preset.city) cityInput.value = preset.city;

    const guestInput = document.getElementById("guestCount");
    if (guestInput && preset.guestCount != null) guestInput.value = preset.guestCount;

    const budgetInput = document.getElementById("maxBudget");
    if (budgetInput && preset.maxBudget != null) budgetInput.value = preset.maxBudget;
}

// Al confirmar: llama a POST /events con los campos que sí existen en
// el schema del backend (EventCreate).
document.addEventListener("submit", async (e) => {
    if (e.target.id !== "createEventForm") return;
    e.preventDefault();

    const errorEl = document.getElementById("createEventError");
    const submitBtn = e.target.querySelector('button[type="submit"]');

    const payload = {
        name: document.getElementById("eventName").value,
        event_date: document.getElementById("eventDate").value,
        guest_count: parseInt(document.getElementById("guestCount").value, 10) || 0,
        max_budget: parseFloat(document.getElementById("maxBudget").value) || 0,
    };
    
    const city = document.getElementById("eventCity").value;
    if (city) payload.city_custom = city;

    const selectedTemplate = JSON.parse(      
        localStorage.getItem("selectedEventTemplate")
    );

    if (selectedTemplate) {
        payload.template_id = selectedTemplate.id;
    }

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