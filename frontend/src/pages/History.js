import { Sidebar } from "../components/Sidebar.js";
import { Topbar } from "../components/Topbar.js";
import { getEvents } from "../service/api.js";
import { icon } from "../components/Icons.js";

function formatDate(dateStr) {
  if (!dateStr) return "Sin fecha";
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}

function formatCurrency(amount) {
  if (amount == null || amount === "0.00") return "$0";
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(amount);
}

const eventTypeIconMap = {
  boda: "star",
  fiesta: "sparkle",
  cumpleaños: "sparkle",
  corporativo: "file",
  empresarial: "file",
  social: "users",
};

function getEventTypeIcon(typeName) {
  if (!typeName) return "calendar";
  const key = typeName.toLowerCase();
  const iconName = eventTypeIconMap[key];
  if (iconName) return iconName;
  for (const [k, v] of Object.entries(eventTypeIconMap)) {
    if (key.includes(k)) return v;
  }
  return "calendar";
}

const eventTypeBorderMap = {
  boda: "border-l-rose-500",
  fiesta: "border-l-amber-500",
  cumpleaños: "border-l-amber-500",
  corporativo: "border-l-blue-500",
  empresarial: "border-l-blue-500",
  social: "border-l-green-500",
};

function getEventBorderColor(typeName) {
  if (!typeName) return "border-l-gray-400";
  const key = typeName.toLowerCase();
  const color = eventTypeBorderMap[key];
  if (color) return color;
  for (const [k, v] of Object.entries(eventTypeBorderMap)) {
    if (key.includes(k)) return v;
  }
  return "border-l-gray-400";
}

function getStatusBadge(status) {
  const map = {
    finalizado: "bg-gray-200 text-gray-600",
    done: "bg-gray-200 text-gray-600",
  };
  const cls = map[status] || "bg-gray-200 text-gray-600";
  return `<span class="px-2.5 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wider ${cls}">Finalizado</span>`;
}

function buildHistoryCard(event) {
  const borderColor = getEventBorderColor(event.event_type_name);
  const iconName = getEventTypeIcon(event.event_type_name);

  const guestsCount = event.registered_guests_count ?? event.confirmed_guests_count ?? event.guest_count ?? 0;
  const total = event.total_gastado ?? event.total_estimated ?? 0;

  return `
    <div class="bg-white rounded-2xl border border-gray-200 border-l-4 ${borderColor} hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
      <div class="p-5 flex flex-col flex-1">
        <div class="flex items-start justify-between mb-3">
          <div class="w-10 h-10 bg-[#FEF3C7] rounded-xl flex items-center justify-center text-[#755B00]">
            ${icon(iconName, 20)}
          </div>
          ${getStatusBadge(event.status)}
        </div>

        <h3 class="font-display text-xl font-bold text-[#1E1B15] mb-1 line-clamp-1">${event.name}</h3>

        <div class="text-xs text-gray-500 flex items-center gap-1.5 mb-4">
          ${icon('calendar', 12)}
          ${formatDate(event.event_date)}
        </div>

        <div class="flex items-center gap-4 text-sm text-[#4D4637] mb-5">
          <div class="flex items-center gap-1.5">
            ${icon('users', 14, 'text-[#9E8E6E]')}
            <span>${guestsCount} invitados</span>
          </div>
          <div class="flex items-center gap-1.5">
            ${icon('dollar-sign', 14, 'text-[#9E8E6E]')}
            <span class="font-semibold text-[#755B00]">${formatCurrency(total)}</span>
          </div>
        </div>

        <button onclick="navigateTo('/events/detail?id=${event.id}')"
          class="mt-auto w-full py-2.5 rounded-xl border border-[#755B00] text-[#755B00] text-sm font-semibold hover:bg-[#FEF3C7] hover:border-[#5F4A00] transition-all flex items-center justify-center gap-2">
          ${icon('arrow-right', 14)}
          Ver resumen
        </button>
      </div>
    </div>
  `;
}

function renderEmptyState() {
  return `
    <div class="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up">
      <div class="w-24 h-24 bg-[#FEF3C7] rounded-3xl flex items-center justify-center text-[#755B00] mb-6">
        ${icon('clock', 48)}
      </div>
      <h2 class="font-display text-3xl text-[#1E1B15] mb-2 text-center">Aún no tienes eventos finalizados.</h2>
      <p class="text-[#4D4637] text-center max-w-md leading-relaxed">Los eventos que finalicen aparecerán aquí para que puedas consultar su resumen.</p>
    </div>
  `;
}

export async function initHistory() {
  const main = document.querySelector("#app main");
  if (!main) return;

  main.innerHTML = `
    <div class="space-y-6 animate-fade-in">
      <div id="history-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"></div>
    </div>
  `;

  try {
    const events = await getEvents();
    const finalizedEvents = events.filter(e => e.status === 'finalizado' || e.status === 'done');

    const grid = document.getElementById("history-grid");
    if (finalizedEvents.length === 0) {
      grid.innerHTML = renderEmptyState();
    } else {
      grid.innerHTML = finalizedEvents.map(buildHistoryCard).join('');
    }
  } catch (err) {
    console.error(err);
    const grid = document.getElementById("history-grid");
    grid.innerHTML = `<p class="col-span-full text-red-600 text-center py-12">Error al cargar el historial</p>`;
  }
}

export function HistoryPage() {
  return `
    <div class="flex h-screen bg-[#FFF8F1]">
      ${Sidebar("history")}
      <div class="flex-1 flex flex-col overflow-hidden">
        ${Topbar(`
          <h1 class="text-2xl font-bold text-[#1E1B15]">Historial</h1>
          <p class="text-[#9E8E6E] text-sm mt-0.5">Eventos finalizados</p>
        `)}
        <main class="flex-1 p-4 lg:p-8 overflow-y-auto"></main>
      </div>
    </div>
  `;
}
