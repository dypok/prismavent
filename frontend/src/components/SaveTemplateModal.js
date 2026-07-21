import api from "../service/api.js";
import { showToast } from "./Toast.js";
import { icon } from "./Icons.js";

let currentEventData = null;

export function initSaveTemplateModal() {
    const modalHtml = `
        <div id="save-template-modal" class="hidden fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden transform scale-95 opacity-0 transition-all duration-300">
                <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <h3 class="text-lg font-bold text-gray-900">Guardar como Plantilla</h3>
                    <button onclick="window.closeSaveTemplateModal()" class="text-gray-400 hover:text-gray-700 transition-colors">
                        ${icon('x', 20)}
                    </button>
                </div>
                
                <div class="p-4 lg:p-6">
                    <form id="save-template-form" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de la Plantilla <span class="text-red-500">*</span></label>
                            <input type="text" id="template-name" required
                                class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#755B00] focus:border-[#755B00] outline-none"
                                placeholder="Ej: Boda de Ensueño VIP">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                            <textarea id="template-desc" rows="3"
                                class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#755B00] focus:border-[#755B00] outline-none resize-none"
                                placeholder="Breve descripción de los elementos que incluye..."></textarea>
                        </div>

                        <div class="pt-2 flex flex-col sm:flex-row justify-end gap-3">
                            <button type="button" onclick="window.closeSaveTemplateModal()"
                                class="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                                Cancelar
                            </button>
                            <button type="submit" id="btn-submit-template"
                                class="px-5 py-2.5 bg-[#755B00] text-white text-sm font-semibold rounded-xl hover:bg-[#5A4700] transition-colors shadow-sm">
                                Guardar Plantilla
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    if (!document.getElementById("save-template-modal")) {
        document.body.insertAdjacentHTML("beforeend", modalHtml);
    }

    document.getElementById("save-template-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = document.getElementById("btn-submit-template");
        btn.disabled = true;
        btn.textContent = "Guardando...";

        try {
            const name = document.getElementById("template-name").value;
            const desc = document.getElementById("template-desc").value;
            
            // Map event items to template format
            const items = (currentEventData.event_items || []).map(i => ({
                name: i.name,
                category: i.category,
                quantity: i.quantity,
                unit_price: i.unit_price,
                estimated_price: i.estimated_price || i.unit_price,
                status: i.status || 'pending',
                notes: i.notes || ''
            }));

            await api.createUserTemplate({
                name,
                description: desc,
                event_type_id: currentEventData.event_type_id,
                source_template_id: currentEventData.template_id,
                items: items
            });

            showToast("Plantilla guardada exitosamente", "success");
            window.closeSaveTemplateModal();
        } catch (error) {
            console.error(error);
            showToast("Error al guardar la plantilla", "error");
        } finally {
            btn.disabled = false;
            btn.textContent = "Guardar Plantilla";
        }
    });
}

window.openSaveTemplateModal = function(eventData) {
    currentEventData = eventData;
    const modal = document.getElementById("save-template-modal");
    if (!modal) return;
    
    document.getElementById("template-name").value = eventData.name + " (Plantilla)";
    document.getElementById("template-desc").value = "";
    
    modal.classList.remove("hidden");
    // Trigger animation
    setTimeout(() => {
        const dialog = modal.querySelector("div");
        dialog.classList.remove("scale-95", "opacity-0");
        dialog.classList.add("scale-100", "opacity-100");
    }, 10);
};

window.closeSaveTemplateModal = function() {
    const modal = document.getElementById("save-template-modal");
    if (!modal) return;
    
    const dialog = modal.querySelector("div");
    dialog.classList.remove("scale-100", "opacity-100");
    dialog.classList.add("scale-95", "opacity-0");
    
    setTimeout(() => {
        modal.classList.add("hidden");
    }, 300);
};
