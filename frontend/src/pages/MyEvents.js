import api from '../service/api.js';
import { Sidebar } from '../components/Sidebar.js';
import { EditEventModal } from '../components/EditEventModal.js';

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

            // Estadísticas
            const total = events.length;
            const borradores = events.filter(e => e.status === 'borrador' || !e.status).length;
            const activos = total - borradores;

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
                            <p class="text-2xl font-bold">0</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white p-4 rounded-2xl border border-[#E9E1D7]">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center text-lg">⏳</div>
                        <div>
                            <p class="text-[10px] uppercase tracking-widest text-[#9E8E6E]">EN PROCESO</p>
                            <p class="text-2xl font-bold">${activos}</p>
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
                const date = new Date(event.event_date);
                const formattedDate = date.toLocaleDateString('es-ES', { 
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
                });

                const isFinalized = event.status === 'finalizado';

                const statusClass = event.status === 'borrador'
                    ? 'bg-yellow-100 text-yellow-700'
                    : isFinalized
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-emerald-100 text-emerald-700';

                const statusText = event.status === 'borrador'
                    ? 'Borrador'
                    : isFinalized
                        ? 'Finalizado'
                        : 'Activo';

                html += `
                <div class="bg-white rounded-3xl overflow-hidden border border-[#E9E1D7] hover:shadow-xl transition-all">
                    <div class="h-32 bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] flex items-center justify-center text-4xl relative">
                        
                        <span class="absolute top-3 right-3 px-3 py-0.5 text-[10px] font-medium rounded-full ${statusClass}">${statusText}</span>
                    </div>
                    <div class="p-4">
                        <h3 class="font-semibold text-base text-[#1E1B15] mb-0.5 line-clamp-1">${event.name}</h3>
                        <p class="text-[#9E8E6E] text-xs line-clamp-2 mb-3">${event.description || 'Sin descripción'}</p>
                        
                        <div class="space-y-1 text-xs mb-4">
                            <div>📅 ${formattedDate}</div>
                            <div>📍 ${event.location || 'Sin ubicación'}</div>
                            <div>👥 ${event.guest_count} invitados</div>
                            ${event.max_budget ? `<div>💰 Presupuesto: $${parseFloat(event.max_budget).toLocaleString()}</div>` : ''}
                        </div>

                        <div class="flex gap-2">
                            <button onclick="viewEvent('${event.id}')" 
                                    class="flex-1 py-2 text-xs font-medium border border-[#E9E1D7] hover:bg-[#FEF3C7] rounded-xl transition">
                                Ver Detalles
                            </button>
                            ${isFinalized
                                ? `<button disabled class="flex-1 py-2 text-xs font-medium bg-gray-200 text-gray-400 rounded-xl cursor-not-allowed">Finalizado</button>`
                                : `<button onclick="editEvent('${event.id}')" 
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

window.editEvent = (id) => {
    EditEventModal(id);
};