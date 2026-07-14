import { Sidebar } from "../components/Sidebar.js";
import { Topbar } from "../components/Topbar.js";
import { EventStepper } from "../components/EventStepper.js";
import { getEventById } from "../service/api.js";
import { BudgetPanel } from "../components/BudgetPanel.js";

// NOTA: por ahora solo recibe y muestra el eventId que llega por la URL
// (?id=...) para confirmar que el redirect desde CustomEventForm.js
// funciona correctamente. Traer los datos reales del evento (nombre,
// presupuesto, items) vía GET /events/{id} y reemplazar los placeholders
// de abajo es trabajo pendiente de otro ticket, fuera del alcance de
// "Llamada POST /events al confirmar y redirigir al detalle".
export async function EventDetail(eventId) {
  let event = null;

    if (eventId) {
      try {
        event = await getEventById(eventId);

      } catch (error) {
        console.error(error);
      }
  }
  
  const totalResources = event?.event_items?.length || 0;

  const confirmedResources =
    event?.event_items?.filter(item => item.confirmed).length || 0;

  const isFinalized = event?.status === 'finalizado';

  return `
    <div class="flex min-h-screen bg-[#F8F5F0]">

      ${Sidebar("events")}

      <main class="flex-1 flex flex-col">

        ${Topbar()}

      <section class="flex gap-6 p-8 h-full">

        <!-- Columna izquierda -->
        <div class="w-3/5 bg-white rounded-2xl border border-gray-200 p-6">
        
          ${EventStepper(1)}

          ${isFinalized ? `
          <div class="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-3 text-blue-800 text-sm">
            Este evento esta finalizado. No se permiten modificaciones.
          </div>
          ` : ''}

          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-semibold">Event Resource</h2>

            <span class="text-sm text-gray-500">
              ${confirmedResources} of ${totalResources} confirmed
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

            ${BudgetPanel(event)}

            <div class="rounded-xl border border-gray-200 p-4">
              Event Information
              ${eventId ? `<p class="text-xs text-gray-400 mt-2">ID: ${eventId}</p>` : `<p class="text-xs text-red-500 mt-2">Sin ID de evento en la URL</p>`}
            </div>

          </div>

      </aside>

</section>
      </main>

    </div>
  `;
}

