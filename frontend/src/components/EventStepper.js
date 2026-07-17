import { icon } from "./Icons.js";

export function EventStepper(currentStep = 1) {
  const iconNames = ["file", "calendar-check", "play", "check-circle"];
  const steps = ["Borrador", "Confirmado", "En Progreso", "Realizado"];

  return `
    <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 lg:p-6 mb-4 lg:mb-6 overflow-x-auto">

      <div class="flex items-center justify-center gap-3 sm:gap-12 min-w-max sm:min-w-0">

        ${steps.map((step, index) => `
          <div class="flex items-center gap-1 sm:gap-3">

            <div class="flex flex-col items-center">

              <div class="
                w-8 h-8 sm:w-10 sm:h-10
                rounded-full
                flex items-center justify-center
                ${
                  index + 1 <= currentStep
                    ? "bg-[#C9A84C] text-white"
                    : "bg-gray-200 text-gray-500"
                }
              ">
                ${icon(iconNames[index], 16)}
              </div>

              <span class="mt-0.5 sm:mt-2 text-[10px] sm:text-sm text-gray-700 whitespace-nowrap">
                ${step}
              </span>

            </div>

            ${
              index < steps.length - 1
                ? `<div class="w-6 sm:w-20 h-[2px] bg-gray-200 shrink-0"></div>`
                : ""
            }

          </div>
        `).join("")}

      </div>

    </div>
  `;
}