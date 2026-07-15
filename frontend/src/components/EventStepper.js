export function EventStepper(currentStep = 1) {


  const steps = [
    "Draft",
    "confirmed",
    "finished"
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
                text-sm font-semibold
                ${
                  index + 1 <= currentStep
                    ? "bg-[#C9A84C] text-white"
                    : "bg-gray-200 text-gray-500"
                }
              ">
                ${index + 1}
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