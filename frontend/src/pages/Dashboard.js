import { Sidebar } from "../components/Sidebar.js";
import { Topbar } from "../components/Topbar.js";
import { getEvents } from "../service/api.js";
import { icon } from "../components/Icons.js";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

function daysRemaining(dateStr) {
  if (!dateStr) return null;
  const now = new Date();
  const target = new Date(dateStr);
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  if (diff < 0) return `Atrasado ${Math.abs(diff)}d`;
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Mañana";
  return `${diff}d`;
}

function statusColor(status) {
  const map = {
    borrador: "bg-gray-200 text-gray-600",
    confirmado: "bg-[#FEF3C7] text-[#755B00]",
    in_progress: "bg-blue-100 text-blue-700",
    done: "bg-green-100 text-green-700",
    finalizado: "bg-green-100 text-green-700",
  };
  return map[status] || "bg-gray-200 text-gray-600";
}

function statusLabel(status) {
  const map = {
    borrador: "Borrador",
    confirmado: "Confirmado",
    in_progress: "En Progreso",
    done: "Realizado",
    finalizado: "Finalizado",
  };
  return map[status] || status;
}

export async function initDashboard() {
  const main = document.querySelector("#app main");
  if (!main) return;

  main.innerHTML = `
    <div class="space-y-4 lg:space-y-6 animate-fade-in">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4" id="stats-cards">
        <div class="bg-white rounded-2xl border border-[#E9E1D7] p-4 lg:p-6 shadow-sm animate-pulse"><div class="h-4 bg-gray-200 rounded w-20 mb-3"></div><div class="h-8 bg-gray-200 rounded w-12"></div></div>
        <div class="bg-white rounded-2xl border border-[#E9E1D7] p-4 lg:p-6 shadow-sm animate-pulse"><div class="h-4 bg-gray-200 rounded w-20 mb-3"></div><div class="h-8 bg-gray-200 rounded w-12"></div></div>
        <div class="bg-white rounded-2xl border border-[#E9E1D7] p-4 lg:p-6 shadow-sm animate-pulse"><div class="h-4 bg-gray-200 rounded w-20 mb-3"></div><div class="h-8 bg-gray-200 rounded w-12"></div></div>
        <div class="bg-white rounded-2xl border border-[#E9E1D7] p-4 lg:p-6 shadow-sm animate-pulse"><div class="h-4 bg-gray-200 rounded w-20 mb-3"></div><div class="h-8 bg-gray-200 rounded w-12"></div></div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div class="bg-white rounded-2xl border border-[#E9E1D7] p-4 lg:p-6 shadow-sm animate-pulse"><div class="h-5 bg-gray-200 rounded w-40 mb-4"></div><div class="h-20 bg-gray-100 rounded"></div></div>
        <div class="bg-white rounded-2xl border border-[#E9E1D7] p-4 lg:p-6 shadow-sm animate-pulse"><div class="h-5 bg-gray-200 rounded w-40 mb-4"></div><div class="h-20 bg-gray-100 rounded"></div></div>
      </div>
    </div>
  `;

  try {
    const events = await getEvents();
    const now = new Date();

    const total = events.length;
    const upcoming = events.filter(e => e.event_date && new Date(e.event_date) > now).length;
    const inProgress = events.filter(e => e.status === "in_progress").length;
    const completed = events.filter(e => e.status === "done" || e.status === "finalizado").length;

    const statusCounts = {};
    events.forEach(e => { statusCounts[e.status] = (statusCounts[e.status] || 0) + 1; });
    const statusOrder = ["borrador", "confirmado", "in_progress", "done", "finalizado"];
    const maxCount = Math.max(...Object.values(statusCounts), 1);

    const sorted = [...events]
      .filter(e => e.event_date)
      .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
      .slice(0, 5);

    main.innerHTML = `
      <div class="space-y-4 lg:space-y-6 animate-fade-in">

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white rounded-2xl border border-[#E9E1D7] p-4 lg:p-6 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-semibold uppercase tracking-wider text-[#9E8E6E]">Total Eventos</p>
                <p class="text-3xl font-bold text-[#1E1B15] mt-1">${total}</p>
              </div>
              <div class="w-11 h-11 bg-[#FEF3C7] rounded-xl flex items-center justify-center">
                ${icon('calendar', 22, 'text-[#755B00]')}
              </div>
            </div>
          </div>
          <div class="bg-white rounded-2xl border border-[#E9E1D7] p-4 lg:p-6 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-semibold uppercase tracking-wider text-[#9E8E6E]">Próximos</p>
                <p class="text-3xl font-bold text-[#1E1B15] mt-1">${upcoming}</p>
              </div>
              <div class="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
                ${icon('check', 22, 'text-[#3B82F6]')}
              </div>
            </div>
          </div>
          <div class="bg-white rounded-2xl border border-[#E9E1D7] p-4 lg:p-6 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-semibold uppercase tracking-wider text-[#9E8E6E]">En Progreso</p>
                <p class="text-3xl font-bold text-[#1E1B15] mt-1">${inProgress}</p>
              </div>
              <div class="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center">
                ${icon('play', 22, 'text-[#D97706]')}
              </div>
            </div>
          </div>
          <div class="bg-white rounded-2xl border border-[#E9E1D7] p-4 lg:p-6 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-semibold uppercase tracking-wider text-[#9E8E6E]">Realizados</p>
                <p class="text-3xl font-bold text-[#1E1B15] mt-1">${completed}</p>
              </div>
              <div class="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center">
                ${icon('check-circle', 22, 'text-[#16A34A]')}
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">

          <div class="bg-white rounded-2xl border border-[#E9E1D7] p-4 lg:p-6 shadow-sm">
            <h3 class="font-semibold text-[#1E1B15] text-sm uppercase tracking-wider mb-4">Estado de Eventos</h3>
            <div class="space-y-3">
              ${statusOrder.map(s => {
                const count = statusCounts[s] || 0;
                const pct = Math.round((count / maxCount) * 100);
                if (count === 0) return '';
                return `
                  <div>
                    <div class="flex justify-between text-xs mb-1">
                      <span class="font-medium text-[#4D4637]">${statusLabel(s)}</span>
                      <span class="font-semibold text-[#1E1B15]">${count}</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div class="h-2 rounded-full transition-all duration-500 ${s === 'borrador' ? 'bg-gray-400' : s === 'confirmado' ? 'bg-[#C9A84C]' : s === 'in_progress' ? 'bg-blue-500' : 'bg-green-500'}" style="width: ${pct}%"></div>
                    </div>
                  </div>
                `;
              }).join('')}
              ${total === 0 ? '<p class="text-sm text-[#9E8E6E] text-center py-4">No hay eventos aún</p>' : ''}
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-[#E9E1D7] p-4 lg:p-6 shadow-sm">
            <div class="flex justify-between items-center mb-4">
              <h3 class="font-semibold text-[#1E1B15] text-sm uppercase tracking-wider">Próximos Eventos</h3>
              <a href="/events" onclick="event.preventDefault(); window.history.pushState({},'','/events'); window.dispatchEvent(new PopStateEvent('popstate'))" class="text-xs text-[#755B00] hover:underline font-medium">Ver todos</a>
            </div>
            <div class="space-y-3">
              ${sorted.length > 0 ? sorted.map(e => `
                <a href="/events/detail?id=${e.id}" onclick="event.preventDefault(); window.history.pushState({},'','/events/detail?id=${e.id}'); window.dispatchEvent(new PopStateEvent('popstate'))" class="block bg-[#F8F5F0] rounded-xl p-4 hover:bg-[#F5EDE0] transition-colors">
                  <div class="flex items-center justify-between">
                    <div class="min-w-0 flex-1">
                      <p class="font-semibold text-sm text-[#1E1B15] truncate">${e.name}</p>
                      <p class="text-xs text-[#9E8E6E] mt-0.5">${formatDate(e.event_date)}</p>
                    </div>
                    <div class="flex items-center gap-3 ml-3 shrink-0">
                      <span class="text-xs font-semibold ${new Date(e.event_date) < now ? 'text-red-500' : 'text-green-600'}">${daysRemaining(e.event_date)}</span>
                      <span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${statusColor(e.status)}">${statusLabel(e.status)}</span>
                    </div>
                  </div>
                </a>
              `).join('') : `
                <div class="text-center py-8">
                  <p class="text-sm text-[#9E8E6E] mb-3">No hay eventos próximos</p>
                  <a href="/events/new" onclick="event.preventDefault(); window.history.pushState({},'','/events/new'); window.dispatchEvent(new PopStateEvent('popstate'))" class="inline-block px-5 py-2.5 bg-[#755B00] text-white rounded-xl text-sm font-semibold hover:bg-[#5F4A00] transition shadow-sm">Crear Evento</a>
                </div>
              `}
            </div>
          </div>

        </div>

        <div class="bg-white rounded-2xl border border-[#E9E1D7] p-4 lg:p-6 shadow-sm">
          <h3 class="font-semibold text-[#1E1B15] text-sm uppercase tracking-wider mb-4">Acciones Rápidas</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <a href="/events/new" onclick="event.preventDefault(); window.history.pushState({},'','/events/new'); window.dispatchEvent(new PopStateEvent('popstate'))" class="flex flex-col items-center gap-2 p-4 bg-[#FEF3C7] rounded-xl hover:bg-[#FDE68A] transition-colors">
              ${icon('plus', 22, 'text-[#755B00]')}
              <span class="text-xs font-semibold text-[#755B00]">Nuevo Evento</span>
            </a>
            <a href="/events" onclick="event.preventDefault(); window.history.pushState({},'','/events'); window.dispatchEvent(new PopStateEvent('popstate'))" class="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
              ${icon('calendar', 22, 'text-[#3B82F6]')}
              <span class="text-xs font-semibold text-blue-700">Mis Eventos</span>
            </a>
            <a href="/providers" onclick="event.preventDefault(); window.history.pushState({},'','/providers'); window.dispatchEvent(new PopStateEvent('popstate'))" class="flex flex-col items-center gap-2 p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors">
              ${icon('store', 22, 'text-[#059669]')}
              <span class="text-xs font-semibold text-emerald-700">Proveedores</span>
            </a>
            <a href="/my-templates" onclick="event.preventDefault(); window.history.pushState({},'','/my-templates'); window.dispatchEvent(new PopStateEvent('popstate'))" class="flex flex-col items-center gap-2 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
              ${icon('file', 22, 'text-[#7C3AED]')}
              <span class="text-xs font-semibold text-purple-700">Plantillas</span>
            </a>
          </div>
        </div>

      </div>
    `;
  } catch (err) {
    console.error("Error loading dashboard:", err);
    main.innerHTML = `
      <div class="flex flex-col items-center justify-center py-16 text-center">
        <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
          ${icon('alert-circle', 28, 'text-[#DC2626]')}
        </div>
        <h2 class="text-lg font-bold text-[#1E1B15] mb-2">Error al cargar el Dashboard</h2>
        <p class="text-sm text-[#9E8E6E] mb-4">${err.message || "No se pudieron cargar los datos."}</p>
        <button onclick="window.initDashboard()" class="px-5 py-2.5 bg-[#755B00] text-white rounded-xl text-sm font-semibold hover:bg-[#5F4A00] transition shadow-sm">Reintentar</button>
      </div>
    `;
  }
}
