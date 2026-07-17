export function GuestsPanel(event) {
  const guests = event?.guests || [];
  const displayed = guests.slice(0, 5);
  const hasMore = guests.length > 5;

  return `
    <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div class="flex justify-between items-center mb-5">
        <h2 class="text-lg font-bold text-[#1E1B15]">
          Invitados
        </h2>
        <div class="flex items-center gap-2">
          <button
            id="btn-add-guest"
            class="px-4 py-2 rounded-xl bg-[#755B00] text-white text-sm hover:bg-[#5F4A00] flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
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
                  ${guest.confirmed ? '✅' : '⏳'}
                </span>
                <button
                  class="edit-guest text-[#755B00] font-medium hover:underline text-sm"
                  data-id="${guest.id}"
                  data-name="${escapeHtml(guest.full_name)}"
                  data-notes="${escapeHtml(guest.notes || "")}"
                  data-confirmed="${guest.confirmed}"
                >
                  Editar
                </button>
                <button
                  class="delete-guest ml-2 text-red-600 font-medium hover:underline text-sm"
                  data-id="${guest.id}"
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