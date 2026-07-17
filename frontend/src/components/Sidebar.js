import logoIcon from "../assets/icons/logo.png";
import { logout } from "../utils/authUtils.js";

window.handleLogout = function () {
  logout();
  window.history.pushState({}, "", "/login");
  window.dispatchEvent(new PopStateEvent("popstate"));
};

export function Sidebar(active = "new-event") {
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
    <aside class="sticky top-0 left-0 w-16 hover:w-64 h-screen bg-[#FFF8F1] border-r border-[#E9E1D7] flex flex-col transition-all duration-300 group overflow-hidden shrink-0 z-40">
      
      <!-- Logo -->
      <div class="h-24 pt-8 pb-4 flex items-center justify-center overflow-hidden shrink-0 transition-all duration-300">
        <img src="${logoIcon}" alt="Prismavent" class="w-10 h-auto object-contain transition-all duration-300 drop-shadow-sm">
      </div>

      <!-- Menú de Navegación -->
      <nav class="flex-1">
        <ul class="space-y-1">
          <li onclick="navigateTo('/dashboard')" 
              class="flex items-center gap-4 px-5 group-hover:px-6 py-3.5 hover:bg-white hover:text-[#755B00] transition-all duration-300 cursor-pointer border-l-4
              ${isActive('/dashboard') ? 'bg-[#FEF3C7] border-[#755B00] text-[#755B00] font-semibold' : 'text-[#1E1B15] border-transparent'}">
            ${renderIcon('layout-dashboard')}
            <span class="font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Dashboard</span>
          </li>

          <li onclick="navigateTo('/events')" 
              class="flex items-center gap-4 px-5 group-hover:px-6 py-3.5 hover:bg-white hover:text-[#755B00] transition-all duration-300 cursor-pointer border-l-4
              ${isActive('/events') ? 'bg-[#FEF3C7] border-[#755B00] text-[#755B00] font-semibold' : 'text-[#1E1B15] border-transparent'}">
            ${renderIcon('calendar-days')}
            <span class="font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Mis Eventos</span>
          </li>

          <li onclick="navigateTo('/events/new')" 
              class="flex items-center gap-4 px-5 group-hover:px-6 py-3.5 hover:bg-white hover:text-[#755B00] transition-all duration-300 cursor-pointer border-l-4
              ${isActive('/events/new') ? 'bg-[#FEF3C7] border-[#755B00] text-[#755B00] font-semibold' : 'text-[#1E1B15] border-transparent'}">
            ${renderIcon('plus-circle')}
            <span class="font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">New Event</span>
          </li>

          <li onclick="navigateTo('/providers')" 
              class="flex items-center gap-4 px-5 group-hover:px-6 py-3.5 hover:bg-white hover:text-[#755B00] transition-all duration-300 cursor-pointer border-l-4
              ${isActive('/providers') ? 'bg-[#FEF3C7] border-[#755B00] text-[#755B00] font-semibold' : 'text-[#1E1B15] border-transparent'}">
            ${renderIcon('store')}
            <span class="font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Providers</span>
          </li>

          <li onclick="navigateTo('/history')" 
              class="flex items-center gap-4 px-5 group-hover:px-6 py-3.5 hover:bg-white hover:text-[#755B00] transition-all duration-300 cursor-pointer border-l-4
              ${isActive('/history') ? 'bg-[#FEF3C7] border-[#755B00] text-[#755B00] font-semibold' : 'text-[#1E1B15] border-transparent'}">
            ${renderIcon('history')}
            <span class="font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">History</span>
          </li>
        </ul>
      </nav>

      <!-- Botón de Cerrar Sesión -->
      <div class="mt-auto p-2 group-hover:p-4 border-t border-[#E9E1D7] overflow-hidden shrink-0 transition-all duration-300">
        <button onclick="window.handleLogout()" class="w-full flex items-center justify-start gap-4 px-3 group-hover:px-4 py-2.5 text-[#9E8E6E] hover:text-[#755B00] hover:bg-[#FEF3C7] rounded-xl transition-all duration-300 text-sm font-medium cursor-pointer">
          ${renderIcon('log-out')}
          <span class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  `;
}

window.navigateTo = function(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
};
