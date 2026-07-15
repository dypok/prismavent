import dashboardIcon from "../assets/icons/dashboard_icon.svg";
import eventsIcon from "../assets/icons/events_icon.svg";
import providersIcon from "../assets/icons/providers_icon.svg";
import historyIcon from "../assets/icons/history_icon.svg";
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
    <aside class="w-72 min-h-screen bg-[#FFF8F1] border-r border-[#E9E1D7] flex flex-col">
      
      <!-- Logo -->
      <div class="px-8 pt-10 pb-8">
        <h1 class="font-display text-3xl tracking-tight text-[#755B00]">Prismavent</h1>
        <p class="text-[#9E8E6E] text-sm mt-1 tracking-widest">Event Planning</p>
      </div>

      <!-- Menú -->
      <nav class="flex-1 px-3">
        <ul class="space-y-1">
          <li onclick="navigateTo('/dashboard')" 
              class="flex items-center gap-3 px-6 py-3.5 rounded-xl hover:bg-white transition-all duration-300 cursor-pointer
              ${isActive('/dashboard') ? 'bg-[#FEF3C7] border-l-4 border-[#755B00] text-[#755B00] font-semibold' : 'text-[#1E1B15]'}">
            <img src="${dashboardIcon}" class="w-5 h-5" alt="Dashboard">
            <span class="font-medium">Dashboard</span>
          </li>

          <li onclick="navigateTo('/events')" 
              class="flex items-center gap-3 px-6 py-3.5 rounded-xl hover:bg-white transition-all duration-300 cursor-pointer
              ${isActive('/events') ? 'bg-[#FEF3C7] border-l-4 border-[#755B00] text-[#755B00] font-semibold' : 'text-[#1E1B15]'}">
            <img src="${eventsIcon}" class="w-5 h-5" alt="My Events">
            <span class="font-medium">Mis Eventos</span>
          </li>

          <li onclick="navigateTo('/events/new')" 
              class="flex items-center gap-3 px-6 py-3.5 rounded-xl hover:bg-white transition-all duration-300 cursor-pointer
              ${isActive('/events/new') ? 'bg-[#FEF3C7] border-l-4 border-[#755B00] text-[#755B00] font-semibold' : 'text-[#1E1B15]'}">
            <span class="text-xl">✚</span>
            <span class="font-display">New Event</span>
          </li>

          <li onclick="navigateTo('/providers')" 
              class="flex items-center gap-3 px-6 py-3.5 rounded-xl hover:bg-white transition-all duration-300 cursor-pointer
              ${isActive('/providers') ? 'bg-[#FEF3C7] border-l-4 border-[#755B00] text-[#755B00] font-semibold' : 'text-[#1E1B15]'}">
            <img src="${providersIcon}" class="w-5 h-5" alt="Providers">
            <span class="font-medium">Providers</span>
          </li>

          <li onclick="navigateTo('/history')" 
              class="flex items-center gap-3 px-6 py-3.5 rounded-xl hover:bg-white transition-all duration-300 cursor-pointer
              ${isActive('/history') ? 'bg-[#FEF3C7] border-l-4 border-[#755B00] text-[#755B00] font-semibold' : 'text-[#1E1B15]'}">
            <img src="${historyIcon}" class="w-5 h-5" alt="History">
            <span class="font-medium">History</span>
          </li>
        </ul>
      </nav>

      <!-- Solo Cerrar Sesión -->
      <div class="mt-auto p-6 border-t border-[#E9E1D7]">
        <button onclick="window.handleLogout()" class="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-[#9E8E6E] hover:text-[#755B00] hover:bg-[#FEF3C7] rounded-xl transition text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
          Cerrar Sesión
        </button>
      </div>
    </aside>
  `;
}

window.navigateTo = function(path) {
  window.history.pushState({}, "", path);
window.navigateTo = function(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
};
};