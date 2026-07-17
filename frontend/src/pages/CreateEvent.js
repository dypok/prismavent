import { Sidebar } from "../components/Sidebar.js";
import { Topbar } from "../components/Topbar.js";

// Se registra una sola vez: decide a qué flujo redirigir según la
// opción elegida en la pantalla de selección inicial.
window.handleTemplateSelect = function (option) {
    if (option === "custom") {
        localStorage.removeItem("selectedEventTemplate");
        window.history.replaceState({}, "", "/events/new/custom");
    } else {
        window.history.replaceState({}, "", "/events/new/template");
    }
    window.dispatchEvent(new PopStateEvent("popstate"));
};

export function CreateEvent() {
    return `
    <div class="flex h-screen">

      ${Sidebar()}

      <div class="flex-1 flex flex-col">

        ${Topbar()}

        <main class="flex-1 bg-[#FFF8F1] flex items-center justify-center p-8 overflow-auto">
          <div class="w-full max-w-5xl">

            <div class="text-center mb-8 md:mb-12">
              <h1 class="font-display text-4xl md:text-5xl text-[#1E1B15] leading-tight tracking-tight"
                  style="font-family:'Playfair Display', serif;">
                Crea tu próximo evento
              </h1>
              <p class="mt-4 text-[#4D4637] text-lg max-w-2xl mx-auto font-medium">
                ¿Cómo deseas comenzar la planificación de tu gran día?
                Elige el camino que mejor se adapte a tus necesidades.
              </p>
            </div>

            <div class="grid md:grid-cols-2 gap-6 md:gap-8">

              <div onclick="window.handleTemplateSelect('template')"
                  class="group bg-white border border-[#E9E1D7] hover:border-[#C9A84C] rounded-3xl p-8 cursor-pointer transition-all hover:-translate-y-2 hover:shadow-2xl">
                <div class="w-14 h-14 bg-[#FEF3C7] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#755B00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/>
                    <path d="M4 20h16"/>
                    <path d="M8 16l-2 4"/>
                    <path d="M16 16l2 4"/>
                  </svg>
                </div>
                <h2 class="font-display text-2xl text-[#1E1B15] mb-3">Usar una Plantilla</h2>
                <p class="text-[#4D4637] text-base leading-relaxed">
                  Ahorra tiempo con estructuras predefinidas para Bodas, Cumpleaños o Eventos Corporativos.
                </p>
                <div class="mt-8 flex items-center gap-3 text-[#755B00] font-semibold text-base">
                  Comenzar con guía
                  <span class="text-xl transition-transform group-hover:translate-x-2">→</span>
                </div>
              </div>

              <div onclick="window.handleTemplateSelect('custom')"
                  class="group bg-white border border-[#E9E1D7] hover:border-[#755B00] rounded-3xl p-8 cursor-pointer transition-all hover:-translate-y-2 hover:shadow-2xl">
                <div class="w-14 h-14 bg-[#D1FAE5] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#755B00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                    <path d="m15 5 4 4"/>
                  </svg>
                </div>
                <h2 class="font-display text-2xl text-[#1E1B15] mb-3">Evento Personalizado</h2>
                <p class="text-[#4D4637] text-base leading-relaxed">
                  ¿Tienes una visión única? Comienza desde cero sobre un lienzo en blanco.
                </p>
                <div class="mt-8 flex items-center gap-3 text-[#755B00] font-semibold text-base">
                  Crear desde cero
                  <span class="text-xl transition-transform group-hover:translate-x-2">→</span>
                </div>
              </div>

            </div>
          </div>
        </main>

      </div>

    </div>
  `;
}
