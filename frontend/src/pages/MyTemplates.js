import { getUserTemplates, deleteUserTemplate } from "../service/api.js";
import { Sidebar } from "../components/Sidebar.js";
import { Topbar } from "../components/Topbar.js";
import { showToast } from "../components/Toast.js";
import { icon } from "../components/Icons.js";

export class MyTemplates {
    constructor() {
        this.container = null;
        this.templates = [];
        this._filteredTemplates = [];
    }

    async init() {
        this.container = document.querySelector("#app");
        if (!this.container) return;
        await this.render();
        await this.loadData();
    }

    async render() {
        this.container.innerHTML = `
            <div class="flex h-screen bg-[#FFF8F1]">
                ${Sidebar()}
                <div class="flex-1 flex flex-col overflow-hidden">
                    ${Topbar(`
                        <h1 class="text-2xl font-bold text-[#1E1B15]">Gestión de Plantillas</h1>
                        <p class="text-[#9E8E6E] text-sm mt-0.5">Administra tus plantillas personalizadas</p>
                    `)}
                    <main class="flex-1 p-4 lg:p-8 overflow-auto">
                        <div class="max-w-4xl mx-auto">
                            <div class="bg-white rounded-2xl border border-[#E9E1D7] shadow-sm overflow-hidden">
                                <div class="px-6 py-4 border-b border-[#E9E1D7] bg-[#FEF3C7]/30 flex justify-between items-center">
                                    <h2 class="text-lg font-semibold text-[#1E1B15]">Mis Plantillas Guardadas</h2>
                                    <button onclick="window.history.back()" class="text-sm font-medium text-[#755B00] hover:underline">Volver</button>
                                </div>
                                <div class="flex flex-col md:flex-row gap-3 p-4 lg:p-6 border-b border-[#E9E1D7]">
                                    <div class="relative w-full md:max-w-md">
                                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E8E6E]">${icon('search', 16)}</span>
                                        <input type="text" id="template-search" placeholder="Buscar plantillas..." class="w-full pl-9 pr-4 py-2 bg-[#F8F4EF] border border-[#E9E1D7] rounded-lg text-sm text-[#1E1B15] placeholder-[#9E8E6E] focus:outline-none focus:ring-2 focus:ring-[#D4A853] focus:border-transparent">
                                    </div>
                                </div>
                                <div id="my-templates-list" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 lg:p-6">
                                    <div class="col-span-full text-center text-[#9E8E6E] py-8">Cargando plantillas...</div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            <!-- Confirm Delete Modal -->
            <div id="delete-template-modal" class="hidden fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                <div class="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 shadow-xl transform scale-95 opacity-0 transition-all duration-300">
                    <div class="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                        ${icon('trash', 24, 'text-red-600')}
                    </div>
                    <h3 class="text-lg font-bold text-gray-900 mb-2">¿Eliminar plantilla?</h3>
                    <p class="text-sm text-gray-500 mb-6">Esta acción no se puede deshacer. Los eventos creados a partir de esta plantilla no se verán afectados.</p>
                    <div class="flex gap-3">
                        <button onclick="window.closeDeleteTemplateModal()" class="flex-1 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                            Cancelar
                        </button>
                        <button id="btn-confirm-delete-template" class="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors">
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `;

        window.openDeleteTemplateModal = (id) => {
            window.__templateToDelete = id;
            const modal = document.getElementById("delete-template-modal");
            modal.classList.remove("hidden");
            setTimeout(() => {
                const dialog = modal.querySelector("div");
                dialog.classList.remove("scale-95", "opacity-0");
                dialog.classList.add("scale-100", "opacity-100");
            }, 10);
        };

        window.closeDeleteTemplateModal = () => {
            const modal = document.getElementById("delete-template-modal");
            const dialog = modal.querySelector("div");
            dialog.classList.remove("scale-100", "opacity-100");
            dialog.classList.add("scale-95", "opacity-0");
            setTimeout(() => {
                modal.classList.add("hidden");
                window.__templateToDelete = null;
            }, 300);
        };

        document.getElementById("btn-confirm-delete-template").addEventListener("click", async () => {
            const id = window.__templateToDelete;
            if (!id) return;
            try {
                const btn = document.getElementById("btn-confirm-delete-template");
                btn.disabled = true;
                btn.textContent = "Eliminando...";

                await deleteUserTemplate(id);
                showToast("Plantilla eliminada exitosamente", "success");

                this.templates = this.templates.filter(t => t.id !== id);
                this._filteredTemplates = this._filteredTemplates.filter(t => t.id !== id);
                this.renderList();
                window.closeDeleteTemplateModal();
            } catch (err) {
                showToast("Error al eliminar la plantilla", "error");
            } finally {
                const btn = document.getElementById("btn-confirm-delete-template");
                if(btn) {
                    btn.disabled = false;
                    btn.textContent = "Eliminar";
                }
            }
        });

        document.getElementById("template-search").addEventListener("input", (e) => {
            this._filter(e.target.value);
        });
    }

    _filter(query) {
        if (query) {
            const q = query.toLowerCase();
            this._filteredTemplates = this.templates.filter(t =>
                t.name.toLowerCase().includes(q) ||
                (t.description && t.description.toLowerCase().includes(q))
            );
        } else {
            this._filteredTemplates = [...this.templates];
        }
        this.renderList();
    }

    async loadData() {
        try {
            this.templates = await getUserTemplates();
            this._filteredTemplates = [...this.templates];
            this.renderList();
        } catch (error) {
            document.getElementById("my-templates-list").innerHTML = `
                <div class="col-span-full p-8 text-center text-red-500">Error al cargar las plantillas.</div>
            `;
        }
    }

    renderList() {
        const listEl = document.getElementById("my-templates-list");
        const items = this._filteredTemplates;
        if (items.length === 0) {
            listEl.innerHTML = `
                <div class="col-span-full p-12 text-center flex flex-col items-center">
                    <div class="w-16 h-16 bg-[#FEF3C7] rounded-full flex items-center justify-center text-2xl mb-4">📄</div>
                    <h3 class="text-lg font-semibold text-[#1E1B15] mb-1">${this.templates.length > 0 ? 'Sin resultados' : 'Aún no tienes plantillas propias'}</h3>
                    <p class="text-sm text-[#9E8E6E] max-w-sm">${this.templates.length > 0 ? 'Ninguna plantilla coincide con tu búsqueda.' : 'Guarda cualquier evento existente como plantilla para reutilizarlo en el futuro.'}</p>
                </div>
            `;
            return;
        }

        listEl.innerHTML = items.map(t => `
            <div class="p-4 lg:p-6 bg-white border border-[#E9E1D7] rounded-xl hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                    <h3 class="font-semibold text-[#1E1B15]">${t.name}</h3>
                    <div class="flex items-center gap-2 mt-2">
                        <span class="px-2 py-0.5 bg-[#E0F2FE] text-[#0369A1] rounded text-xs font-medium border border-[#BAE6FD]">Plantilla Propia</span>
                    </div>
                    <p class="text-xs text-[#9E8E6E] mt-2 line-clamp-2">${t.description || "Sin descripción"}</p>
                </div>
                <button onclick="window.openDeleteTemplateModal('${t.id}')" class="self-end mt-3 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar plantilla">
                    ${icon('trash-2', 18)}
                </button>
            </div>
        `).join("");
    }
}
