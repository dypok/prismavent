import { icon } from "./Icons.js";

export function TasksPanel(event, tasks = []) {
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === "done").length;
  const inProgressTasks = tasks.filter(t => t.status === "in_progress").length;
  const todoTasks = tasks.filter(t => t.status === "todo").length;

  return `
    <div class="bg-white rounded-2xl border border-gray-200 p-4 lg:p-6 shadow-sm">
      <div class="flex justify-between items-center mb-5">
        <h2 class="text-lg font-bold text-[#1E1B15] flex items-center gap-2">
          ${icon('layout', 20, 'text-[#755B00]')}
          Tareas (Kanban)
        </h2>
        <button
          id="btn-view-kanban"
          class="px-4 py-2 rounded-xl bg-[#755B00] text-white text-sm hover:bg-[#5F4A00] flex items-center gap-1.5 transition-colors"
          data-event-id="${event?.id}"
        >
          Ver Tablero
          ${icon('arrow-right', 14)}
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
        <div class="bg-[#F8F5F0] rounded-xl p-3">
          <p class="text-xs text-[#9E8E6E]">Por Hacer</p>
          <p class="text-xl font-bold text-[#1E1B15] mt-1">${todoTasks}</p>
        </div>
        <div class="bg-[#FEF3C7]/60 rounded-xl p-3">
          <p class="text-xs text-[#755B00]">En Progreso</p>
          <p class="text-xl font-bold text-[#755B00] mt-1">${inProgressTasks}</p>
        </div>
        <div class="bg-green-50 rounded-xl p-3">
          <p class="text-xs text-green-600">Realizadas</p>
          <p class="text-xl font-bold text-green-700 mt-1">${doneTasks}</p>
        </div>
      </div>
      
      <div class="text-xs text-[#9E8E6E] mt-4 flex justify-between items-center">
        <span>Progreso general:</span>
        <span class="font-semibold text-[#1E1B15]">${totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0}%</span>
      </div>
      <div class="w-full bg-gray-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
        <div class="bg-green-600 h-1.5 rounded-full transition-all duration-500" style="width: ${totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0}%"></div>
      </div>
    </div>
  `;
}
