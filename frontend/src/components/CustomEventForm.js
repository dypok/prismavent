import { getCities } from "../service/api.js";
import { icon } from "./Icons.js";

const pad = (n) => String(n).padStart(2, '0');

window.closeCustomModal = function() {
    if (localStorage.getItem("selectedEventTemplate")) {
        window.history.pushState({}, "", "/events/new/template");
    } else {
        window.history.pushState({}, "", "/events/new");
    }
    window.dispatchEvent(new PopStateEvent("popstate"));
};

function timeOptions() {
    const opts = [];
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 30) {
            const v = `${pad(h)}:${pad(m)}`;
            opts.push({ value: v, label: v });
        }
    }
    return opts;
}

function customSelectHTML(prefix, options, defaultVal, placeholder) {
    const sel = options.find(o => o.value === defaultVal);
    return `
    <div class="relative">
      <div id="${prefix}Display" class="w-full px-5 py-3 border border-[#D0C5B2] rounded-2xl text-sm cursor-pointer bg-white flex items-center justify-between select-none">
        <span class="truncate">${sel ? sel.label : (placeholder || 'Selecciona...')}</span>
        ${icon('chevron-down', 16, 'text-[#9E8E6E] shrink-0 ml-2')}
      </div>
      <input type="hidden" id="${prefix}" value="${defaultVal}">
      <div id="${prefix}List" class="hidden absolute top-full left-0 mt-1.5 bg-white border border-[#D0C5B2] rounded-2xl shadow-xl z-[100] w-full max-h-60 overflow-y-auto py-2">
        ${options.map((opt, i) => `
          <button type="button" class="block w-full text-left px-4 py-2.5 text-sm hover:bg-[#F5EDE0] transition-colors ${opt.value === defaultVal ? 'text-[#755B00] font-semibold' : 'text-[#1E1B15]'}" data-value="${opt.value}">
            ${opt.label}
          </button>
        `).join('')}
      </div>
    </div>`;
}

function initCustomSelect(prefix) {
    const display = document.getElementById(`${prefix}Display`);
    const list = document.getElementById(`${prefix}List`);
    if (!display || !list) return;
    if (display.dataset.csDone) return;
    display.dataset.csDone = '1';

    display.addEventListener('click', (e) => {
        e.stopPropagation();
        const wasOpen = !list.classList.contains('hidden');
        closeAllOpenPopups();
        if (!wasOpen) list.classList.remove('hidden');
    });

    list.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-value]');
        if (!btn) return;
        const value = btn.dataset.value;
        document.getElementById(prefix).value = value;
        display.querySelector('span').textContent = btn.textContent;
        list.classList.add('hidden');
        list.querySelectorAll('button').forEach(b => {
            b.classList.remove('text-[#755B00]', 'font-semibold');
            b.classList.add('text-[#1E1B15]');
        });
        btn.classList.add('text-[#755B00]', 'font-semibold');
        btn.classList.remove('text-[#1E1B15]');
    });
}

function closeAllOpenPopups() {
    document.querySelectorAll('.calendar-popup:not(.hidden)').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('[id$="List"]:not(.hidden)').forEach(el => el.classList.add('hidden'));
}

document.addEventListener('mousedown', function(e) {
    const insidePopup = !!(
        e.target.closest('.calendar-popup') ||
        e.target.closest('[id$="List"]') ||
        e.target.closest('[id$="Display"]')
    );
    if (!insidePopup) {
        document.querySelectorAll('.calendar-popup').forEach(function(el) {
            if (!el.classList.contains('hidden')) el.classList.add('hidden');
        });
        document.querySelectorAll('[id$="List"]').forEach(function(el) {
            if (!el.classList.contains('hidden')) el.classList.add('hidden');
        });
    }
});

window.initCustomSelect = initCustomSelect;
window.customSelectHTML = customSelectHTML;

