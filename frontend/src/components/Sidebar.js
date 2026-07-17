import logoIcon from "../assets/icons/logo.png";
import { logout } from "../utils/authUtils.js";
import { icon } from "./Icons.js";

window.handleLogout = function () {
  logout();
  window.history.pushState({}, "", "/login");
  window.dispatchEvent(new PopStateEvent("popstate"));
};

window.toggleSidebar = function () {
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("sidebar-backdrop");
  if (!sidebar || !backdrop) return;
  const isOpen = sidebar.getAttribute("data-sidebar-open") === "true";
  sidebar.setAttribute("data-sidebar-open", isOpen ? "false" : "true");
  backdrop.classList.toggle("hidden", isOpen);
  document.body.classList.toggle("overflow-hidden", !isOpen);
};

window.closeSidebar = function () {
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("sidebar-backdrop");
  if (!sidebar || !backdrop) return;
  sidebar.setAttribute("data-sidebar-open", "false");
  backdrop.classList.add("hidden");
  document.body.classList.remove("overflow-hidden");
};

window.addEventListener("resize", function () {
  if (window.innerWidth >= 768) {
    const sidebar = document.getElementById("sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");
    if (sidebar) sidebar.setAttribute("data-sidebar-open", "false");
    if (backdrop) backdrop.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
  }
});

export function Sidebar(active = "new-event") {
  document.body.classList.remove("overflow-hidden");

  const currentPath = window.location.pathname;

  const isActive = (path) => {
    if (path === '/dashboard' && (currentPath === '/dashboard' || currentPath === '/home')) return true;
    if (path === '/events' && (currentPath === '/events' || currentPath === '/my-events')) return true;
    if (path === '/events/new' && currentPath === '/events/new') return true;
    if (path === '/providers' && currentPath === '/providers') return true;
    if (path === '/history' && currentPath === '/history') return true;
    return false;
  };

  // Helper para generar el ícono usando CSS Mask (adopta el color del texto automáticamente)
  const renderIcon = (name) => {
    const url = `https://api.iconify.design/lucide/${name}.svg?stroke-width=2`;
    return `<div class="w-5 h-5 shrink-0 transition-colors duration-300" style="background-color: currentColor; mask: url('${url}') no-repeat center / contain; -webkit-mask: url('${url}') no-repeat center / contain;"></div>`;
  };

  return `
    <div id="sidebar-backdrop" onclick="closeSidebar()" class="fixed inset-0 z-40 bg-black/50 hidden md:hidden"></div>

    <aside id="sidebar" data-sidebar-open="false" class="fixed md:sticky top-0 left-0 h-screen bg-[#FFF8F1] border-r border-[#E9E1D7] flex flex-col overflow-hidden shrink-0 z-40">
      
      <!-- Logo -->
      <div class="h-24 pt-8 pb-4 flex items-center justify-center overflow-hidden shrink-0">
        <img src="${logoIcon}" alt="Prismavent" class="w-10 h-auto object-contain drop-shadow-sm">
      </div>

      <!-- Menú de Navegación -->
      <nav class="flex-1">
        <ul class="space-y-1">
          <li onclick="navigateTo('/dashboard')" 
              class="nav-item hover:bg-white hover:text-[#755B00] 
              ${isActive('/dashboard') ? 'bg-[#FEF3C7] text-[#755B00] font-semibold' : 'text-[#1E1B15]'}">
            <span class="icon-wrap">${icon('layout', 20)}</span>
            <span class="nav-label">Dashboard</span>
          </li>

          <li onclick="navigateTo('/events')" 
              class="nav-item hover:bg-white hover:text-[#755B00] 
              ${isActive('/events') ? 'bg-[#FEF3C7] text-[#755B00] font-semibold' : 'text-[#1E1B15]'}">
            <span class="icon-wrap">${icon('calendar', 20)}</span>
            <span class="nav-label">Mis Eventos</span>
          </li>

          <li onclick="navigateTo('/events/new')" 
              class="nav-item hover:bg-white hover:text-[#755B00] 
              ${isActive('/events/new') ? 'bg-[#FEF3C7] text-[#755B00] font-semibold' : 'text-[#1E1B15]'}">
            <span class="icon-wrap">${icon('plus', 20)}</span>
            <span class="nav-label">New Event</span>
          </li>

          <li onclick="navigateTo('/providers')" 
              class="nav-item hover:bg-white hover:text-[#755B00] 
              ${isActive('/providers') ? 'bg-[#FEF3C7] text-[#755B00] font-semibold' : 'text-[#1E1B15]'}">
            <span class="icon-wrap">${icon('store', 20)}</span>
            <span class="nav-label">Providers</span>
          </li>

          <li onclick="navigateTo('/history')" 
              class="nav-item hover:bg-white hover:text-[#755B00] 
              ${isActive('/history') ? 'bg-[#FEF3C7] text-[#755B00] font-semibold' : 'text-[#1E1B15]'}">
            <span class="icon-wrap">${icon('clock', 20)}</span>
            <span class="nav-label">History</span>
          </li>
        </ul>
      </nav>

      <!-- Botón de Cerrar Sesión -->
      <div class="logout-area mt-auto border-t border-[#E9E1D7] overflow-hidden shrink-0">
        <button onclick="window.handleLogout()" class="logout-btn text-[#9E8E6E] hover:text-[#755B00] hover:bg-[#FEF3C7] rounded-xl text-sm font-medium cursor-pointer">
          <span class="icon-wrap">${icon('log-out', 20)}</span>
          <span class="nav-label">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  `;
}

window.navigateTo = function(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
};
