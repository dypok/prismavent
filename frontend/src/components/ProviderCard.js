import { icon } from './Icons.js';

export function ProviderCard(provider) {
  const starsHtml = (rating) => {
    const full = Math.floor(rating || 0);
    const half = (rating || 0) % 1 >= 0.5;
    return Array.from({ length: 5 }, (_, i) => {
      if (i < full) return `<span class="text-amber-400 text-lg">&#9733;</span>`;
      if (i === full && half) return `<span class="text-amber-400 text-lg">&#9733;</span>`;
      return `<span class="text-gray-300 text-lg">&#9733;</span>`;
    }).join('');
  };

  return `
    <div class="bg-white rounded-2xl border border-[#E9E1D7] overflow-hidden shadow-sm hover:shadow-md transition-all duration-200" data-provider-id="${provider.id}">
      <div class="h-48 bg-gradient-to-br from-[#FEF3C7] to-[#F8F5F0] flex items-center justify-center overflow-hidden">
        ${provider.image_url
          ? `<img src="${provider.image_url}" alt="${provider.name}" class="w-full h-full object-cover">`
          : `<span class="text-6xl opacity-30">🏢</span>`
        }
      </div>
      <div class="p-5 space-y-3">
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <h3 class="text-lg font-bold text-[#1E1B15] truncate">${provider.name}</h3>
            <span class="inline-block mt-1 px-3 py-0.5 text-xs font-medium bg-[#FEF3C7] text-[#755B00] rounded-full">${provider.category_name || provider.category || 'General'}</span>
          </div>
          <div class="text-right ml-3 shrink-0">
            <div class="text-lg font-bold text-[#755B00]">$${provider.reference_price ? Number(provider.reference_price).toLocaleString() : '—'}</div>
            <div class="text-xs text-[#9E8E6E]">ref.</div>
          </div>
        </div>

        <p class="text-sm text-[#4D4637] line-clamp-2 leading-relaxed">${provider.description || 'Sin descripción disponible.'}</p>

        <div class="flex items-center gap-1.5 text-sm text-[#9E8E6E]">
          ${icon('map-pin', 14)}
          <span class="truncate">${provider.location || 'Ubicación no especificada'}</span>
        </div>

        <div class="flex items-center gap-1">
          ${starsHtml(provider.rating)}
          <span class="text-xs text-[#9E8E6E] ml-1">(${provider.rating || 0})</span>
        </div>

        <div class="flex gap-2 pt-2">
          <button class="view-provider-profile flex-1 py-2.5 rounded-xl border border-[#755B00] text-[#755B00] text-sm font-semibold hover:bg-[#FEF3C7] transition-all cursor-pointer" data-id="${provider.id}">
            Ver perfil
          </button>
          <button class="quote-provider flex-1 py-2.5 rounded-xl bg-[#755B00] text-white text-sm font-semibold hover:bg-[#5F4A00] transition-all cursor-pointer" data-id="${provider.id}">
            Cotizar
          </button>
        </div>
      </div>
    </div>
  `;
}
