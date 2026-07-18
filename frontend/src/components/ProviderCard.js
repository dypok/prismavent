import { icon } from './Icons.js';

export function ProviderCard(provider, categoryName) {
  const starsHtml = (rating) => {
    const full = Math.floor(Number(rating) || 0);
    const half = (Number(rating) || 0) % 1 >= 0.5;
    return Array.from({ length: 5 }, (_, i) => {
      if (i < full) return `<span class="text-amber-400 text-lg">&#9733;</span>`;
      if (i === full && half) return `<span class="text-amber-400 text-lg">&#9733;</span>`;
      return `<span class="text-gray-300 text-lg">&#9733;</span>`;
    }).join('');
  };

  const price = provider.reference_price != null
    ? `$${Number(provider.reference_price).toLocaleString()}`
    : null;

  return `
    <div class="bg-white rounded-2xl border border-[#E9E1D7] overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 h-full flex flex-col" data-provider-id="${provider.id}">
      <div class="h-40 bg-gradient-to-br from-[#FEF3C7] to-[#F8F5F0] flex items-center justify-center shrink-0">
        ${icon('store', 48, 'opacity-30 text-[#755B00]')}
      </div>
      <div class="p-5 flex-1 flex flex-col gap-3">
        <div>
          <h3 class="text-lg font-bold text-[#1E1B15] truncate">${provider.name}</h3>
          <span class="inline-block mt-1 px-3 py-0.5 text-xs font-medium bg-[#FEF3C7] text-[#755B00] rounded-full">${categoryName || 'General'}</span>
        </div>

        <p class="text-sm text-[#4D4637] line-clamp-2 leading-relaxed flex-1">${provider.description || 'Sin descripción disponible.'}</p>

        ${provider.address ? `
          <div class="flex items-center gap-1.5 text-sm text-[#9E8E6E]">
            ${icon('map-pin', 14)}
            <span class="truncate">${provider.address}</span>
          </div>
        ` : ''}

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1">
            ${starsHtml(provider.rating)}
            <span class="text-xs text-[#9E8E6E] ml-1">(${Number(provider.rating) || 0})</span>
          </div>
          ${price ? `
            <div class="text-right shrink-0">
              <div class="text-lg font-bold text-[#755B00]">${price}</div>
              <div class="text-xs text-[#9E8E6E]">ref.</div>
            </div>
          ` : ''}
        </div>

        <div class="flex flex-col gap-2 pt-2">
          <div class="flex gap-2">
            <button class="view-provider-profile flex-1 py-2.5 rounded-xl border border-[#755B00] text-[#755B00] text-sm font-semibold hover:bg-[#FEF3C7] transition-all cursor-pointer" data-id="${provider.id}">
              Ver perfil
            </button>
            <button class="add-to-event flex-1 py-2.5 rounded-xl bg-[#755B00] text-white text-sm font-semibold hover:bg-[#5F4A00] transition-all cursor-pointer" data-provider-name="${provider.name.replace(/"/g, '&quot;')}" data-provider-price="${provider.reference_price ?? ''}">
              A\u00f1adir a mi evento
            </button>
          </div>
          <button onclick="window.showQuoteModal()" class="w-full py-2 rounded-xl border border-gray-200 text-[#9E8E6E] text-xs font-medium hover:bg-[#F8F5F0] transition-all cursor-pointer">
            Cotizar
          </button>
        </div>
      </div>
    </div>
  `;
}
