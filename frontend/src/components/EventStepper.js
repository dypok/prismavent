export function EventStepper(currentStep = 1) {

  const icons = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="9 16 11 18 15 14"/></svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="16 8 10 16 7 13"/></svg>`,
  ];

  const steps = [
    "Borrador",
    "Confirmado",
    "En Progreso",
    "Realizado"
  ];

  return `
    <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">

      <div class="flex items-center justify-center gap-12">

        ${steps.map((step, index) => `
          <div class="flex items-center">

            <div class="flex flex-col items-center">

              <div class="
                w-10 h-10
                rounded-full
                flex items-center justify-center
                ${
                  index + 1 <= currentStep
                    ? "bg-[#C9A84C] text-white"
                    : "bg-gray-200 text-gray-500"
                }
              ">
                ${icons[index]}
              </div>

              <span class="mt-2 text-sm text-gray-700">
                ${step}
              </span>

            </div>

            ${
              index < steps.length - 1
                ? `<div class="w-20 h-[2px] bg-gray-200 mx-3"></div>`
                : ""
            }

          </div>
        `).join("")}

      </div>

    </div>
  `;
}