import { getUserName } from "../utils/authUtils.js";
import api from "../service/api.js";
import { showToast } from "./Toast.js";
import { icon } from "./Icons.js";

window.toggleProfile = function(e) {
  e.stopPropagation();
  const popover = document.getElementById("profile-popover");
  if (!popover) return;
  popover.classList.toggle("hidden");
  popover.classList.toggle("flex");
};

window.closeProfile = function(e) {
  const popover = document.getElementById("profile-popover");
  const btn = document.getElementById("btn-toggle-profile");
  if (!popover || !btn) return;
  if (!popover.contains(e.target) && !btn.contains(e.target)) {
    popover.classList.add("hidden");
    popover.classList.remove("flex");
  }
};

document.addEventListener("click", function(e) {
  const popover = document.getElementById("profile-popover");
  if (!popover || popover.classList.contains("hidden")) return;
  window.closeProfile(e);
});

window.submitProfile = async function(e) {
  e.preventDefault();
  const name = document.getElementById("popover-name").value.trim();
  const password = document.getElementById("popover-password").value;
  const confirmPassword = document.getElementById("popover-confirm").value;
  const errorEl = document.getElementById("popover-error");
  const submitBtn = document.getElementById("popover-submit");
  const popover = document.getElementById("profile-popover");

  if (!errorEl || !submitBtn || !popover) return;
  errorEl.classList.add("hidden");

  if (password && password !== confirmPassword) {
    errorEl.textContent = "Las contraseñas no coinciden.";
    errorEl.classList.remove("hidden");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Guardando...";

  try {
    await api.updateProfile(name || null, password || null);
    showToast("Perfil actualizado correctamente");
    if (name) {
      const topbarName = document.getElementById("topbar-user-name");
      if (topbarName) topbarName.textContent = name;
    }
    document.getElementById("popover-password").value = "";
    document.getElementById("popover-confirm").value = "";
    popover.classList.add("hidden");
    popover.classList.remove("flex");
  } catch (error) {
    errorEl.textContent = error.message || "Error al actualizar perfil.";
    errorEl.classList.remove("hidden");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Guardar";
  }
};

export function Topbar(leftContent = "") {
  const userName = getUserName();
  
  const currentHour = new Date().getHours();
  let greeting = "Buenos días";
  
  if (currentHour >= 12 && currentHour < 19) {
    greeting = "Buenas tardes";
  } else if (currentHour >= 19 || currentHour < 5) {
    greeting = "Buenas noches";
  }

  return `
    <header class="flex justify-between items-center h-16 lg:h-20 px-4 lg:px-12 bg-[#FFF8F1]">
      
      <div class="flex items-center gap-3 min-w-0">
        <button id="sidebar-toggle" onclick="toggleSidebar()" class="md:hidden w-10 h-10 bg-white rounded-xl shadow-sm border border-[#E9E1D7] flex items-center justify-center text-[#755B00] hover:bg-[#FEF3C7] transition-all duration-200 cursor-pointer shrink-0">
          ${icon('menu', 20)}
        </button>
        <div class="flex flex-col justify-center min-w-0">
          ${leftContent}
        </div>
      </div>

      <div class="flex items-center gap-2 lg:gap-4 shrink-0">
        <p class="text-xs lg:text-sm text-[#4D4637] hidden sm:block">
          ${greeting}, <span id="topbar-user-name" class="font-semibold text-[#1E1B15]">${userName}</span>
        </p>

        <div class="relative">
          <button id="btn-toggle-profile" onclick="toggleProfile(event)" class="cursor-pointer text-[#9E8E6E] hover:text-[#1E1B15] transition-colors p-2 rounded-xl hover:bg-white border border-transparent hover:border-[#E9E1D7] flex items-center justify-center">
            ${icon('settings', 20)}
          </button>

          <div id="profile-popover" class="absolute right-0 top-full mt-3 w-72 md:w-80 bg-white rounded-2xl shadow-xl border border-[#E9E1D7] hidden flex-col p-4 md:p-6 z-50 animate-fade-in origin-top-right">
            
            <h3 class="text-lg font-bold text-[#1E1B15] mb-1">Ajustes de Perfil</h3>
            <p class="text-xs text-[#9E8E6E] mb-5">Actualiza tu información personal</p>

            <form id="profile-form-inline" onsubmit="submitProfile(event)" class="space-y-4">
              <div>
                <label class="block text-[10px] font-semibold tracking-widest text-[#4D4637] mb-1.5 uppercase">Nombre</label>
                <input 
                  type="text" 
                  id="popover-name" 
                  value="${userName || ''}"
                  placeholder="Tu nombre"
                  class="w-full px-3 py-2 border border-[#E9E1D7] rounded-xl focus:border-[#755B00] focus:outline-none text-sm bg-white"
                >
              </div>

              <div>
                <label class="block text-[10px] font-semibold tracking-widest text-[#4D4637] mb-1.5 uppercase">Nueva Contraseña</label>
                <input 
                  type="password" 
                  id="popover-password" 
                  placeholder="Dejar en blanco para no cambiar"
                  class="w-full px-3 py-2 border border-[#E9E1D7] rounded-xl focus:border-[#755B00] focus:outline-none text-sm bg-white"
                >
              </div>

              <div>
                <label class="block text-[10px] font-semibold tracking-widest text-[#4D4637] mb-1.5 uppercase">Confirmar Contraseña</label>
                <input 
                  type="password" 
                  id="popover-confirm" 
                  placeholder="Repite la nueva contraseña"
                  class="w-full px-3 py-2 border border-[#E9E1D7] rounded-xl focus:border-[#755B00] focus:outline-none text-sm bg-white"
                >
              </div>

              <p id="popover-error" class="hidden text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-100"></p>

              <div class="pt-2">
                <button type="submit" id="popover-submit" class="w-full py-2.5 bg-[#755B00] hover:bg-[#5A4700] text-white font-semibold rounded-xl text-sm transition-colors shadow-sm">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </header>
  `;
}