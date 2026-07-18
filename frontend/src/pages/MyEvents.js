import api from '../service/api.js';
import { Sidebar } from '../components/Sidebar.js';
import { Topbar } from '../components/Topbar.js';
import { EditEventModal } from '../components/EditEventModal.js';
import { icon } from '../components/Icons.js';

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
                    ${Topbar(`
                        <h1 class="text-2xl font-bold text-[#1E1B15]">Mis Eventos</h1>
                        <p class="text-[#9E8E6E] text-sm mt-0.5">Gestiona y coordina tus próximos eventos</p>
                    `)}

                    <main class="flex-1 p-4 lg:p-8 overflow-y-auto">
                        <div class="mb-6">
                            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3" id="stats-grid">${this.renderStatsSkeleton()}</div>
                        </div>

                        <div class="flex flex-col md:flex-row gap-3 mb-6" id="search-filter-bar">
                            <input type="text" placeholder="Buscar eventos..."
                                   class="w-full md:max-w-md px-4 py-2.5 rounded-xl border border-[#E9E1D7] bg-white focus:outline-none focus:ring-2 focus:ring-[#755B00]/20 focus:border-[#755B00] text-sm" />
                            <select class="w-full md:w-auto px-4 py-2.5 rounded-xl border border-[#E9E1D7] bg-white text-sm text-[#1E1B15]">
                                <option value="">Todos los estados</option>
                                <option value="borrador">Borrador</option>
                                <option value="confirmado">Confirmado</option>
                                <option value="in_progress">En Progreso</option>
                                <option value="finalizado">Finalizado</option>
                            </select>
                            <select class="w-full md:w-auto px-4 py-2.5 rounded-xl border border-[#E9E1D7] bg-white text-sm text-[#1E1B15]">
                                <option value="date">Ordenar por fecha</option>
                                <option value="name">Ordenar por nombre</option>
                            </select>
                        </div>

                        <div id="events-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
                <div class="h-20 bg-[#F5EDE0]"></div>
                <div class="p-4 lg:p-6 space-y-3">
                    <div class="h-4 bg-[#E9E1D7] rounded w-3/4"></div>
                    <div class="h-2 bg-[#E9E1D7] rounded w-full"></div>
                    <div class="h-2 bg-[#E9E1D7] rounded w-1/2"></div>
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
        const searchBar = document.getElementById('search-filter-bar');

        try {
            const events = await api.getEvents();
            const activeEvents = events.filter(e => e.status !== 'done' && e.status !== 'finalizado');

            if (activeEvents.length === 0) {
                statsGrid.parentElement.classList.add('hidden');
                if (searchBar) searchBar.classList.add('hidden');
                grid.className = "flex-1 flex flex-col items-center justify-center min-h-[60vh]";
                grid.innerHTML = `
                    <div class="flex flex-col items-center justify-center w-full max-w-2xl py-12 animate-fade-in-up">
                        <div class="w-24 h-24 bg-[#FEF3C7] rounded-3xl flex items-center justify-center text-[#755B00] mb-6 shadow-sm transform hover:scale-105 transition-transform">
                            ${icon('calendar-plus', 48)}
                        </div>
                        <h2 class="font-display text-4xl text-[#1E1B15] mb-4 text-center">Planifica tu primer evento</h2>
                        <p class="text-[#4D4637] text-center max-w-md mb-8 leading-relaxed text-lg">
                            Aún no tienes ningún evento en tu agenda. Comienza ahora y dale vida a esa fecha especial.
                        </p>
                        <button onclick="window.location.href='/events/new'" class="px-8 py-4 bg-[#755B00] text-white font-semibold rounded-2xl hover:bg-[#5C4600] transition-colors shadow-sm flex items-center gap-3 text-lg">
                            ${icon('plus', 22)}
                            Crear mi primer evento
                        </button>
                    </div>
                `;
                return;
            }

            statsGrid.parentElement.classList.remove('hidden');
            if (searchBar) searchBar.classList.remove('hidden');
            grid.className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5";

            const total = activeEvents.length;
            const borradores = activeEvents.filter(e => e.status === 'borrador' || !e.status).length;
            const activos = total - borradores;

            statsGrid.innerHTML = `
                <div class="bg-white p-4 rounded-2xl border border-[#E9E1D7]">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                            ${icon('calendar', 18, 'text-[#2563EB]')}
                        </div>
                        <div>
                            <p class="text-[10px] uppercase tracking-widest text-[#9E8E6E]">TOTAL EVENTOS</p>
                            <p class="text-2xl font-bold">${total}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white p-4 rounded-2xl border border-[#E9E1D7]">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
                            ${icon('check-circle-2', 18, 'text-[#22C55E]')}
                        </div>
                        <div>
                            <p class="text-[10px] uppercase tracking-widest text-[#9E8E6E]">CONFIRMADOS</p>
                            <p class="text-2xl font-bold">0</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white p-4 rounded-2xl border border-[#E9E1D7]">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
                            ${icon('clock', 18, 'text-[#D97706]')}
                        </div>
                        <div>
                            <p class="text-[10px] uppercase tracking-widest text-[#9E8E6E]">EN PROCESO</p>
                            <p class="text-2xl font-bold">${activos}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white p-4 rounded-2xl border border-[#E9E1D7]">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 bg-yellow-100 rounded-xl flex items-center justify-center">
                            ${icon('file', 18, 'text-[#CA8A04]')}
                        </div>
                        <div>
                            <p class="text-[10px] uppercase tracking-widest text-[#9E8E6E]">BORRADORES</p>
                            <p class="text-2xl font-bold">${borradores}</p>
                        </div>
                    </div>
                </div>
            `;

            let html = `
                <div onclick="window.location.href='/events/new'" 
                     class="bg-white border-2 border-dashed border-[#E9E1D7] rounded-3xl h-full min-h-[200px] flex flex-col items-center justify-center hover:border-[#755B00] hover:bg-[#FEF3C7]/30 transition-all cursor-pointer group p-4 lg:p-6">
                    <div class="w-12 h-12 bg-[#FEF3C7] rounded-full flex items-center justify-center text-3xl mb-2 group-hover:scale-110 transition-transform">
                        +
                    </div>
                    <p class="font-semibold text-[#755B00] text-sm">Crear nuevo evento</p>
                    <p class="text-[11px] text-[#9E8E6E] mt-1 text-center">Comienza a planificar<br>tu próximo gran momento</p>
                </div>
            `;

            activeEvents.forEach(event => {
                const date = new Date(event.event_date);
                const formattedDate = date.toLocaleDateString('es-ES', { 
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
                });

                const isFinalized = event.status === 'finalizado' || event.status === 'done';

                const statusConfig = {
                    borrador: { cls: 'bg-yellow-100 text-yellow-700', text: 'Borrador', gradient: 'from-[#FEF3C7] to-[#FDE68A]' },
                    confirmado: { cls: 'bg-emerald-100 text-emerald-700', text: 'Confirmado', gradient: 'from-[#D1FAE5] to-[#A7F3D0]' },
                    in_progress: { cls: 'bg-blue-100 text-blue-700', text: 'En Progreso', gradient: 'from-[#DBEAFE] to-[#BFDBFE]' },
                    done: { cls: 'bg-gray-200 text-gray-600', text: 'Realizado', gradient: 'from-[#E5E7EB] to-[#D1D5DB]' },
                    finalizado: { cls: 'bg-gray-200 text-gray-600', text: 'Finalizado', gradient: 'from-[#E5E7EB] to-[#D1D5DB]' },
                };

                const cfg = statusConfig[event.status] || statusConfig.borrador;

                html += `
                <div onclick="viewEvent('${event.id}')" class="bg-white rounded-3xl overflow-hidden border border-[#E9E1D7] hover:shadow-xl transition-all flex flex-col cursor-pointer group hover:-translate-y-1">
                    <div class="h-20 bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-4xl relative">
                        
                        <span class="absolute top-3 right-3 px-3 py-0.5 text-[10px] font-medium rounded-full ${cfg.cls}">${cfg.text}</span>
                    </div>
                    <div class="p-4 lg:p-6 flex flex-col flex-1">
                        <h3 class="font-semibold text-base text-[#1E1B15] ${event.description ? 'mb-0.5' : 'mb-3'} line-clamp-1 group-hover:text-[#755B00] transition-colors">${event.name}</h3>
                        ${event.description ? `<p class="text-[#9E8E6E] text-xs line-clamp-2 mb-3">${event.description}</p>` : ''}
                        
                        <div class="space-y-1 text-[11px] mb-4 flex-1">
                            <div class="flex items-center gap-1.5">
                                ${icon('calendar', 13, 'text-[#9E8E6E]')}
                                ${formattedDate}
                            </div>
                            <div class="flex items-center gap-1.5">
                                ${icon('map-pin', 13, 'text-[#9E8E6E]')}
                                ${event.location || 'Sin ubicación'}
                            </div>
                            <div class="flex items-center gap-1.5">
                                ${icon('users', 13, 'text-[#9E8E6E]')}
                                ${event.guest_count} invitados
                            </div>
                            ${event.max_budget ? `<div class="flex items-center gap-1.5">
                                ${icon('dollar-sign', 13, 'text-[#9E8E6E]')}
                                Presupuesto: $${parseFloat(event.max_budget).toLocaleString()}
                            </div>` : ''}
                        </div>

                        <div class="flex gap-2 mt-auto">
                            <button onclick="event.stopPropagation(); viewEvent('${event.id}')" 
                                    class="flex-1 py-2 text-xs font-medium border border-[#E9E1D7] hover:bg-[#FEF3C7] rounded-xl transition">
                                Ver Detalles
                            </button>
                            ${isFinalized
                                ? `<button onclick="event.stopPropagation()" disabled class="flex-1 py-2 text-xs font-medium bg-gray-200 text-gray-400 rounded-xl cursor-not-allowed">Finalizado</button>`
                                : `<button onclick="event.stopPropagation(); editEvent('${event.id}')" 
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
