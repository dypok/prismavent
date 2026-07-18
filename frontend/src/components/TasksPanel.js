import { icon } from "./Icons.js";

export function TasksPanel(event, tasks = []) {
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === "done").length;
  const inProgressTasks = tasks.filter(t => t.status === "in_progress").length;
  const todoTasks = tasks.filter(t => t.status === "todo").length;

  return `
    <div class="bg-[#FAFAF8] rounded-xl border border-gray-200 p-6">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-bold text-[#1E1B15] flex items-center gap-2">
          ${icon('layout', 22, 'text-[#755B00]')}
          Tareas (Kanban)
        </h3>
        <button
          id="btn-view-kanban"
          class="px-5 py-2.5 rounded-lg bg-[#755B00] text-white text-sm hover:bg-[#5F4A00] flex items-center gap-1 transition-colors"
          data-event-id="${event?.id}"
        >
          Ver Tablero
          ${icon('arrow-right', 14)}
        </button>
      </div>

      <div class="grid grid-cols-3 gap-4 text-center">
        <div class="bg-white rounded-xl p-5">
          <p class="text-sm text-[#9E8E6E] mb-2">Por Hacer</p>
          <p class="text-2xl font-bold text-[#1E1B15]">${todoTasks}</p>
        </div>
        <div class="bg-[#FEF3C7]/60 rounded-xl p-5">
          <p class="text-sm text-[#755B00] mb-2">En Progreso</p>
          <p class="text-2xl font-bold text-[#755B00]">${inProgressTasks}</p>
        </div>
        <div class="bg-green-50 rounded-xl p-5">
          <p class="text-sm text-green-600 mb-2">Realizadas</p>
          <p class="text-2xl font-bold text-green-700">${doneTasks}</p>
        </div>
      </div>
      
      <div class="flex items-center gap-3 mt-6 text-sm text-[#9E8E6E]">
        <span>Progreso:</span>
        <span class="font-semibold text-[#1E1B15]">${totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0}%</span>
        <div class="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
          <div class="bg-green-600 h-3 rounded-full transition-all duration-500" style="width: ${totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0}%"></div>
        </div>
      </div>
    </div>
  `;
}
