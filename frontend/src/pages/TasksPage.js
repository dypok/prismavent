import { Sidebar } from "../components/Sidebar.js";
import { Topbar } from "../components/Topbar.js";
import { getEventById, getEventTasks, createEventTask, updateEventTask, moveEventTask, deleteEventTask } from "../service/api.js";
import { showToast } from "../components/Toast.js";
import { icon } from "../components/Icons.js";

export async function TasksPage(eventId) {
  let event = null;

  if (eventId) {
    try {
      event = await getEventById(eventId);
    } catch (error) {
      console.error("Error fetching event details:", error);
    }
  }

  return `
    <div class="flex min-h-screen bg-[#F8F5F0]" id="tasks-page">
      ${Sidebar("events")}

      <main class="flex-1 flex flex-col overflow-hidden">
        ${Topbar(`
          <div class="flex items-center gap-6 lg:gap-8 animate-fade-in" style="animation-delay: 0.1s;">
            <div class="flex items-center gap-4">
              <button onclick="window.history.back()" class="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#9E8E6E] hover:text-[#1E1B15] hover:shadow-sm transition-all border border-[#E9E1D7]">
                ${icon('chevron-left', 18)}
              </button>
              <div>
                <h1 class="text-2xl font-bold text-[#1E1B15]">Tareas</h1>
                <p class="text-[#9E8E6E] text-xs mt-0.5">${event?.name || "Planificación del Evento"}</p>
              </div>
            </div>
            
            <button
              id="btn-add-task"
              class="px-5 py-2.5 bg-[#755B00] text-white rounded-xl text-sm font-semibold hover:bg-[#5F4A00] transition-all shadow-sm flex items-center gap-2"
            >
              ${icon('plus', 18)}
              Añadir Tarea
            </button>
          </div>
        `)}

        <div class="flex-1 overflow-auto custom-scrollbar">
          <div class="p-8 max-w-7xl mx-auto h-full flex flex-col">
            <!-- Minimalist Kanban Columns -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 items-start min-h-[500px]">
              
              <!-- Column: TO DO -->
              <div class="bg-white rounded-2xl border border-[#E9E1D7] p-5 flex flex-col h-full min-h-[480px] shadow-sm" data-status="todo" id="col-todo">
                <div class="flex items-center justify-between mb-4 pb-2 border-b border-[#F5EDE0]">
                  <h3 class="font-semibold text-[#1E1B15] text-sm uppercase tracking-wider" id="header-todo">Por Hacer</h3>
                </div>
                <div class="flex-1 space-y-3 overflow-y-auto custom-scrollbar task-list-dropzone min-h-[380px]" id="tasks-todo">
                  <!-- Cards -->
                </div>
              </div>

              <!-- Column: IN PROGRESS -->
              <div class="bg-white rounded-2xl border border-[#E9E1D7] p-5 flex flex-col h-full min-h-[480px] shadow-sm" data-status="in_progress" id="col-in-progress">
                <div class="flex items-center justify-between mb-4 pb-2 border-b border-[#F5EDE0]">
                  <h3 class="font-semibold text-[#1E1B15] text-sm uppercase tracking-wider" id="header-in-progress">En Progreso</h3>
                </div>
                <div class="flex-1 space-y-3 overflow-y-auto custom-scrollbar task-list-dropzone min-h-[380px]" id="tasks-in_progress">
                  <!-- Cards -->
                </div>
              </div>

              <!-- Column: DONE -->
              <div class="bg-white rounded-2xl border border-[#E9E1D7] p-5 flex flex-col h-full min-h-[480px] shadow-sm" data-status="done" id="col-done">
                <div class="flex items-center justify-between mb-4 pb-2 border-b border-[#F5EDE0]">
                  <h3 class="font-semibold text-[#1E1B15] text-sm uppercase tracking-wider" id="header-done">Realizado</h3>
                </div>
                <div class="flex-1 space-y-3 overflow-y-auto custom-scrollbar task-list-dropzone min-h-[380px]" id="tasks-done">
                  <!-- Cards -->
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      <!-- Task Modal Structure -->
      <div id="task-modal" class="fixed inset-0 bg-[#1E1B15]/40 backdrop-blur-sm z-50 hidden items-center justify-center p-4">
        <div class="bg-white rounded-2xl border border-[#E9E1D7] shadow-xl w-full max-w-lg transform scale-95 transition-all duration-300 animate-scale-in">
          <div class="p-6 border-b border-[#F5EDE0] flex justify-between items-center bg-[#FFF8F1]">
            <h3 class="text-lg font-bold text-[#1E1B15]" id="task-modal-title">Nueva Tarea</h3>
            <button id="close-task-modal" class="text-[#9E8E6E] hover:text-[#1E1B15] transition-colors">
              ${icon('x', 20)}
            </button>
          </div>
          <form id="task-form" class="p-6 space-y-4">
            <div>
              <label for="task-title" class="block text-xs font-semibold tracking-widest text-[#4D4637] mb-1.5 uppercase">Título</label>
              <input 
                type="text" 
                id="task-title" 
                placeholder="Ej. Contratar banquete" 
                required 
                maxlength="255"
                class="w-full px-4 py-2.5 border border-[#D0C5B2] rounded-xl text-sm focus:border-[#755B00] focus:outline-none transition bg-white"
              >
            </div>
            
            <div>
              <label for="task-description" class="block text-xs font-semibold tracking-widest text-[#4D4637] mb-1.5 uppercase">Descripción (Opcional)</label>
              <textarea 
                id="task-description" 
                placeholder="Detalla las especificaciones de la tarea..." 
                rows="3" 
                class="w-full px-4 py-2.5 border border-[#D0C5B2] rounded-xl text-sm focus:border-[#755B00] focus:outline-none transition resize-none bg-white"
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="task-priority" class="block text-xs font-semibold tracking-widest text-[#4D4637] mb-1.5 uppercase">Prioridad</label>
                <select 
                  id="task-priority" 
                  class="w-full px-4 py-2.5 border border-[#D0C5B2] rounded-xl text-sm focus:border-[#755B00] focus:outline-none transition bg-white text-[#1E1B15]"
                >
                  <option value="low">Baja</option>
                  <option value="medium" selected>Media</option>
                  <option value="high">Alta</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold tracking-widest text-[#4D4637] mb-1.5 uppercase">Fecha Límite</label>
                <div class="relative">
                  <div id="task-dateDisplay" class="w-full px-4 py-2.5 border border-[#D0C5B2] rounded-xl text-sm cursor-pointer bg-white flex items-center justify-between select-none">
                    <span class="truncate">Selecciona una fecha</span>
                    ${icon('calendar', 16, 'text-[#9E8E6E] shrink-0 ml-2')}
                  </div>
                  <input type="hidden" id="task-due-date" value="">
                  ${window.calendarHTML ? window.calendarHTML('task').replace('w-72', 'w-64') : ''}
                </div>
              </div>
            </div>

            <div class="flex gap-3 pt-4 border-t border-[#F5EDE0]">
              <button 
                type="button" 
                id="btn-cancel-task"
                class="flex-1 py-3 border border-[#D0C5B2] rounded-xl text-sm font-semibold text-[#4D4637] hover:bg-[#F8F5F0] transition"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                class="flex-1 py-3 bg-[#755B00] text-white font-semibold rounded-xl text-sm hover:bg-[#5F4A00] transition shadow-sm"
              >
                Guardar Tarea
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

let allTasks = [];
let currentEventId = null;

// Helper to escape HTML characters
function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Format task due date as weekday, day of month, month, year (e.g. lunes, 17 de julio de 2026)
function formatTaskDueDate(dueDateStr) {
  if (!dueDateStr) return "";
  const [year, month, day] = dueDateStr.split("-").map(Number);
  const dateObj = new Date(year, month - 1, day);
  return dateObj.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function buildTaskCardHTML(task) {
  const priorityLabels = {
    low: "Baja",
    medium: "Media",
    high: "Alta"
  };

  return `
    <div 
      class="bg-white rounded-xl border border-[#E9E1D7] p-4 shadow-sm hover:border-[#755B00] hover:shadow transition duration-200 cursor-grab active:cursor-grabbing draggable-task" 
      draggable="true" 
      data-id="${task.id}"
      data-status="${task.status}"
    >
      <h4 class="font-semibold text-[#1E1B15] text-sm break-words">${escapeHtml(task.title)}</h4>
      ${task.description ? `<p class="text-xs text-[#6B6560] mt-1.5 break-words line-clamp-3 leading-relaxed">${escapeHtml(task.description)}</p>` : ''}
      
      <div class="flex flex-col gap-1 mt-4 pt-3 border-t border-[#F5EDE0]">
        <div class="text-[11px] text-[#9E8E6E]">
          Límite: <span class="font-semibold text-[#4D4637] capitalize-first">${formatTaskDueDate(task.due_date)}</span>
        </div>
        <div class="flex items-center justify-between mt-1 text-[11px] text-[#9E8E6E]">
          <span>Prioridad: <span class="font-semibold text-[#4D4637]">${priorityLabels[task.priority]}</span></span>
          
          <div class="flex items-center gap-2 shrink-0">
            <button class="btn-edit-task text-xs text-[#9E8E6E] hover:text-[#755B00] transition font-medium hover:underline cursor-pointer" data-id="${task.id}">Editar</button>
            <span class="text-gray-300 text-xs">|</span>
            <button class="btn-delete-task text-xs text-red-500 hover:text-red-700 transition font-medium hover:underline cursor-pointer" data-id="${task.id}">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderSkeletonCards(columnId, count = 2) {
  const container = document.getElementById(columnId);
  if (!container) return;

  container.innerHTML = Array(count).fill(0).map(() => `
    <div class="bg-white rounded-xl border border-[#E9E1D7] p-4 shadow-sm space-y-3 animate-pulse">
      <div class="h-4 bg-gray-200 rounded w-2/3"></div>
      <div class="space-y-1.5">
        <div class="h-3 bg-gray-100 rounded w-full"></div>
        <div class="h-3 bg-gray-100 rounded w-5/6"></div>
      </div>
      <div class="flex justify-between items-center pt-3 border-t border-gray-50">
        <div class="h-3 bg-gray-200 rounded w-16"></div>
        <div class="h-3 bg-gray-100 rounded w-12"></div>
      </div>
    </div>
  `).join("");
}

function renderKanbanBoard() {
  const columns = {
    todo: document.getElementById("tasks-todo"),
    in_progress: document.getElementById("tasks-in_progress"),
    done: document.getElementById("tasks-done")
  };

  const headers = {
    todo: document.getElementById("header-todo"),
    in_progress: document.getElementById("header-in-progress"),
    done: document.getElementById("header-done")
  };

  const grouped = {
    todo: [],
    in_progress: [],
    done: []
  };

  allTasks.forEach(task => {
    if (grouped[task.status] !== undefined) {
      grouped[task.status].push(task);
    } else {
      grouped.todo.push(task);
    }
  });

  const headerTitles = {
    todo: "Por Hacer",
    in_progress: "En Progreso",
    done: "Realizado"
  };

  Object.keys(columns).forEach(status => {
    const colContainer = columns[status];
    const headerEl = headers[status];
    if (!colContainer) return;

    const list = grouped[status];
    if (headerEl) {
      headerEl.textContent = `${headerTitles[status]} (${list.length})`;
    }

    if (list.length === 0) {
      colContainer.innerHTML = `
        <div class="flex flex-col items-center justify-center py-10 text-center text-[#9E8E6E] border-2 border-dashed border-[#E9E1D7] rounded-xl bg-[#FAFAF8]/40 select-none">
          <p class="text-xs font-semibold text-[#6B6560]">Sin tareas</p>
          <p class="text-[10px] mt-0.5">Arrastra una tarea aquí</p>
        </div>
      `;
    } else {
      colContainer.innerHTML = list.map(task => buildTaskCardHTML(task)).join("");
    }
  });

  attachCardEvents();
}

function attachCardEvents() {
  const cards = document.querySelectorAll(".draggable-task");
  cards.forEach(card => {
    card.addEventListener("dragstart", (e) => {
      card.classList.add("opacity-50");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", card.dataset.id);
    });

    card.addEventListener("dragend", () => {
      card.classList.remove("opacity-50");
    });
  });

  document.querySelectorAll(".btn-edit-task").forEach(btn => {
    btn.addEventListener("click", () => {
      const taskId = btn.dataset.id;
      const task = allTasks.find(t => t.id === taskId);
      if (task) {
        openTaskModal(task);
      }
    });
  });

  document.querySelectorAll(".btn-delete-task").forEach(btn => {
    btn.addEventListener("click", async () => {
      const taskId = btn.dataset.id;
      const task = allTasks.find(t => t.id === taskId);
      if (!task) return;

      if (confirm(`¿Estás seguro de que deseas eliminar la tarea "${task.title}"?`)) {
        try {
          await deleteEventTask(currentEventId, taskId);
          allTasks = allTasks.filter(t => t.id !== taskId);
          renderKanbanBoard();
          showToast("Tarea eliminada exitosamente.");
        } catch (error) {
          console.error("Error deleting task:", error);
          showToast(error.message || "Error al eliminar la tarea.", "error");
        }
      }
    });
  });

  document.querySelectorAll(".btn-move-quick").forEach(btn => {
    btn.addEventListener("click", async () => {
      const taskId = btn.dataset.id;
      const targetStatus = btn.dataset.target;
      await moveTaskStatus(taskId, targetStatus);
    });
  });
}

async function moveTaskStatus(taskId, newStatus) {
  const taskIdx = allTasks.findIndex(t => t.id === taskId);
  if (taskIdx === -1) return;

  const originalStatus = allTasks[taskIdx].status;
  
  // Optimistic UI update
  allTasks[taskIdx].status = newStatus;
  renderKanbanBoard();

  try {
    await moveEventTask(currentEventId, taskId, newStatus);
    showToast("Tarea movida exitosamente.");
  } catch (error) {
    console.error("Error moving task:", error);
    showToast(error.message || "Error al mover la tarea.", "error");
    // Revert
    allTasks[taskIdx].status = originalStatus;
    renderKanbanBoard();
  }
}

function openTaskModal(task = null) {
  const modal = document.getElementById("task-modal");
  const form = document.getElementById("task-form");
  const modalTitle = document.getElementById("task-modal-title");
  
  if (!modal || !form || !modalTitle) return;

  form.reset();
  delete form.dataset.editingId;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const display = document.getElementById("task-dateDisplay");
  const hiddenInput = document.getElementById("task-due-date");

  if (task) {
    modalTitle.textContent = "Editar Tarea";
    form.dataset.editingId = task.id;
    document.getElementById("task-title").value = task.title;
    document.getElementById("task-description").value = task.description || "";
    document.getElementById("task-priority").value = task.priority;
    if (hiddenInput) hiddenInput.value = task.due_date;
    if (display) {
      const dt = new Date(task.due_date + 'T12:00:00');
      display.querySelector('span').textContent = dt.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    }
  } else {
    modalTitle.textContent = "Nueva Tarea";
    if (hiddenInput) hiddenInput.value = tomorrowStr;
    if (display) {
      display.querySelector('span').textContent = tomorrow.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    }
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  setTimeout(() => document.getElementById("task-title").focus(), 100);
}

function closeTaskModal() {
  const modal = document.getElementById("task-modal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

export function initTasksPage(eventId) {
  currentEventId = eventId;

  renderSkeletonCards("tasks-todo", 2);
  renderSkeletonCards("tasks-in_progress", 1);
  renderSkeletonCards("tasks-done", 1);

  loadTasks(eventId);

  if (window.initCalendar) window.initCalendar('task', 'task-due-date', 'task-dateDisplay');

  const btnAddTask = document.getElementById("btn-add-task");
  const btnCancelTask = document.getElementById("btn-cancel-task");
  const btnCloseModal = document.getElementById("close-task-modal");
  const taskModal = document.getElementById("task-modal");
  const taskForm = document.getElementById("task-form");

  if (btnAddTask) btnAddTask.onclick = () => openTaskModal();
  if (btnCancelTask) btnCancelTask.onclick = closeTaskModal;
  if (btnCloseModal) btnCloseModal.onclick = closeTaskModal;
  if (taskModal) {
    taskModal.onclick = (e) => {
      if (e.target === taskModal) closeTaskModal();
    };
  }

  if (taskForm) {
    taskForm.onsubmit = async (e) => {
      e.preventDefault();
      
      const submitBtn = taskForm.querySelector('button[type="submit"]');
      const title = document.getElementById("task-title").value.trim();
      const description = document.getElementById("task-description").value.trim();
      const priority = document.getElementById("task-priority").value;
      const due_date = document.getElementById("task-due-date").value;

      if (!title || !due_date) {
        showToast("Por favor complete los campos obligatorios.", "error");
        return;
      }

      const taskData = {
        title,
        description: description || null,
        priority,
        due_date
      };

      submitBtn.disabled = true;
      submitBtn.textContent = "Guardando...";

      try {
        const editingId = taskForm.dataset.editingId;
        if (editingId) {
          const updatedTask = await updateEventTask(eventId, editingId, taskData);
          allTasks = allTasks.map(t => t.id === editingId ? updatedTask : t);
          showToast("Tarea actualizada exitosamente.");
        } else {
          const newTask = await createEventTask(eventId, taskData);
          allTasks.push(newTask);
          showToast("Tarea creada exitosamente.");
        }
        
        closeTaskModal();
        renderKanbanBoard();
      } catch (err) {
        console.error("Error saving task:", err);
        showToast(err.message || "Error al guardar la tarea.", "error");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Guardar Tarea";
      }
    };
  }

  const zones = document.querySelectorAll(".task-list-dropzone");
  zones.forEach(zone => {
    zone.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      zone.classList.add("bg-[#F5EDD6]/20", "border-2", "border-dashed", "border-[#C9A84C]/40");
    });

    zone.addEventListener("dragleave", () => {
      zone.classList.remove("bg-[#F5EDD6]/20", "border-2", "border-dashed", "border-[#C9A84C]/40");
    });

    zone.addEventListener("drop", async (e) => {
      e.preventDefault();
      zone.classList.remove("bg-[#F5EDD6]/20", "border-2", "border-dashed", "border-[#C9A84C]/40");
      
      const taskId = e.dataTransfer.getData("text/plain");
      const column = zone.closest("[data-status]");
      if (!column) return;

      const targetStatus = column.dataset.status;
      await moveTaskStatus(taskId, targetStatus);
    });
  });
}

async function loadTasks(eventId) {
  try {
    allTasks = await getEventTasks(eventId);
    renderKanbanBoard();
  } catch (error) {
    console.error("Error loading tasks:", error);
    showToast("Error al cargar las tareas del evento.", "error");
    
    const columns = ["tasks-todo", "tasks-in_progress", "tasks-done"];
    columns.forEach(colId => {
      const el = document.getElementById(colId);
      if (el) {
        el.innerHTML = `
          <div class="text-center py-6 text-red-500 text-xs">
            No se pudieron cargar las tareas.
          </div>
        `;
      }
    });
  }
}
