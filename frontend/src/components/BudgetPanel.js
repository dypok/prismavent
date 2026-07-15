export function BudgetPanel(event) {

  if (!event) {
    return `
      <div class="bg-white rounded-2xl border border-gray-200 p-6">
        <p class="text-gray-500">Loading budget...</p>
      </div>
    `;
  }

  const overBudget =
  event.max_budget != null &&
  Number(event.total_estimated) > Number(event.max_budget)
  
  return `
    <div class="bg-white rounded-2xl border border-gray-200 p-6">

      <h2
        class="text-3xl font-bold mb-6"
        style="font-family: 'Playfair Display', serif;"
      >
        Budget
      </h2>

      ${
          overBudget
            ? `
              <div class="mb-4 rounded-lg border border-amber-300 bg-amber-100 p-3 text-amber-800">
                ⚠️ You have exceeded your maximum budget.
              </div>
            `
            : ""
        }

      <div id="budget-items" class="space-y-3">

        ${
         event.event_items.length === 0
             ? `
             <p class="text-gray-400 text-sm">
                 No resources added yet.
             </p>
             `
             : event.event_items
                 .map(
                 (item) => `
                     <div class="flex justify-between items-center">

                     <span class="text-gray-700">
                         ${item.name}
                     </span>

                     <span class="font-medium">
                         $${(
                         Number(item.quantity) * Number(item.unit_price)
                         ).toLocaleString()}
                     </span>

                     </div>
                 `
                 )
                 .join("")
         }

      </div>

      <hr class="my-6">

      <div class="flex justify-between items-center">

        <span class="font-medium">
          Total
        </span>

        <span
          class="text-3xl font-bold"
          style="font-family: 'Playfair Display', serif;"
        >
          $${Number(event.total_estimated).toLocaleString()}
        </span>

      </div>

    </div>
  `;
}