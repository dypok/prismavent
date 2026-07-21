export function AddToEventModal() {
  return `
    <div
      id="add-to-event-modal"
      onclick="this.classList.add('hidden'); this.classList.remove('flex');"
      class="fixed inset-0 bg-black/40 hidden items-center justify-center z-50 animate-fade-in backdrop-blur-sm"
    >
      <div onclick="event.stopPropagation()" class="bg-white rounded-3xl p-4 lg:p-6 w-full max-w-md mx-4 shadow-2xl animate-scale-in">

        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-[#1E1B15]">A\u00f1adir a evento</h2>
          <button
            id="close-add-to-event"
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F8F5F0] transition-colors cursor-pointer shrink-0 text-[#9E8E6E] hover:text-[#1E1B15]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div id="add-to-event-content" class="space-y-3 max-h-80 overflow-y-auto">

        </div>

      </div>
    </div>
  `;
}
