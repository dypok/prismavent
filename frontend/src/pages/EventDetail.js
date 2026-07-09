import { Sidebar } from "../components/Sidebar.js";
import { Topbar } from "../components/Topbar.js";
import { EventStepper } from "../components/EventStepper.js";

export function EventDetail() {
  return `
    <div class="flex min-h-screen bg-[#F8F5F0]">

      ${Sidebar("events")}

      <main class="flex-1 flex flex-col">

        ${Topbar()}

      <section class="flex gap-6 p-8 h-full">

        <!-- Columna izquierda -->
        <div class="w-3/5 bg-white rounded-2xl border border-gray-200 p-6">
        
          ${EventStepper(1)}

          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-semibold">Event Resource</h2>

            <span class="text-sm text-gray-500">
              0 of 0 confirmed
            </span>
          </div>

          <div class="h-[650px] rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
            Resource Canvas
          </div>

         </div>

        <!-- Panel derecho -->
          <aside class="w-2/5 bg-white rounded-2xl border border-gray-200 p-6">

            <div class="space-y-6">

            <div class="rounded-xl border border-gray-200 p-4">
              Stepper
            </div>

            <div class="rounded-xl border border-gray-200 p-4">
              Budget Summary
            </div>

            <div class="rounded-xl border border-gray-200 p-4">
              Event Information
            </div>

          </div>

      </aside>

</section>
      </main>

    </div>
  `;
}