function calendarHTML(prefix, selected) {
    const d = selected || new Date();
    const year = d.getFullYear();
    const month = d.getMonth();
    const today = new Date();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = d.toLocaleDateString("es-ES", { month: "long", year: "numeric" });

    let days = '';
    for (let i = 0; i < firstDay; i++) days += '<div></div>';
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
        const isSel = day === d.getDate() && month === d.getMonth() && year === d.getFullYear();
        const cls = `block w-8 h-8 rounded-full text-xs font-medium leading-8 cursor-pointer hover:bg-[#F5EDE0] transition-colors text-center ${isSel ? 'bg-[#755B00] text-white hover:bg-[#5F4A00]' : ''} ${isToday && !isSel ? 'ring-1 ring-[#755B00]' : ''}`;
        days += `<div><button type="button" class="${cls}" data-day="${day}">${day}</button></div>`;
    }

    return `
    <div id="${prefix}Calendar" class="calendar-popup hidden absolute top-full left-0 mt-1.5 bg-white border border-[#D0C5B2] rounded-2xl shadow-xl z-[100] p-4 w-72">
      <div class="flex items-center justify-between mb-3">
        <button type="button" id="${prefix}PrevMonth" class="text-[#755B00] text-lg font-bold px-2 hover:text-[#5F4A00]">&lsaquo;</button>
        <span class="text-sm font-semibold text-[#1E1B15] capitalize">${monthName}</span>
        <button type="button" id="${prefix}NextMonth" class="text-[#755B00] text-lg font-bold px-2 hover:text-[#5F4A00]">&rsaquo;</button>
      </div>
      <div class="grid grid-cols-7 gap-1 text-center text-xs font-medium text-[#9E8E6E] mb-1">
        <span>Do</span><span>Lu</span><span>Ma</span><span>Mi</span><span>Ju</span><span>Vi</span><span>Sá</span>
      </div>
      <div id="${prefix}DaysGrid" class="grid grid-cols-7 gap-1 text-center">${days}</div>
    </div>`;
}

function initCalendar(prefix, inputId, displayId) {
    let currentDate = new Date();
    const display = document.getElementById(displayId);
    if (!display) return;
    if (display.dataset.calDone) return;
    display.dataset.calDone = '1';

    function render() {
        const d = currentDate;
        const year = d.getFullYear();
        const month = d.getMonth();
        const today = new Date();
        const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const monthName = d.toLocaleDateString("es-ES", { month: "long", year: "numeric" });

        const selVal = document.getElementById(inputId).value;
        const selDate = selVal ? new Date(selVal + 'T12:00:00') : null;

        const header = document.querySelector(`#${prefix}Calendar .text-sm.font-semibold`);
        if (header) header.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);

        let days = '';
        for (let i = 0; i < firstDay; i++) days += '<div></div>';
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDate = new Date(year, month, day);
            const isPast = dayDate < todayMidnight;
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const isSel = selDate && day === selDate.getDate() && month === selDate.getMonth() && year === selDate.getFullYear();
            const cls = `block w-8 h-8 rounded-full text-xs font-medium leading-8 transition-colors text-center ${isSel ? 'bg-[#755B00] text-white' : isPast ? 'text-[#D0C5B2] cursor-default' : 'hover:bg-[#F5EDE0] cursor-pointer text-[#1E1B15]'} ${isToday && !isSel && !isPast ? 'ring-1 ring-[#755B00]' : ''}`;
            days += `<div><button type="button" class="${cls}" ${isPast ? 'disabled' : ''} data-day="${day}">${day}</button></div>`;
        }
        document.getElementById(`${prefix}DaysGrid`).innerHTML = days;
    }

    function open() {
        const selVal = document.getElementById(inputId).value;
        if (selVal) {
            const sel = new Date(selVal + 'T12:00:00');
            currentDate = new Date(sel.getFullYear(), sel.getMonth(), 1);
        }
        render();
        document.getElementById(`${prefix}Calendar`).classList.remove('hidden');
    }

    function close() {
        document.getElementById(`${prefix}Calendar`).classList.add('hidden');
    }

    document.getElementById(displayId)?.addEventListener('click', (e) => {
        e.stopPropagation();
        const cal = document.getElementById(`${prefix}Calendar`);
        const wasOpen = !cal.classList.contains('hidden');
        closeAllOpenPopups();
        if (!wasOpen) open();
    });

    document.getElementById(`${prefix}PrevMonth`)?.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        render();
    });

    document.getElementById(`${prefix}NextMonth`)?.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        render();
    });

    document.getElementById(`${prefix}DaysGrid`)?.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-day]');
        if (!btn) return;
        const day = parseInt(btn.dataset.day, 10);
        const sel = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        document.getElementById(inputId).value = `${sel.getFullYear()}-${pad(sel.getMonth()+1)}-${pad(sel.getDate())}`;
        document.getElementById(displayId).textContent = sel.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
        close();
    });
}

