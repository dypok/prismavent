import { formatDate, formatCurrency, getStatusColor } from '../utils/formatters.js';

export function createEventCard(event, onClick) {
    const progress = event.guest_count > 0 
        ? Math.round((event.confirmed_guests_count || 0) / Math.max(event.guest_count || 1, 1) * 100) 
        : 0;

    const card = document.createElement('div');
    card.className = "bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100";

    card.innerHTML = `
        <div class="h-48 bg-gradient-to-br from-amber-100 to-amber-200 relative">
        <div class="w-full h-full flex items-center justify-center text-7xl opacity-30">🎉</div>
        
        <div class="absolute top-4 right-4 px-4 py-1.5 rounded-full text-xs font-medium text-white ${getStatusColor(event.status)}">
            ${event.status || 'Borrador'}
        </div>
        </div>

        <div class="p-6">
        <h3 class="font-semibold text-xl text-gray-900 line-clamp-2 mb-3">${event.name}</h3>
        
        <div class="space-y-2 text-sm text-gray-600 mb-5">
            <div class="flex items-center gap-2">
            📅 <span>${formatDate(event.event_date)}</span>
            </div>
            ${event.location ? `
            <div class="flex items-center gap-2">
            📍 <span class="line-clamp-1">${event.location}</span>
            </div>` : ''}
        </div>

        <div class="flex justify-between items-center mb-5 text-sm">
            <div>
            <span class="font-semibold text-gray-900">${event.guest_count || 0}</span>
            <span class="text-gray-500"> invitados</span>
            </div>
            ${event.total_estimated ? `
            <div>
            <span class="font-semibold text-amber-600">${formatCurrency(event.total_estimated)}</span>
            </div>` : ''}
        </div>

        <div>
            <div class="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>Progreso</span>
            <span>${progress}%</span>
            </div>
            <div class="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all" 
                style="width: ${progress}%"></div>
            </div>
        </div>
        </div>
    `;

    card.addEventListener('click', () => onClick(event));
    return card;
}