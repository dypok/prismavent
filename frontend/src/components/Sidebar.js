import dashboardIcon from "../assets/icons/dashboard_icon.svg";
import eventsIcon from "../assets/icons/events_icon.svg";
import providersIcon from "../assets/icons/providers_icon.svg";
import historyIcon from "../assets/icons/history_icon.svg";

export function Sidebar(active = "new-event") {
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
              class="flex items-center gap-3 px-6 py-3.5 rounded-xl hover:bg-white transition cursor-pointer">
            <img src="${dashboardIcon}" class="w-5 h-5" alt="Dashboard">
            <span class="font-medium text-[#1E1B15]">Dashboard</span>
          </li>

          <li onclick="navigateTo('/events')" 
              class="flex items-center gap-3 px-6 py-3.5 rounded-xl hover:bg-white transition cursor-pointer">
            <img src="${eventsIcon}" class="w-5 h-5" alt="My Events">
            <span class="font-medium text-[#1E1B15]">My Events</span>
          </li>

          <!-- New Event Activo -->
          <li onclick="navigateTo('/events/new')" 
              class="flex items-center gap-3 px-6 py-3.5 bg-[#FEF3C7] border-l-4 border-[#755B00] text-[#755B00] font-semibold rounded-xl cursor-pointer hover:bg-[#FDE68A]">
            <span class="text-xl">✚</span>
            <span class="font-display">New Event</span>
          </li>

          <li onclick="navigateTo('/providers')" 
              class="flex items-center gap-3 px-6 py-3.5 rounded-xl hover:bg-white transition cursor-pointer">
            <img src="${providersIcon}" class="w-5 h-5" alt="Providers">
            <span class="font-medium text-[#1E1B15]">Providers</span>
          </li>

          <li onclick="navigateTo('/history')" 
              class="flex items-center gap-3 px-6 py-3.5 rounded-xl hover:bg-white transition cursor-pointer">
            <img src="${historyIcon}" class="w-5 h-5" alt="History">
            <span class="font-medium text-[#1E1B15]">History</span>
          </li>
        </ul>
      </nav>

      <!-- Perfil -->
      <div class="mt-auto p-6 border-t border-[#E9E1D7]">
        <div class="flex items-center gap-3 mb-6 px-3">
          <div class="w-10 h-10 bg-[#C9A84C] text-[#1C1A17] rounded-full flex items-center justify-center font-bold text-xl">C</div>
          <div>
            <p class="font-medium text-[#1E1B15]">Carlos</p>
            <p class="text-xs text-[#9E8E6E]">Event Director</p>
          </div>
        </div>
      </div>
    </aside>
  `;
}

window.navigateTo = function(path) {
  window.history.pushState({}, "", path);
  window.location.reload();
};