import { Sidebar } from "../components/Sidebar.js";
import { Topbar } from "../components/Topbar.js";
import { EventTemplatesGrid } from "../components/EventTemplatesGrid.js";
import { icon } from "../components/Icons.js";

export function TemplateEventFlow() {
  return `
    <div class="flex h-screen animate-fade-in">
      ${Sidebar()}
      <div class="flex-1 flex flex-col">
        ${Topbar(`
          <div class="flex items-center gap-4">
            <button onclick="window.history.pushState({}, '', '/events/new'); window.dispatchEvent(new PopStateEvent('popstate'))" class="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#9E8E6E] hover:text-[#1E1B15] hover:shadow-sm transition-all border border-[#E9E1D7]">
              ${icon('chevron-left', 18)}
            </button>
            <div>
              <h1 class="text-2xl font-bold text-[#1E1B15]">Elige una Plantilla</h1>
              <p class="text-[#9E8E6E] text-xs mt-0.5">Estructuras predefinidas para tu planificación</p>
            </div>
          </div>
        `)}
        <main class="flex-1 bg-[#FFF8F1] p-4 sm:p-6 lg:p-8 overflow-auto">
          ${EventTemplatesGrid()}
        </main>
      </div>
    </div>
  `;
}