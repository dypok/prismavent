import { Sidebar } from "../components/Sidebar.js";
import { Topbar } from "../components/Topbar.js";
import { EventTemplateCard } from "../components/EventTemplateCard.js";

export function CreateEvent() {
  return `
    <div class="flex h-screen">

      ${Sidebar()}

      <div class="flex-1 flex flex-col">

        ${Topbar("Carlos")}

        <main class="flex-1 bg-[#FFF8F1] px-14 py-12 overflow-auto">

            <h1 class="text-5xl font-bold text-[#2E241B]"
                style="font-family:'Playfair Display', serif;"
            >
                Elige una plantilla para tu nuevo evento
            </h1>

            <p class="mt-4 max-w-3xl text-lg leading-8 text-[#5B5145]"
            >
                Selecciona un punto de partida para tu planificación...
            </p>

           
           <div class="grid grid-cols-2 gap-8 mt-14">

                ${EventTemplateCard({
                    title: "Boda",
                    description:
                    "Romance y logística de alta gama. Incluye flujos de RSVP, catering y coordinación de ceremonia.",
                    icon: "❤️",
                    backgroundColor: "#FCECEC",
                    buttonText: "Seleccionar",
                })}

                ${EventTemplateCard({
                    title: "Cumpleaños",
                    description:
                    "Celebraciones vibrantes. Configuración para DJ, pastel, lista de invitados y actividades.",
                    icon: "🎉",
                    backgroundColor: "#F8F2D8",
                    buttonText: "Seleccionar",
                })}

                ${EventTemplateCard({
                    title: "Tech / Startup",
                    description:
                    "Enfoque en networking, pantallas, registro rápido y patrocinios corporativos.",
                    icon: "💻",
                    backgroundColor: "#ECE9E5",
                    buttonText: "Seleccionar",
                })}

                ${EventTemplateCard({
                    title: "Personalizado",
                    description:
                    "Lienzo en blanco. Construye la estructura de tu evento desde cero con flexibilidad total.",
                    icon: "✏️",
                    backgroundColor: "#DDF0E5",
                    buttonText: "Comenzar en blanco",
                })}

            </div>

        </main>

      </div>

    </div>
  `;
}