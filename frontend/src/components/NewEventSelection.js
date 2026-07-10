// src/components/NewEventSelection.js
import { EventTemplatesGrid } from './EventTemplatesGrid.js';

export function NewEventSelection() {
    const container = document.createElement('div');
    container.id = 'new-event-container';
    container.className = 'h-full';
    
    function renderSelectionView() {
        return `
            <div class="h-full bg-[#FFF8F1] flex flex-col">
                <div class="flex-1 flex items-center justify-center p-8">
                    <div class="w-full max-w-5xl">
                        <div class="text-center mb-16">
                            <h1 class="font-display text-5xl md:text-6xl text-[#1E1B15] leading-tight tracking-tight">
                                Crea tu próximo evento
                            </h1>
                            <p class="mt-6 text-[#4D4637] text-xl max-w-2xl mx-auto font-medium">
                                ¿Cómo deseas comenzar la planificación de tu gran día? 
                                Elige el camino que mejor se adapte a tus necesidades.
                            </p>
                        </div>

                        <div class="grid md:grid-cols-2 gap-8">
                            <div id="card-template" 
                                class="group bg-white border border-[#E9E1D7] hover:border-[#C9A84C] rounded-3xl p-10 cursor-pointer transition-all hover:-translate-y-3 hover:shadow-2xl">
                                <div class="w-16 h-16 bg-[#FEF3C7] rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                    ✨
                                </div>
                                <h2 class="font-display text-3xl text-[#1E1B15] mb-4">Usar una Plantilla</h2>
                                <p class="text-[#4D4637] text-[17px] leading-relaxed">
                                    Ahorra tiempo con estructuras predefinidas para Bodas, Cumpleaños o Eventos Corporativos.
                                </p>
                                <div class="mt-10 flex items-center gap-3 text-[#755B00] font-semibold text-lg">
                                    Comenzar con guía 
                                    <span class="text-2xl transition-transform group-hover:translate-x-2">→</span>
                                </div>
                            </div>

                            <div id="card-custom" 
                                class="group bg-white border border-[#E9E1D7] hover:border-[#755B00] rounded-3xl p-10 cursor-pointer transition-all hover:-translate-y-3 hover:shadow-2xl">
                                <div class="w-16 h-16 bg-[#D1FAE5] rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                    ✏️
                                </div>
                                <h2 class="font-display text-3xl text-[#1E1B15] mb-4">Evento Personalizado</h2>
                                <p class="text-[#4D4637] text-[17px] leading-relaxed">
                                    ¿Tienes una visión única? Comienza desde cero sobre un lienzo en blanco.
                                </p>
                                <div class="mt-10 flex items-center gap-3 text-[#755B00] font-semibold text-lg">
                                    Crear desde cero 
                                    <span class="text-2xl transition-transform group-hover:translate-x-2">→</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    container.innerHTML = renderSelectionView();

    setTimeout(() => {
        const templateCard = container.querySelector('#card-template');
        if (templateCard) {
            templateCard.addEventListener('click', showTemplatesGrid);
        }
        const customCard = container.querySelector('#card-custom');
        if (customCard) {
            customCard.addEventListener('click', startCustomEvent);
        }
    }, 0);

    function showTemplatesGrid() {
        container.innerHTML = '';
        const grid = EventTemplatesGrid();
        container.appendChild(grid);
    }

    function showSelectionView() {
        container.innerHTML = renderSelectionView();
        setTimeout(() => {
            container.querySelector('#card-template')?.addEventListener('click', showTemplatesGrid);
            container.querySelector('#card-custom')?.addEventListener('click', startCustomEvent);
        }, 0);
    }

    window.addEventListener('showTemplateSelection', () => {
        showSelectionView();
    });

    window.addEventListener('templateSelected', (e) => {
        const template = e.detail;


        localStorage.setItem('selectedEventTemplate', JSON.stringify(template.preset));
        startCustomEvent();
    });

    // 🔧 CAMBIO: Listener para "Crear desde cero" desde el grid de plantillas
    window.addEventListener('showCustomEventForm', () => {
        startCustomEvent();
    });

    return container;
}

window.goBackToDashboard = () => window.history.back();

window.startCustomEvent = () => {
    import('../components/CustomEventForm.js').then(mod => {
        document.body.insertAdjacentHTML('beforeend', mod.CustomEventForm());
    });
};