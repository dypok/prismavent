import { Sidebar } from "../components/Sidebar.js";
import { Topbar } from "../components/Topbar.js";
import { EventTemplatesGrid } from "../components/EventTemplatesGrid.js";

export function TemplateEventFlow() {
  return `
    <div class="flex h-screen animate-fade-in">
      ${Sidebar()}
      <div class="flex-1 flex flex-col">
        ${Topbar()}
        <main class="flex-1 bg-[#FFF8F1] p-8 overflow-auto">
          ${EventTemplatesGrid()}
        </main>
      </div>
    </div>
  `;
}