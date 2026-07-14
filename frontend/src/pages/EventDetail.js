import { Sidebar } from "../components/Sidebar.js";
import { Topbar } from "../components/Topbar.js";
import { EventStepper } from "../components/EventStepper.js";
import { getEventById } from "../service/api.js";
import { BudgetPanel } from "../components/BudgetPanel.js";
import { DeleteEventModal } from "../components/DeleteEventModal.js";

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

            ${
                event?.status === "borrador"
                  ? `
                    <div class="rounded-2xl border border-red-200 bg-red-50/40 p-5">

                      <div class="flex items-center gap-2 mb-2">

                        <svg xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="#DC2626"
                            stroke-width="2">
                          <path stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                        </svg>

                        <h3 class="text-sm font-semibold text-red-700">
                          Delete Event
                        </h3>

                      </div>

                      <p class="text-sm text-gray-600 mb-4">
                        This action permanently deletes this event and cannot be undone.
                      </p>

                      <button
                        id="open-delete-modal"
                        class="w-full py-3 rounded-xl border border-red-300 bg-white text-red-600 font-medium hover:bg-red-100 hover:border-red-500 transition flex items-center justify-center gap-2"
                      >

                        <svg xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="2">

                          <path stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M19 7L18.133 19.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0h8"/>

                        </svg>

                        Delete Event

                      </button>

                    </div>
                  `
                  : ""
              }

          </div>

      </aside>

</section>
      </main>
    ${DeleteEventModal()}
    </div>
  `;
}

