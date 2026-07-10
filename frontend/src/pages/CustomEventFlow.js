import { Sidebar } from "../components/Sidebar.js";
import { Topbar } from "../components/Topbar.js";
import { CustomEventForm } from "../components/CustomEventForm.js";

export function CustomEventFlow() {
  return `
    <div class="flex h-screen">
      ${Sidebar()}
      <div class="flex-1 flex flex-col">
        ${Topbar("Carlos")}
        <main class="flex-1 bg-[#FFF8F1] p-8 overflow-auto flex justify-center items-start">
          ${CustomEventForm()}
        </main>
      </div>
    </div>
  `;
}