window.initCalendar = initCalendar;
window.calendarHTML = calendarHTML;

let citiesCache = [];

export function CustomEventForm() {
    const today = new Date();
    const defaultDateText = today.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const defaultDateVal = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;

    return `
    <div class="w-full max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl animate-scale-in">

      <div id="templateBanner" class="hidden px-4 lg:px-10 pt-6">
        <div class="bg-[#FEF3C7] border border-[#FDE68A] rounded-2xl px-6 py-4 text-sm text-[#4D4637]">
          Formulario pre-rellenado desde la plantilla: <span id="templateBannerName" class="font-semibold"></span>
        </div>
      </div>

      <div class="px-4 lg:px-8 pt-6 pb-4 border-b border-[#E9E1D7]">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="font-display text-2xl text-[#1E1B15]">Nuevo Evento</h2>
            <p class="text-sm text-[#4D4637]">Completa la información básica</p>
          </div>
          <button type="button" onclick="window.closeCustomModal()"
            class="text-3xl text-gray-400 hover:text-black">&times;</button>
        </div>
      </div>

      <form id="createEventForm" class="p-4 lg:p-8 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">

          <div class="md:col-span-2">
            <label class="block text-xs font-medium tracking-widest text-[#4D4637] mb-1.5">NOMBRE DEL EVENTO</label>
            <input type="text" id="eventName" required class="w-full px-5 py-3 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00] text-sm" placeholder="Lanzamiento Nuevo Producto 2026">
          </div>

          <div class="md:col-span-2">
            <label class="block text-xs font-medium tracking-widest text-[#4D4637] mb-1.5">CIUDAD</label>
            <div id="citySelectWrapper">
              ${customSelectHTML('eventCity', [], '', 'Cargando ciudades...')}
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium tracking-widest text-[#4D4637] mb-1.5">FECHA</label>
            <div class="relative">
              <div id="eventDateDisplay" class="w-full px-5 py-3 border border-[#D0C5B2] rounded-2xl text-sm cursor-pointer bg-white flex items-center justify-between select-none">
                <span class="truncate">${defaultDateText}</span>
                ${icon('calendar', 16, 'text-[#9E8E6E] shrink-0 ml-2')}
              </div>
              <input type="hidden" id="eventDate" value="${defaultDateVal}">
              ${calendarHTML('event', today)}
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium tracking-widest text-[#4D4637] mb-1.5">HORA</label>
            ${customSelectHTML('eventTime', timeOptions(), '18:00', 'Selecciona hora')}
          </div>

          <div>
            <label class="block text-xs font-medium tracking-widest text-[#4D4637] mb-1.5">DURACIÓN</label>
            <div class="flex gap-2 flex-col sm:flex-row">
              <input type="number" id="eventDurationHours" min="0" value="0" class="flex-1 min-w-0 w-full px-5 py-3 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00] text-sm" placeholder="Horas">
              ${customSelectHTML('eventDurationMinutes', [
                { value: '0', label: '0 min' },
                { value: '15', label: '15 min' },
                { value: '30', label: '30 min' },
                { value: '45', label: '45 min' },
              ], '0')}
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium tracking-widest text-[#4D4637] mb-1.5">PARTICIPANTES</label>
            <input type="number" id="guestCount" required min="1" class="w-full px-5 py-3 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00] text-sm">
          </div>

          <div>
            <label class="block text-xs font-medium tracking-widest text-[#4D4637] mb-1.5">PRESUPUESTO MÁXIMO (COP)</label>
            <div class="relative">
              <span class="absolute left-5 top-1/2 -translate-y-1/2 text-xl text-[#755B00]">$</span>
              <input type="number" id="maxBudget" required min="0" class="w-full pl-10 pr-5 py-3 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00] text-sm">
            </div>
          </div>

        </div>

        <div class="pt-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button type="button" onclick="window.closeCustomModal()"
            class="w-full sm:flex-1 py-3.5 border border-[#D0C5B2] rounded-2xl font-medium hover:bg-gray-50 text-sm">Cancelar</button>
          <button type="submit" class="w-full sm:flex-1 py-3.5 bg-[#755B00] hover:bg-[#5F4A00] text-white font-semibold rounded-2xl text-sm shadow-sm">Crear Evento →</button>
        </div>

        <p id="createEventError" class="hidden text-sm text-red-600 text-center"></p>
      </form>
    </div>
  `;
}

