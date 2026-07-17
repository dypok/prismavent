import logoIcon from "../assets/icons/logo.png";
import { logout } from "../utils/authUtils.js";
import { icon } from "./Icons.js";

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

  return `
    <aside class="sticky top-0 left-0 w-16 hover:w-64 h-screen bg-[#FFF8F1] border-r border-[#E9E1D7] flex flex-col transition-all duration-300 group overflow-hidden shrink-0 z-40">
      
      <!-- Logo -->
      <div class="h-24 pt-8 pb-4 flex items-center justify-center overflow-hidden shrink-0 transition-all duration-300">
        <img src="${logoIcon}" alt="Prismavent" class="w-10 h-auto object-contain transition-all duration-300 drop-shadow-sm">
      </div>

      <!-- Menú de Navegación -->
      <nav class="flex-1">
        <ul>
          <li onclick="navigateTo('/dashboard')" 
              class="flex items-center justify-center group-hover:justify-start py-3.5 px-0 group-hover:px-6 hover:bg-white hover:text-[#755B00] transition-all duration-300 cursor-pointer border-l-0 group-hover:border-l-4
              ${isActive('/dashboard') ? 'bg-[#FEF3C7] text-[#755B00] font-semibold border-l-4' : 'text-[#1E1B15] border-transparent'}">
            <div class="flex items-center justify-center w-5 shrink-0">${icon('layout', 20)}</div>
            <span class="font-medium hidden group-hover:inline ml-4 whitespace-nowrap">Dashboard</span>
          </li>

          <li onclick="navigateTo('/events')" 
              class="flex items-center justify-center group-hover:justify-start py-3.5 px-0 group-hover:px-6 hover:bg-white hover:text-[#755B00] transition-all duration-300 cursor-pointer border-l-0 group-hover:border-l-4
              ${isActive('/events') ? 'bg-[#FEF3C7] text-[#755B00] font-semibold border-l-4' : 'text-[#1E1B15] border-transparent'}">
            <div class="flex items-center justify-center w-5 shrink-0">${icon('calendar', 20)}</div>
            <span class="font-medium hidden group-hover:inline ml-4 whitespace-nowrap">Mis Eventos</span>
          </li>

          <li onclick="navigateTo('/events/new')" 
              class="flex items-center justify-center group-hover:justify-start py-3.5 px-0 group-hover:px-6 hover:bg-white hover:text-[#755B00] transition-all duration-300 cursor-pointer border-l-0 group-hover:border-l-4
              ${isActive('/events/new') ? 'bg-[#FEF3C7] text-[#755B00] font-semibold border-l-4' : 'text-[#1E1B15] border-transparent'}">
            <div class="flex items-center justify-center w-5 shrink-0">${icon('plus', 20)}</div>
            <span class="font-medium hidden group-hover:inline ml-4 whitespace-nowrap">New Event</span>
          </li>

          <li onclick="navigateTo('/providers')" 
              class="flex items-center justify-center group-hover:justify-start py-3.5 px-0 group-hover:px-6 hover:bg-white hover:text-[#755B00] transition-all duration-300 cursor-pointer border-l-0 group-hover:border-l-4
              ${isActive('/providers') ? 'bg-[#FEF3C7] text-[#755B00] font-semibold border-l-4' : 'text-[#1E1B15] border-transparent'}">
            <div class="flex items-center justify-center w-5 shrink-0">${icon('store', 20)}</div>
            <span class="font-medium hidden group-hover:inline ml-4 whitespace-nowrap">Providers</span>
          </li>

          <li onclick="navigateTo('/history')" 
              class="flex items-center justify-center group-hover:justify-start py-3.5 px-0 group-hover:px-6 hover:bg-white hover:text-[#755B00] transition-all duration-300 cursor-pointer border-l-0 group-hover:border-l-4
              ${isActive('/history') ? 'bg-[#FEF3C7] text-[#755B00] font-semibold border-l-4' : 'text-[#1E1B15] border-transparent'}">
            <div class="flex items-center justify-center w-5 shrink-0">${icon('clock', 20)}</div>
            <span class="font-medium hidden group-hover:inline ml-4 whitespace-nowrap">History</span>
          </li>
        </ul>
      </nav>

      <!-- Botón de Cerrar Sesión -->
      <div class="mt-auto p-2 group-hover:p-4 border-t border-[#E9E1D7] overflow-hidden shrink-0 transition-all duration-300">
        <button onclick="window.handleLogout()" class="w-full flex items-center justify-center group-hover:justify-start px-0 group-hover:px-4 py-2.5 text-[#9E8E6E] hover:text-[#755B00] hover:bg-[#FEF3C7] rounded-xl transition-all duration-300 text-sm font-medium cursor-pointer">
          <div class="flex items-center justify-center w-5 shrink-0">${icon('log-out', 20)}</div>
          <span class="hidden group-hover:inline ml-4 whitespace-nowrap">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  `;
}

window.navigateTo = function(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
};
