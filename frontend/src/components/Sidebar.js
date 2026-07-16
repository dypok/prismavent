import dashboardIcon from "../assets/icons/dashboard_icon.svg";
import eventsIcon from "../assets/icons/events_icon.svg";
import providersIcon from "../assets/icons/providers_icon.svg";
import historyIcon from "../assets/icons/history_icon.svg";
import logoIcon from "../assets/icons/prismavent_logo_transparent.png";
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

  return `
    <aside class="w-16 hover:w-64 min-h-screen bg-[#FFF8F1] border-r border-[#E9E1D7] flex flex-col transition-all duration-300 group overflow-hidden shrink-0 z-30">
      
      <!-- Logo -->
      <div class="h-24 pt-8 pb-4 flex items-center justify-center overflow-hidden shrink-0 transition-all duration-300">
        <img src="${logoIcon}" alt="Prismavent" class="w-10 h-auto object-contain transition-all duration-300 drop-shadow-sm">
      </div>

      <!-- Menú de Navegación -->
      <nav class="flex-1">
        <ul class="space-y-1">
          <li onclick="navigateTo('/dashboard')" 
              class="flex items-center gap-4 px-5 group-hover:px-6 py-3.5 hover:bg-white transition-all duration-300 cursor-pointer border-l-4
              ${isActive('/dashboard') ? 'bg-[#FEF3C7] border-[#755B00] text-[#755B00] font-semibold' : 'text-[#1E1B15] border-transparent'}">
            <img src="${dashboardIcon}" class="w-5 h-5 shrink-0" alt="Dashboard">
            <span class="font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Dashboard</span>
          </li>

          <li onclick="navigateTo('/events')" 
              class="flex items-center gap-4 px-5 group-hover:px-6 py-3.5 hover:bg-white transition-all duration-300 cursor-pointer border-l-4
              ${isActive('/events') ? 'bg-[#FEF3C7] border-[#755B00] text-[#755B00] font-semibold' : 'text-[#1E1B15] border-transparent'}">
            <img src="${eventsIcon}" class="w-5 h-5 shrink-0" alt="My Events">
            <span class="font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Mis Eventos</span>
          </li>

          <li onclick="navigateTo('/events/new')" 
              class="flex items-center gap-4 px-5 group-hover:px-6 py-3.5 hover:bg-white transition-all duration-300 cursor-pointer border-l-4
              ${isActive('/events/new') ? 'bg-[#FEF3C7] border-[#755B00] text-[#755B00] font-semibold' : 'text-[#1E1B15] border-transparent'}">
            <span class="text-xl shrink-0 w-5 text-center leading-none">✚</span>
            <span class="font-display opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">New Event</span>
          </li>

          <li onclick="navigateTo('/providers')" 
              class="flex items-center gap-4 px-5 group-hover:px-6 py-3.5 hover:bg-white transition-all duration-300 cursor-pointer border-l-4
              ${isActive('/providers') ? 'bg-[#FEF3C7] border-[#755B00] text-[#755B00] font-semibold' : 'text-[#1E1B15] border-transparent'}">
            <img src="${providersIcon}" class="w-5 h-5 shrink-0" alt="Providers">
            <span class="font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Providers</span>
          </li>

          <li onclick="navigateTo('/history')" 
              class="flex items-center gap-4 px-5 group-hover:px-6 py-3.5 hover:bg-white transition-all duration-300 cursor-pointer border-l-4
              ${isActive('/history') ? 'bg-[#FEF3C7] border-[#755B00] text-[#755B00] font-semibold' : 'text-[#1E1B15] border-transparent'}">
            <img src="${historyIcon}" class="w-5 h-5 shrink-0" alt="History">
            <span class="font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">History</span>
          </li>
        </ul>
      </nav>

      <!-- Botón de Cerrar Sesión -->
      <div class="mt-auto p-2 group-hover:p-4 border-t border-[#E9E1D7] overflow-hidden shrink-0 transition-all duration-300">
        <button onclick="window.handleLogout()" class="w-full flex items-center justify-start gap-4 px-3 group-hover:px-4 py-2.5 text-[#9E8E6E] hover:text-[#755B00] hover:bg-[#FEF3C7] rounded-xl transition text-sm font-medium cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 w-5 h-5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
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