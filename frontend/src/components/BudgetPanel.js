export function BudgetPanel(event) {
  if (!event) {
    return `
      <div class="bg-white rounded-2xl border border-gray-200 p-6">
        <p class="text-gray-500">Loading budget...</p>
      </div>
    `;
  }

  const totalEstimated = Number(event.total_estimated) || 0;
  const maxBudget = event.max_budget != null ? Number(event.max_budget) : null;
  const overBudget = maxBudget !== null && totalEstimated > maxBudget;
  const remaining = maxBudget !== null ? maxBudget - totalEstimated : null;

  const formatCOP = (val) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);

  return `
    <div class="bg-white rounded-2xl border border-gray-200 p-6" id="budget-panel">

      <h2
        class="text-3xl font-bold mb-6"
        style="font-family: 'Playfair Display', serif;"
      >
        Budget
      </h2>

      ${overBudget ? `
        <div class="mb-4 rounded-lg border border-red-300 bg-red-100 p-3 text-red-800">
          ⚠️ You have exceeded your maximum budget.
        </div>
      ` : maxBudget !== null && remaining >= 0 ? `
        <div class="mb-4 rounded-lg border border-green-300 bg-green-100 p-3 text-green-800">
          ✅ Within budget
        </div>
      ` : ''}

      <div id="budget-items" class="space-y-3">

        ${event.event_items.length === 0
          ? '<p class="text-gray-400 text-sm">No resources added yet.</p>'
          : event.event_items
              .map((item) => {
                const subtotal = Number(item.quantity) * Number(item.unit_price);
                return `
                  <div class="flex justify-between items-center">
                    <span class="text-gray-700">${item.name}</span>
                    <span class="font-medium">${formatCOP(subtotal)}</span>
                  </div>
                `;
              })
              .join("")
        }

      </div>

      <hr class="my-6">

      <div class="space-y-3">
        <div class="flex justify-between items-center">
          <span class="font-medium">Total estimado</span>
          <span class="text-xl font-bold">${formatCOP(totalEstimated)}</span>
        </div>

        ${maxBudget !== null ? `
          <div class="flex justify-between items-center">
            <span class="font-medium">Presupuesto máx.</span>
            <span class="text-xl font-bold">${formatCOP(maxBudget)}</span>
          </div>

          <hr class="my-2">

          <div class="flex justify-between items-center">
            <span class="font-semibold text-lg">Saldo restante</span>
            <span class="text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}">
              ${remaining >= 0 ? '+' : ''}${formatCOP(remaining)}
            </span>
          </div>
        ` : `
          <div class="flex justify-between items-center">
            <span class="font-medium text-gray-500">Sin límite de presupuesto</span>
          </div>
        `}
      </div>

    </div>
  `;
}