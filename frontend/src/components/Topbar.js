import { getUserName } from "../utils/authUtils.js";
import api from "../service/api.js";
import { showToast } from "./Toast.js";
import { icon } from "./Icons.js";

export function Topbar(leftContent = "") {
  const userName = getUserName();
  
  const currentHour = new Date().getHours();
  let greeting = "Buenos días";
  
  if (currentHour >= 12 && currentHour < 19) {
    greeting = "Buenas tardes";
  } else if (currentHour >= 19 || currentHour < 5) {
    greeting = "Buenas noches";
  }

  // Agregamos listeners una vez que el Topbar está en el DOM
  setTimeout(() => {
    const btnToggle = document.getElementById("btn-toggle-profile");
    const popover = document.getElementById("profile-popover");
    const form = document.getElementById("profile-form-inline");

    if (btnToggle && popover) {
      // Toggle popover
      btnToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        popover.classList.toggle("hidden");
        popover.classList.toggle("flex");
      });

      // Cerrar si se hace clic fuera del popover
      document.addEventListener("click", (e) => {
        if (!popover.contains(e.target) && !btnToggle.contains(e.target)) {
          popover.classList.add("hidden");
          popover.classList.remove("flex");
        }
      });
    }

    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const name = document.getElementById("popover-name").value.trim();
        const password = document.getElementById("popover-password").value;
        const confirmPassword = document.getElementById("popover-confirm").value;
        const errorEl = document.getElementById("popover-error");
        const submitBtn = document.getElementById("popover-submit");

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
          
          // Cerrar popover
          popover.classList.add("hidden");
          popover.classList.remove("flex");
        } catch (error) {
          errorEl.textContent = error.message || "Error al actualizar perfil.";
          errorEl.classList.remove("hidden");
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = "Guardar";
        }
      });
    }
  }, 0);

  return `
    <header class="flex justify-between items-center h-20 px-8 lg:px-12 bg-[#FFF8F1]">
      
      <div class="flex flex-col justify-center">
        ${leftContent}
      </div>

      <div class="flex items-center">
        <p class="text-sm text-[#4D4637] mr-6">
          ${greeting}, <span id="topbar-user-name" class="font-semibold text-[#1E1B15]">${userName}</span>
        </p>

        <div class="relative">
          <button id="btn-toggle-profile" class="cursor-pointer text-[#9E8E6E] hover:text-[#1E1B15] transition-colors p-2 rounded-xl hover:bg-white border border-transparent hover:border-[#E9E1D7] flex items-center justify-center">
            ${icon('settings', 20)}
          </button>

          <!-- Menú Popover de Perfil -->
          <div id="profile-popover" class="absolute right-0 top-full mt-3 w-80 bg-white rounded-2xl shadow-xl border border-[#E9E1D7] hidden flex-col p-6 z-50 animate-fade-in origin-top-right">
            
            <h3 class="text-lg font-bold text-[#1E1B15] mb-1">Ajustes de Perfil</h3>
            <p class="text-xs text-[#9E8E6E] mb-5">Actualiza tu información personal</p>

            <form id="profile-form-inline" class="space-y-4">
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