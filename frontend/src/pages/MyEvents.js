import api from '../service/api.js';
import { Sidebar } from '../components/Sidebar.js';

function esc(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]);
}

function formatDate(dateStr) {
  if (!dateStr) return 'Sin fecha';
  return new Date(dateStr).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default class MyEvents {
    constructor() {
        this.container = null;
    }

    async init() {
        this.container = document.querySelector("#app");
        if (!this.container) return;
        await this.render();
    }

    async render() {
        this.container.innerHTML = `
            <div class="flex h-screen bg-[#FFF8F1]">
                ${Sidebar()}

                <div class="flex-1 flex flex-col overflow-hidden">
                    <div class="bg-white border-b border-[#E9E1D7] px-8 py-4 flex items-center justify-between">
                        <div>
                            <h1 class="text-2xl font-bold text-[#1E1B15]">Mis Eventos</h1>
                            <p class="text-[#9E8E6E] text-sm mt-0.5">Gestiona y coordina tus próximos eventos</p>
                        </div>
                    </div>

                    <div class="px-8 py-4 bg-white border-b border-[#E9E1D7]">
                        <div class="grid grid-cols-4 gap-3" id="stats-grid">${this.renderStatsSkeleton()}</div>
                    </div>

                    <main class="flex-1 p-6 overflow-auto">
                        <div id="events-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            ${this.renderGridSkeleton()}
                        </div>
                    </main>
                </div>
            </div>
        `;

        this.loadEvents();

        window.addEventListener('events-updated', () => this.loadEvents());
    }

    renderStatsSkeleton() {
        return Array(4).fill(0).map(() => `
            <div class="bg-white p-4 rounded-2xl border border-[#E9E1D7] animate-pulse">
                <div class="flex items-center gap-3">
                    <div class="w-9 h-9 bg-[#E9E1D7] rounded-xl"></div>
                    <div class="flex-1">
                        <div class="h-3 bg-[#E9E1D7] rounded w-3/4 mb-2"></div>
                        <div class="h-6 bg-[#E9E1D7] rounded w-1/3"></div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderGridSkeleton() {
        return Array(6).fill(0).map(() => `
            <div class="bg-white rounded-3xl overflow-hidden border border-[#E9E1D7] animate-pulse">
                <div class="h-32 bg-[#F5EDE0]"></div>
                <div class="p-4 space-y-3">
                    <div class="h-5 bg-[#E9E1D7] rounded w-3/4"></div>
                    <div class="h-3 bg-[#E9E1D7] rounded w-full"></div>
                    <div class="h-3 bg-[#E9E1D7] rounded w-1/2"></div>
                    <div class="flex gap-2 pt-2">
                        <div class="h-8 bg-[#E9E1D7] rounded-xl flex-1"></div>
                        <div class="h-8 bg-[#E9E1D7] rounded-xl flex-1"></div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async loadEvents() {
        const grid = document.getElementById('events-grid');
        const statsGrid = document.getElementById('stats-grid');

        try {
            const events = await api.getEvents();
            const total = events.length;
            const confirmados = events.filter(e => e.status === 'confirmado').length;
            const borradores = events.filter(e => e.status === 'borrador' || !e.status).length;
            const finalizados = events.filter(e => e.status === 'finalizado').length;
            const enProceso = total - finalizados;

            statsGrid.innerHTML = `
                <div class="bg-white p-4 rounded-2xl border border-[#E9E1D7]">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-lg">📅</div>
                        <div>
                            <p class="text-[10px] uppercase tracking-widest text-[#9E8E6E]">TOTAL EVENTOS</p>
                            <p class="text-2xl font-bold">${total}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white p-4 rounded-2xl border border-[#E9E1D7]">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center text-lg">✅</div>
                        <div>
                            <p class="text-[10px] uppercase tracking-widest text-[#9E8E6E]">CONFIRMADOS</p>
                            <p class="text-2xl font-bold">${confirmados}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white p-4 rounded-2xl border border-[#E9E1D7]">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center text-lg">⏳</div>
                        <div>
                            <p class="text-[10px] uppercase tracking-widest text-[#9E8E6E]">EN PROCESO</p>
                            <p class="text-2xl font-bold">${enProceso}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white p-4 rounded-2xl border border-[#E9E1D7]">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 bg-yellow-100 rounded-xl flex items-center justify-center text-lg">📝</div>
                        <div>
                            <p class="text-[10px] uppercase tracking-widest text-[#9E8E6E]">BORRADORES</p>
                            <p class="text-2xl font-bold">${borradores}</p>
                        </div>
                    </div>
                </div>
            `;

            let html = `
                <div onclick="window.location.href='/events/new'" 
                     class="bg-white border-2 border-dashed border-[#E9E1D7] rounded-3xl h-full min-h-[280px] flex flex-col items-center justify-center hover:border-[#755B00] hover:bg-[#FEF3C7]/30 transition-all cursor-pointer group">
                    <div class="w-14 h-14 bg-[#FEF3C7] rounded-full flex items-center justify-center text-3xl mb-3 group-hover:scale-110 transition-transform">
                        +
                    </div>
                    <p class="font-semibold text-[#755B00] text-base">Crear nuevo evento</p>
                    <p class="text-xs text-[#9E8E6E] mt-1 text-center">Comienza a planificar<br>tu próximo gran momento hoy</p>
                </div>
            `;

            events.forEach(event => {
                const formattedDate = formatDate(event.event_date);
                const statusClass = event.status === 'borrador'
                    ? 'bg-yellow-100 text-yellow-700'
                    : event.status === 'finalizado'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700';

                const statusText = event.status === 'borrador'
                    ? 'Borrador'
                    : event.status === 'finalizado'
                        ? 'Finalizado'
                        : 'Confirmado';

                const budgetDisplay = event.max_budget
                    ? `💰 $${parseFloat(event.max_budget).toLocaleString()}`
                    : '';

                html += `
                <div data-event-id="${esc(event.id)}" class="bg-white rounded-3xl overflow-hidden border border-[#E9E1D7] hover:shadow-xl transition-all card-view">
                    <div class="h-32 bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] flex items-center justify-center text-4xl relative">
                        <span class="absolute top-3 right-3 px-3 py-0.5 text-[10px] font-medium rounded-full ${statusClass} card-status">${statusText}</span>
                    </div>
                    <div class="p-4 card-body">
                        <h3 class="font-semibold text-base text-[#1E1B15] mb-0.5 line-clamp-1 card-name">${esc(event.name)}</h3>
                        <p class="text-[#9E8E6E] text-xs line-clamp-2 mb-3 card-desc">${esc(event.description || 'Sin descripción')}</p>

                        <div class="space-y-1 text-xs mb-4 card-meta">
                            <div class="card-date">📅 ${formattedDate}</div>
                            <div class="card-location">📍 ${esc(event.location || 'Sin ubicación')}</div>
                            <div class="card-guests">👥 ${event.guest_count} invitados</div>
                            ${budgetDisplay ? `<div class="card-budget">${budgetDisplay}</div>` : ''}
                        </div>

                        <div class="flex gap-2 card-actions">
                            <button onclick="viewEvent('${esc(event.id)}')" 
                                    class="flex-1 py-2 text-xs font-medium border border-[#E9E1D7] hover:bg-[#FEF3C7] rounded-xl transition">
                                Ver Detalles
                            </button>
                            ${event.status === 'finalizado'
                                ? `<button disabled class="flex-1 py-2 text-xs font-medium bg-gray-200 text-gray-400 rounded-xl cursor-not-allowed">Finalizado</button>`
                                : `<button onclick="editEvent('${esc(event.id)}')" 
                                    class="flex-1 py-2 text-xs font-medium bg-[#755B00] text-white hover:bg-[#5C4600] rounded-xl transition">
                                Editar
                            </button>`
                            }
                        </div>
                    </div>
                </div>`;
            });

            grid.innerHTML = html;

        } catch (error) {
            console.error(error);
            grid.innerHTML = `<p class="col-span-full text-red-600 text-center py-12">Error al cargar los eventos</p>`;
        }
    }
}

window.viewEvent = (id) => {
    window.location.href = `/events/detail?id=${id}`;
};

window.editEvent = function (id) {
    const card = document.querySelector(`[data-event-id="${CSS.escape(id)}"]`);
    if (!card) return;

    const editing = document.querySelector('.card-editing');
    if (editing) window.cancelEdit(editing.dataset.eventId);

    const body = card.querySelector('.card-body');
    const name = card.querySelector('.card-name')?.textContent || '';
    const desc = card.querySelector('.card-desc')?.textContent || '';
    const dateRaw = card.querySelector('.card-date')?.textContent?.replace('📅 ', '') || '';
    const locationRaw = card.querySelector('.card-location')?.textContent?.replace('📍 ', '') || '';
    const guestsRaw = card.querySelector('.card-guests')?.textContent?.replace(/👥\s*/, '').replace(' invitados', '') || '0';
    const budgetRaw = card.querySelector('.card-budget')?.textContent?.replace(/💰\s*\$?/, '').replace(/,/g, '') || '';
    const statusRaw = card.querySelector('.card-status')?.textContent || 'borrador';

    const budget = budgetRaw && !isNaN(parseFloat(budgetRaw)) ? parseFloat(budgetRaw) : '';

    card.dataset.origName = name;
    card.dataset.origDesc = desc;
    card.dataset.origDate = dateRaw;
    card.dataset.origLocation = locationRaw;
    card.dataset.origGuests = guestsRaw;
    card.dataset.origBudget = budget;

    card.classList.add('card-editing');
    card.style.transform = 'scale(1.02)';
    card.style.boxShadow = '0 20px 60px -15px rgba(117, 91, 0, 0.15)';
    card.style.borderColor = '#C9A84C';

    body.innerHTML = `
        <div class="space-y-3">
            <input type="text" id="edit-name-${id}" value="${esc(name)}"
                class="w-full px-3 py-2 border border-[#D0C5B2] rounded-xl focus:border-[#755B00] focus:outline-none text-sm"
                placeholder="Nombre del evento">
            <input type="date" id="edit-date-${id}" value="${esc(dateRaw)}"
                class="w-full px-3 py-2 border border-[#D0C5B2] rounded-xl focus:border-[#755B00] focus:outline-none text-sm">
            <input type="text" id="edit-location-${id}" value="${esc(locationRaw)}"
                class="w-full px-3 py-2 border border-[#D0C5B2] rounded-xl focus:border-[#755B00] focus:outline-none text-sm"
                placeholder="Ubicación">
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="text-[10px] font-semibold tracking-widest text-[#4D4637]">INVITADOS</label>
                    <input type="number" id="edit-guests-${id}" min="0" value="${esc(guestsRaw)}"
                        class="w-full px-3 py-2 border border-[#D0C5B2] rounded-xl focus:border-[#755B00] focus:outline-none text-sm mt-1">
                </div>
                <div>
                    <label class="text-[10px] font-semibold tracking-widest text-[#4D4637]">PRESUPUESTO</label>
                    <input type="number" id="edit-budget-${id}" min="0" value="${esc(budget)}"
                        class="w-full px-3 py-2 border border-[#D0C5B2] rounded-xl focus:border-[#755B00] focus:outline-none text-sm mt-1">
                </div>
            </div>
            <textarea id="edit-desc-${id}" rows="2"
                class="w-full px-3 py-2 border border-[#D0C5B2] rounded-xl focus:border-[#755B00] focus:outline-none text-sm resize-none"
                placeholder="Descripción">${esc(desc)}</textarea>
            <div class="flex gap-2 pt-1">
                <button onclick="cancelEdit('${esc(id)}')"
                    class="flex-1 py-2 text-xs font-medium border-2 border-[#D0C5B2] text-[#4D4637] hover:bg-[#F8F5F0] rounded-xl transition">Cancelar</button>
                <button onclick="saveEdit('${esc(id)}')"
                    class="flex-1 py-2 text-xs font-medium bg-[#755B00] text-white hover:bg-[#5C4600] rounded-xl transition shadow-sm">Guardar</button>
            </div>
            <p id="edit-error-${id}" class="hidden text-xs text-red-600 text-center"></p>
        </div>
    `;
};

window.cancelEdit = function (id) {
    const card = document.querySelector(`[data-event-id="${CSS.escape(id)}"]`);
    if (!card) return;

    card.classList.remove('card-editing');
    card.style.transform = '';
    card.style.boxShadow = '';
    card.style.borderColor = '';

    const body = card.querySelector('.card-body');
    const name = card.dataset.origName || '';
    const desc = card.dataset.origDesc || '';
    const guestsRaw = card.dataset.origGuests || '0';
    const budgetRaw = card.dataset.origBudget || '';
    const dateRaw = card.dataset.origDate || '';
    const locationRaw = card.dataset.origLocation || '';

    const budgetDisplay = budgetRaw ? `💰 $${parseFloat(budgetRaw).toLocaleString()}` : '';
    const formattedDate = dateRaw ? formatDate(dateRaw) : 'Sin fecha';
    const locationDisplay = locationRaw || 'Sin ubicación';

    body.innerHTML = `
        <h3 class="font-semibold text-base text-[#1E1B15] mb-0.5 line-clamp-1 card-name">${esc(name)}</h3>
        <p class="text-[#9E8E6E] text-xs line-clamp-2 mb-3 card-desc">${esc(desc || 'Sin descripción')}</p>
        <div class="space-y-1 text-xs mb-4 card-meta">
            <div class="card-date">📅 ${formattedDate}</div>
            <div class="card-location">📍 ${esc(locationDisplay)}</div>
            <div class="card-guests">👥 ${guestsRaw} invitados</div>
            ${budgetDisplay ? `<div class="card-budget">${budgetDisplay}</div>` : ''}
        </div>
        <div class="flex gap-2 card-actions">
            <button onclick="viewEvent('${esc(id)}')" class="flex-1 py-2 text-xs font-medium border border-[#E9E1D7] hover:bg-[#FEF3C7] rounded-xl transition">Ver Detalles</button>
            <button onclick="editEvent('${esc(id)}')" class="flex-1 py-2 text-xs font-medium bg-[#755B00] text-white hover:bg-[#5C4600] rounded-xl transition">Editar</button>
        </div>
    `;
};

window.saveEdit = async function (id) {
    const card = document.querySelector(`[data-event-id="${CSS.escape(id)}"]`);
    if (!card) return;

    const errorEl = document.getElementById(`edit-error-${id}`);
    const saveBtn = card.querySelector('.card-body button:last-of-type');

    const name = document.getElementById(`edit-name-${id}`)?.value.trim();
    const eventDate = document.getElementById(`edit-date-${id}`)?.value || null;
    const location = document.getElementById(`edit-location-${id}`)?.value.trim() || null;
    const guestCount = parseInt(document.getElementById(`edit-guests-${id}`)?.value, 10) || null;
    const maxBudget = parseFloat(document.getElementById(`edit-budget-${id}`)?.value) || null;
    const description = document.getElementById(`edit-desc-${id}`)?.value.trim() || null;

    if (!name) {
        if (errorEl) { errorEl.textContent = 'El nombre es obligatorio.'; errorEl.classList.remove('hidden'); }
        return;
    }

    if (errorEl) errorEl.classList.add('hidden');
    if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Guardando...'; }

    const payload = { name };
    if (eventDate) payload.event_date = eventDate;
    if (location) payload.location = location;
    if (guestCount !== null) payload.guest_count = guestCount;
    if (maxBudget !== null) payload.max_budget = maxBudget;
    if (description) payload.description = description;

    try {
        await api.updateEvent(id, payload);

        const formattedDate = eventDate ? formatDate(eventDate) : card.dataset.origDate || 'Sin fecha';
        const locationDisplay = location || 'Sin ubicación';
        const budgetDisplay = maxBudget ? `💰 $${maxBudget.toLocaleString()}` : '';

        card.style.transform = '';
        card.style.boxShadow = '';
        card.style.borderColor = '';
        card.classList.remove('card-editing');

        const body = card.querySelector('.card-body');
        body.innerHTML = `
            <h3 class="font-semibold text-base text-[#1E1B15] mb-0.5 line-clamp-1 card-name">${esc(name)}</h3>
            <p class="text-[#9E8E6E] text-xs line-clamp-2 mb-3 card-desc">${esc(description || 'Sin descripción')}</p>
            <div class="space-y-1 text-xs mb-4 card-meta">
                <div class="card-date">📅 ${formattedDate}</div>
                <div class="card-location">📍 ${esc(locationDisplay)}</div>
                <div class="card-guests">👥 ${guestCount || 0} invitados</div>
                ${budgetDisplay ? `<div class="card-budget">${budgetDisplay}</div>` : ''}
            </div>
            <div class="flex gap-2 card-actions">
                <button onclick="viewEvent('${esc(id)}')" class="flex-1 py-2 text-xs font-medium border border-[#E9E1D7] hover:bg-[#FEF3C7] rounded-xl transition">Ver Detalles</button>
                <button onclick="editEvent('${esc(id)}')" class="flex-1 py-2 text-xs font-medium bg-[#755B00] text-white hover:bg-[#5C4600] rounded-xl transition">Editar</button>
            </div>
        `;

        window.dispatchEvent(new CustomEvent('events-updated'));
    } catch (err) {
        if (errorEl) {
            errorEl.textContent = err.message || 'No se pudo actualizar.';
            errorEl.classList.remove('hidden');
        }
        if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Guardar'; }
    }
};
