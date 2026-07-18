import { icon } from './Icons.js';
import { showToast } from './Toast.js';

window.closeProviderDrawer = function () {
  const panel = document.getElementById("drawer-panel");
  const overlay = document.getElementById("drawer-overlay");
  if (panel) panel.classList.add("translate-x-full");
  setTimeout(() => {
    if (overlay) overlay.classList.add("hidden");
  }, 300);
};

function starsHtml(rating) {
  const full = Math.floor(Number(rating) || 0);
  const half = (Number(rating) || 0) % 1 >= 0.5;
  return Array.from({ length: 5 }, (_, i) => {
    if (i < full) return `<span class="text-amber-400 text-lg">&#9733;</span>`;
    if (i === full && half) return `<span class="text-amber-400 text-lg">&#9733;</span>`;
    return `<span class="text-gray-300 text-lg">&#9733;</span>`;
  }).join('');
}

export function openProviderDrawer(provider, categoryName) {
  const overlay = document.getElementById("drawer-overlay");
  const panel = document.getElementById("drawer-panel");
  if (!overlay || !panel) return;

  const price = provider.reference_price != null
    ? `$${Number(provider.reference_price).toLocaleString()}`
    : null;

  const content = document.getElementById("drawer-content");

  content.innerHTML = `
    <div class="h-full flex flex-col">
      <div class="flex items-center justify-between p-6 border-b border-[#E9E1D7] shrink-0">
        <h2 class="text-xl font-bold text-[#1E1B15] truncate pr-2">${provider.name}</h2>
        <button onclick="closeProviderDrawer()" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F8F5F0] transition-colors cursor-pointer shrink-0">
          ${icon('x', 18)}
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-6">

        <div class="flex items-center gap-2">
          <span class="px-4 py-1 text-sm font-medium bg-[#FEF3C7] text-[#755B00] rounded-full">${categoryName || 'General'}</span>
          <div class="flex items-center gap-1 ml-auto">
            ${starsHtml(provider.rating)}
            <span class="text-sm text-[#9E8E6E] ml-1">(${Number(provider.rating) || 0})</span>
          </div>
        </div>

        ${provider.description ? `
          <div>
            <h3 class="text-xs font-semibold tracking-widest text-[#9E8E6E] uppercase mb-2">Descripción</h3>
            <p class="text-sm text-[#4D4637] leading-relaxed">${provider.description}</p>
          </div>
        ` : ''}

        ${provider.city_name || provider.address ? `
          <div>
            <h3 class="text-xs font-semibold tracking-widest text-[#9E8E6E] uppercase mb-2">Ubicación</h3>
            <div class="flex items-center gap-2 text-sm text-[#4D4637]">
              ${icon('map-pin', 16, 'text-[#9E8E6E] shrink-0')}
              <span>${[provider.city_name, provider.address].filter(Boolean).join(', ')}</span>
            </div>
          </div>
        ` : ''}

        ${price ? `
          <div>
            <h3 class="text-xs font-semibold tracking-widest text-[#9E8E6E] uppercase mb-2">Precio referencial</h3>
            <div class="flex items-center gap-2">
              ${icon('dollar-sign', 16, 'text-[#755B00] shrink-0')}
              <span class="text-xl font-bold text-[#755B00]">${price}</span>
              ${provider.price_unit ? `<span class="text-sm text-[#9E8E6E]">${provider.price_unit}</span>` : ''}
            </div>
          </div>
        ` : ''}

        ${provider.phone ? `
          <div>
            <h3 class="text-xs font-semibold tracking-widest text-[#9E8E6E] uppercase mb-2">Teléfono</h3>
            <p class="text-sm text-[#4D4637]">${provider.phone}</p>
          </div>
        ` : ''}

        ${provider.website ? `
          <div>
            <h3 class="text-xs font-semibold tracking-widest text-[#9E8E6E] uppercase mb-2">Sitio web</h3>
            <a href="${provider.website}" target="_blank" rel="noopener noreferrer" class="text-sm text-[#755B00] hover:underline break-all">${provider.website}</a>
          </div>
        ` : ''}

      </div>

      <div class="p-6 border-t border-[#E9E1D7] shrink-0 space-y-2">
        <button onclick="window.addToEventFromCard(this)" class="add-to-event w-full py-3 rounded-xl bg-[#755B00] text-white font-semibold hover:bg-[#5F4A00] transition-all cursor-pointer" data-provider-name="${provider.name.replace(/"/g, '&quot;')}" data-provider-price="${provider.reference_price ?? ''}">
          A\u00f1adir a mi evento
        </button>
        <button onclick="window.showQuoteModal()" class="w-full py-2 rounded-xl border border-gray-200 text-[#9E8E6E] text-sm font-medium hover:bg-[#F8F5F0] transition-all cursor-pointer">
          Cotizar
        </button>
      </div>
    </div>
  `;

  overlay.classList.remove("hidden");
  overlay.classList.add("flex");

  requestAnimationFrame(() => {
    panel.classList.remove("translate-x-full");
  });
}

export function ProviderDrawer() {
  return `
    <div id="drawer-overlay" onclick="closeProviderDrawer()" class="fixed inset-0 bg-black/40 z-50 hidden items-center justify-end animate-fade-in">
      <div id="drawer-panel" onclick="event.stopPropagation()" class="h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 translate-x-full">
        <div id="drawer-content" class="h-full"></div>
      </div>
    </div>
  `;
}
