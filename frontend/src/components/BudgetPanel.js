export function BudgetPanel(event) {

  if (!event) {
    return `
      <div class="bg-white rounded-2xl border border-gray-200 p-6">
        <p class="text-gray-500">Loading budget...</p>
      </div>
    `;
  }
  
  return `
    <div class="bg-white rounded-2xl border border-gray-200 p-6">

      <h2
        class="text-3xl font-bold mb-6"
        style="font-family: 'Playfair Display', serif;"
      >
        Budget
      </h2>

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