export async function loadCities() {
    try {
        const cities = await getCities();
        citiesCache = cities;
        const wrapper = document.getElementById("citySelectWrapper");
        if (!wrapper) return;
        const opts = cities.map(c => ({ value: c.id, label: `${c.name}${c.department ? `, ${c.department}` : ''}` }));
        const defaultVal = opts.length > 0 ? '' : '';
        wrapper.innerHTML = customSelectHTML('eventCity', opts, defaultVal, 'Selecciona una ciudad...');
        initCustomSelect('eventCity');
    } catch {
        document.getElementById("citySelectWrapper").innerHTML = '<input type="text" class="w-full px-5 py-3 border border-[#D0C5B2] rounded-2xl text-sm" placeholder="Ciudad">';
    }
}

export function prefillCustomEventForm() {
    initCalendar('event', 'eventDate', 'eventDateDisplay');
    initCustomSelect('eventTime');
    initCustomSelect('eventDurationMinutes');

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

    const guestInput = document.getElementById("guestCount");
    if (guestInput && preset.guestCount != null) guestInput.value = preset.guestCount;

    const budgetInput = document.getElementById("maxBudget");
    if (budgetInput && preset.maxBudget != null) budgetInput.value = preset.maxBudget;

    if (preset.city && citiesCache.length > 0) {
        const match = citiesCache.find(c => c.name.toLowerCase() === preset.city.toLowerCase());
        if (match) {
            document.getElementById("eventCity").value = match.id;
            const display = document.getElementById("eventCityDisplay");
            if (display) {
                const lbl = `${match.name}${match.department ? `, ${match.department}` : ''}`;
                display.querySelector('span').textContent = lbl;
            }
        }
    }
}

document.addEventListener("submit", async (e) => {
    if (e.target.id !== "createEventForm") return;
    e.preventDefault();

    const errorEl = document.getElementById("createEventError");
    const submitBtn = e.target.querySelector('button[type="submit"]');

    const dateVal = document.getElementById("eventDate").value;
    const timeVal = document.getElementById("eventTime").value;
    const hours = parseInt(document.getElementById("eventDurationHours").value, 10) || 0;
    const minutes = parseInt(document.getElementById("eventDurationMinutes").value, 10) || 0;

    const payload = {
        name: document.getElementById("eventName").value,
        event_date: dateVal ? new Date(dateVal + 'T' + timeVal + ':00').toISOString() : null,
        guest_count: parseInt(document.getElementById("guestCount").value, 10) || 0,
        max_budget: parseFloat(document.getElementById("maxBudget").value) || 0,
        duration: hours * 60 + minutes,
    };

    const cityVal = document.getElementById("eventCity").value;
    if (cityVal) payload.city_id = cityVal;

    const selectedTemplate = JSON.parse(
        localStorage.getItem("selectedEventTemplate")
    );

    if (selectedTemplate) {
        if (selectedTemplate.user_template_id) {
            payload.user_template_id = selectedTemplate.user_template_id;
        } else if (selectedTemplate.id) {
            payload.template_id = selectedTemplate.id;
        }
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
        window.history.replaceState({}, "", `/events/detail?id=${createdEvent.id}`);
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
