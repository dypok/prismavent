import { icon } from './Icons.js';

export function GuestsPanel(event, isFinalized = false) {
  const guests = event?.guests || [];
  const displayed = guests.slice(0, 5);
  const hasMore = guests.length > 5;
  const disabled = isFinalized ? 'opacity-50 pointer-events-none cursor-not-allowed' : '';

  return `
    <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div class="flex justify-between items-center mb-5">
        <h2 class="text-lg font-bold text-[#1E1B15]">
          Invitados
        </h2>
        <div class="flex items-center gap-2">
          <button
            id="btn-add-guest"
            class="px-4 py-2 rounded-xl bg-[#755B00] text-white text-sm hover:bg-[#5F4A00] flex items-center gap-1.5 ${disabled}"
            ${isFinalized ? 'disabled' : ''}
          >
            ${icon('user-plus', 14)}
            Agregar
          </button>
          ${hasMore ? `
            <button
              id="btn-view-all-guests"
              class="px-4 py-2 rounded-xl border border-[#E9E1D7] text-[#4D4637] text-sm hover:bg-[#F8F5F0] transition"
              data-event-id="${event?.id}"
            >
              Ver todos (${guests.length})
            </button>
          ` : ''}
        </div>
      </div>

      <div class="text-sm text-gray-500 mb-4">
        ${guests.length} invitados registrados
      </div>

      ${guests.length === 0 ? `
        <p class="text-sm text-gray-400 text-center py-4">No hay invitados aún</p>
      ` : `
        <div class="space-y-3 max-h-64 overflow-y-auto">
          ${displayed.map(guest => `
            <div class="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div class="flex items-center gap-3 min-w-0 flex-1">
                <div class="w-8 h-8 rounded-full bg-[#FEF3C7] flex items-center justify-center text-sm font-medium text-[#755B00] flex-shrink-0">
                  ${guest.full_name?.charAt(0).toUpperCase() || "?"}
                </div>
                <div class="min-w-0">
                  <p class="font-medium text-[#1E1B15] truncate">${escapeHtml(guest.full_name)}</p>
                  <p class="text-xs text-[#9E8E6E] truncate">${escapeHtml(guest.notes || "Sin notas")}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${guest.confirmed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}">
                  ${guest.confirmed ? icon('check-circle', 14, 'text-green-700') : icon('clock', 14, 'text-amber-700')}
                </span>
                <button
                  class="edit-guest text-[#755B00] font-medium hover:underline text-sm ${disabled}"
                  data-id="${guest.id}"
                  data-name="${escapeHtml(guest.full_name)}"
                  data-notes="${escapeHtml(guest.notes || "")}"
                  data-confirmed="${guest.confirmed}"
                  ${isFinalized ? 'disabled' : ''}
                >
                  Editar
                </button>
                <button
                  class="delete-guest ml-2 text-red-600 font-medium hover:underline text-sm ${disabled}"
                  data-id="${guest.id}"
                  ${isFinalized ? 'disabled' : ''}
                >
                  Eliminar
                </button>
              </div>
            </div>
          `).join("")}
        </div>
      `}
    </div>
  `;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, String.fromCharCode(39) + '#39;');
}