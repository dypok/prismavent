export function CustomEventForm() {
    return `
        <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" id="customEventModal">
        <div class="bg-white w-full max-w-3xl rounded-3xl shadow-2xl max-h-[94vh] flex flex-col">
            
            <div class="px-10 pt-8 pb-5 border-b border-[#E9E1D7]">
            <div class="flex justify-between items-center">
                <div>
                <h2 class="font-display text-3xl text-[#1E1B15]">Nuevo Evento</h2>
                <p class="text-[#4D4637]">Completa toda la información requerida</p>
                </div>
                <button onclick="closeCustomForm()" class="text-4xl text-gray-400 hover:text-black">×</button>
            </div>
            </div>

            <form id="createEventForm" class="flex-1 overflow-y-auto p-10 space-y-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7">

                <!-- Básicos -->
                <div class="md:col-span-2">
                <label class="block text-xs font-medium tracking-widest text-[#4D4637] mb-2">NOMBRE DEL EVENTO</label>
                <input type="text" id="eventName" required class="w-full px-6 py-4 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00]" placeholder="Lanzamiento Nuevo Producto 2026">
                </div>

                <div>
                <label class="block text-xs font-medium tracking-widest text-[#4D4637] mb-2">FECHA</label>
                <input type="date" id="eventDate" required class="w-full px-6 py-4 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00]">
                </div>
                <div>
                <label class="block text-xs font-medium tracking-widest text-[#4D4637] mb-2">HORA INICIO</label>
                <input type="time" id="eventTime" class="w-full px-6 py-4 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00]">
                </div>

                <div class="md:col-span-2">
                <label class="block text-xs font-medium tracking-widest text-[#4D4637] mb-2">LUGAR / SEDE</label>
                <input type="text" id="eventLocation" class="w-full px-6 py-4 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00]" placeholder="Hotel Hilton - Salón Imperial">
                </div>

                <!-- Más campos profesionales -->
                <div>
                <label class="block text-xs font-medium tracking-widest text-[#4D4637] mb-2">N° DE ASISTENTES</label>
                <input type="number" id="guestCount" required class="w-full px-6 py-4 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00]">
                </div>

                <div>
                <label class="block text-xs font-medium tracking-widest text-[#4D4637] mb-2">TIPO DE EVENTO</label>
                <select id="eventType" required class="w-full px-6 py-4 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00]">
                    <option value="">Seleccionar...</option>
                    <option value="launch">Lanzamiento de Producto</option>
                    <option value="conference">Conferencia</option>
                    <option value="seminar">Seminario / Taller</option>
                    <option value="team-building">Team Building</option>
                    <option value="gala">Gala / Cena Corporativa</option>
                    <option value="wedding">Boda</option>
                    <option value="other">Otro</option>
                </select>
                </div>

                <div class="md:col-span-2">
                <label class="block text-xs font-medium tracking-widest text-[#4D4637] mb-2">PRESUPUESTO MÁXIMO (COP)</label>
                <div class="relative">
                    <span class="absolute left-6 top-1/2 -translate-y-1/2 text-2xl text-[#755B00]">$</span>
                    <input type="number" id="maxBudget" required class="w-full pl-12 pr-6 py-4 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00]">
                </div>
                </div>

                <!-- Campos adicionales (10+) -->
                <div>
                <label class="block text-xs font-medium tracking-widest text-[#4D4637] mb-2">¿CATERING?</label>
                <select id="catering" class="w-full px-6 py-4 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00]">
                    <option value="full">Sí - Completo (Comida + Bebida)</option>
                    <option value="light">Sí - Ligero (Coffee Break)</option>
                    <option value="no">No</option>
                </select>
                </div>

                <div>
                <label class="block text-xs font-medium tracking-widest text-[#4D4637] mb-2">EQUIPO AUDIOVISUAL</label>
                <select id="audiovisual" class="w-full px-6 py-4 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00]">
                    <option value="full">Completo (Proyector, Sonido, Micrófonos)</option>
                    <option value="basic">Básico</option>
                    <option value="no">No requerido</option>
                </select>
                </div>

                <div>
                <label class="block text-xs font-medium tracking-widest text-[#4D4637] mb-2">¿STREAMING / TRANSMISIÓN?</label>
                <select id="streaming" class="w-full px-6 py-4 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00]">
                    <option value="yes">Sí</option>
                    <option value="no">No</option>
                </select>
                </div>

                <div>
                <label class="block text-xs font-medium tracking-widest text-[#4D4637] mb-2">DURACIÓN (HORAS)</label>
                <input type="number" id="duration" value="8" class="w-full px-6 py-4 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00]">
                </div>

                <div>
                <label class="block text-xs font-medium tracking-widest text-[#4D4637] mb-2">N° DE SPEAKERS / INVITADOS ESPECIALES</label>
                <input type="number" id="speakers" value="3" class="w-full px-6 py-4 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00]">
                </div>

                <div>
                <label class="block text-xs font-medium tracking-widest text-[#4D4637] mb-2">¿MATERIAL PROMOCIONAL?</label>
                <select id="promotional" class="w-full px-6 py-4 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00]">
                    <option value="yes">Sí (Roll-ups, brochures, gifts)</option>
                    <option value="no">No</option>
                </select>
                </div>

                <div class="md:col-span-2">
                <label class="block text-xs font-medium tracking-widest text-[#4D4637] mb-2">OBJETIVOS DEL EVENTO / NOTAS ESPECIALES</label>
                <textarea id="notes" rows="5" class="w-full px-6 py-4 border border-[#D0C5B2] rounded-2xl focus:border-[#755B00]" 
                    placeholder="Ej: Generar leads, motivar equipo, lanzamiento oficial, protocolo de bioseguridad, invitados VIP..."></textarea>
                </div>

            </div>

            <div class="pt-8 flex gap-4">
                <button type="button" onclick="closeCustomForm()" class="flex-1 py-4 border border-[#D0C5B2] rounded-2xl font-medium hover:bg-gray-50">Cancelar</button>
                <button type="submit" class="flex-1 py-4 bg-[#755B00] hover:bg-[#5F4A00] text-white font-semibold rounded-2xl">Crear Evento →</button>
            </div>
            </form>
        </div>
        </div>
    `;
}

window.closeCustomForm = () => document.getElementById('customEventModal')?.remove();

document.addEventListener('submit', (e) => {
    if (e.target.id === 'createEventForm') {
        e.preventDefault();
        alert(" ¡Evento creado exitosamente!");
        console.log("Evento completo:", Object.fromEntries(new FormData(e.target)));
        closeCustomForm();
    }
});