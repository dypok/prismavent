import { CreateEvent } from "./CreateEvent.js";
import { TemplateEventFlow } from "./TemplateEventFlow.js";
import { CustomEventForm } from "../components/CustomEventForm.js";

export function CustomEventFlow() {
  // Determinamos de dónde viene el usuario revisando si hay una plantilla en memoria.
  // Si hay plantilla, pintamos el grid de plantillas de fondo. 
  // Si no, pintamos la pantalla de inicio de fondo.
  const isFromTemplate = localStorage.getItem("selectedEventTemplate") !== null;
  const Background = isFromTemplate ? TemplateEventFlow() : CreateEvent();

  return `
    ${Background}
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
      ${CustomEventForm()}
    </div>
  `;
}