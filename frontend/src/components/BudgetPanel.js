import { BudgetProgressGauge } from './BudgetProgressGauge.js';
import { icon } from './Icons.js';

export function BudgetPanel(event) {
  if (!event) {
    return `
      <div class="bg-white rounded-2xl border border-gray-200 p-6">
        <p class="text-gray-500">Loading budget...</p>
      </div>
    `;
  }

  const items = event.event_items || [];
  const totalEstimated = Number(event.total_estimated) || 0;
  const maxBudget = event.max_budget != null ? Number(event.max_budget) : null;

  const confirmedTotal = items
    .filter(i => i.confirmed)
    .reduce((s, i) => s + Number(i.quantity) * Number(i.unit_price), 0);
  const pendingTotal = items
    .filter(i => !i.confirmed)
    .reduce((s, i) => s + Number(i.quantity) * Number(i.unit_price), 0);

  const remaining = maxBudget !== null ? maxBudget - confirmedTotal : null;

  const formatCOP = (val) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);

  return `
    <div class="bg-white rounded-2xl border border-gray-200 p-6" id="budget-panel">

      <h2
        class="font-display text-3xl font-bold mb-4"
      >
        Presupuesto
      </h2>

      ${maxBudget !== null ? `
        <div class="flex flex-col items-center mb-4">
          ${BudgetProgressGauge(confirmedTotal, maxBudget)}
        </div>


        <div class="grid grid-cols-3 gap-2 mb-5 text-center">
          <div class="bg-green-50 rounded-xl p-2.5">
            <p class="text-[10px] text-gray-500 mb-0.5">Confirmado</p>
            <p class="text-sm font-bold text-green-600">${formatCOP(confirmedTotal)}</p>
          </div>
          <div class="bg-amber-50 rounded-xl p-2.5">
            <p class="text-[10px] text-gray-500 mb-0.5">Pendiente</p>
            <p class="text-sm font-bold text-amber-600">${formatCOP(pendingTotal)}</p>
          </div>
          <div class="${remaining >= 0 ? 'bg-blue-50' : 'bg-red-50'} rounded-xl p-2.5">
            <p class="text-[10px] text-gray-500 mb-0.5">Disponible</p>
            <p class="text-sm font-bold ${remaining >= 0 ? 'text-blue-600' : 'text-red-600'}">${formatCOP(Math.abs(remaining))}${remaining < 0 ? ' excedido' : ''}</p>
          </div>
        </div>
      ` : `
        <p class="text-sm text-gray-400 text-center mb-4">Sin límite de presupuesto</p>
      `}

      <div id="budget-items" class="space-y-2">

        ${items.length === 0
          ? '<p class="text-gray-400 text-sm">No resources added yet.</p>'
          : items
              .map((item) => {
                const subtotal = Number(item.quantity) * Number(item.unit_price);
                return `
                  <div class="flex justify-between items-center py-1.5 ${item.confirmed ? '' : 'opacity-70'}">
                    <div class="flex items-center gap-2 min-w-0">
                      <span class="text-xs flex-shrink-0">${
                        item.confirmed
                          ? icon('check-circle-2', 16, 'text-green-500')
                          : icon('clock', 16, 'text-amber-500')
                      }</span>
                      <span class="text-sm text-gray-700 truncate">${item.name}</span>
                    </div>
                    <span class="text-sm font-medium flex-shrink-0 ml-2">${formatCOP(subtotal)}</span>
                  </div>
                `;
              })
              .join("")
        }

      </div>

      <hr class="my-5">

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
        ` : ''}
      </div>

    </div>
  `;
}