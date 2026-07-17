import { getUserTemplates, deleteUserTemplate } from "../service/api.js";
import { Sidebar } from "../components/Sidebar.js";
import { Topbar } from "../components/Topbar.js";
import { showToast } from "../components/Toast.js";

export class MyTemplates {
    constructor() {
        this.container = null;
        this.templates = [];
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
                    <main class="flex-1 p-8 overflow-auto">
                        <div class="max-w-4xl mx-auto">
                            <div class="bg-white rounded-2xl border border-[#E9E1D7] shadow-sm overflow-hidden">
                                <div class="px-6 py-4 border-b border-[#E9E1D7] bg-[#FEF3C7]/30 flex justify-between items-center">
                                    <h2 class="text-lg font-semibold text-[#1E1B15]">Mis Plantillas Guardadas</h2>
                                    <button onclick="window.history.back()" class="text-sm font-medium text-[#755B00] hover:underline">Volver</button>
                                </div>
                                <div id="my-templates-list" class="divide-y divide-[#E9E1D7]">
                                    <div class="p-8 text-center text-[#9E8E6E]">Cargando plantillas...</div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            <!-- Confirm Delete Modal -->
            <div id="delete-template-modal" class="hidden fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                <div class="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl transform scale-95 opacity-0 transition-all duration-300">
                    <div class="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                        <svg class="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
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
    }

    async loadData() {
        try {
            this.templates = await getUserTemplates();
            this.renderList();
        } catch (error) {
            document.getElementById("my-templates-list").innerHTML = `
                <div class="p-8 text-center text-red-500">Error al cargar las plantillas.</div>
            `;
        }
    }

    renderList() {
        const listEl = document.getElementById("my-templates-list");
        if (this.templates.length === 0) {
            listEl.innerHTML = `
                <div class="p-12 text-center flex flex-col items-center">
                    <div class="w-16 h-16 bg-[#FEF3C7] rounded-full flex items-center justify-center text-2xl mb-4">📄</div>
                    <h3 class="text-lg font-semibold text-[#1E1B15] mb-1">Aún no tienes plantillas propias</h3>
                    <p class="text-sm text-[#9E8E6E] max-w-sm">Guarda cualquier evento existente como plantilla para reutilizarlo en el futuro.</p>
                </div>
            `;
            return;
        }

        listEl.innerHTML = this.templates.map(t => `
            <div class="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div>
                    <h3 class="font-semibold text-[#1E1B15]">${t.name}</h3>
                    <div class="flex items-center gap-2 mt-1">
                        <span class="px-2 py-0.5 bg-[#E0F2FE] text-[#0369A1] rounded text-xs font-medium border border-[#BAE6FD]">Plantilla Propia</span>
                        <span class="text-xs text-[#9E8E6E]">${t.description || "Sin descripción"}</span>
                    </div>
                </div>
                <button onclick="window.openDeleteTemplateModal('${t.id}')" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar plantilla">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
            </div>
        `).join("");
    }
}