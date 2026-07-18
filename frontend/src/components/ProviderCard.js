const _fmt = (n) => {
  if (n == null) return null;
  return `$${Number(n).toLocaleString('es-CO')}`;
};

function starsHtml(rating) {
  const full = Math.floor(Number(rating) || 0);
  return Array.from({ length: 5 }, (_, i) =>
    `<span class="${i < full ? 'text-amber-400' : 'text-gray-200'} text-sm">${i < full ? '\u2605' : '\u2605'}</span>`
  ).join('');
}

function storeIcon(size, cls) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="${cls}"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`;
}

export function ProviderCard(provider, categoryName) {
  const price = provider.reference_price != null ? _fmt(provider.reference_price) : null;
  const hasContact = provider.address || provider.city_name || provider.phone || provider.website;

  return `
    <div class="bg-white rounded-2xl border border-[#E9E1D7] border-t-4 border-t-[#C9A84C] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col overflow-hidden" data-provider-id="${provider.id}">

      <div class="p-5 flex-1 flex flex-col gap-3">

        <!-- Name + badge -->
        <div>
          <h3 class="text-lg font-bold text-[#1E1B15]">${provider.name}</h3>
          <div class="flex items-center gap-2 mt-1.5">
            <span class="inline-block px-3 py-0.5 text-[11px] font-semibold bg-[#FEF3C7] text-[#755B00] rounded-full uppercase tracking-wider">${categoryName || 'General'}</span>
            <span class="flex items-center gap-1 text-sm text-amber-500">${starsHtml(provider.rating)}</span>
          </div>
        </div>

        <!-- Description -->
        <p class="text-sm text-[#4D4637] leading-relaxed line-clamp-2 flex-1">${provider.description || 'Sin descripción disponible.'}</p>

        <!-- Price row -->
        ${price ? `
          <div class="flex items-center gap-2 bg-[#FEF3C7]/50 rounded-xl px-4 py-2.5">
            ${storeIcon(16, 'text-[#755B00] shrink-0')}
            <span class="text-base font-bold text-[#755B00]">${price}</span>
            ${provider.price_unit ? `<span class="text-xs text-[#9E8E6E]">/${provider.price_unit}</span>` : ''}
          </div>
        ` : ''}

        <!-- Contact info -->
        ${hasContact ? `
          <div class="flex flex-col gap-1.5 text-xs text-[#9E8E6E] pt-0.5">
            ${provider.city_name ? `
              <span class="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>${provider.city_name}</span>
              </span>
            ` : ''}
            ${provider.address && !provider.city_name ? `
              <span class="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span class="truncate">${provider.address}</span>
              </span>
            ` : ''}
            ${provider.phone ? `
              <span class="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>${provider.phone}</span>
              </span>
            ` : ''}
            ${provider.website ? `
              <span class="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                <span class="truncate max-w-[150px]">${provider.website.replace(/^https?:\/\//, '')}</span>
              </span>
            ` : ''}
          </div>
        ` : ''}

        <!-- Actions -->
        <div class="flex flex-col gap-2 pt-2 mt-auto">
          <div class="flex gap-2">
            <button class="view-provider-profile flex-1 py-2.5 rounded-xl border border-[#755B00] text-[#755B00] text-sm font-semibold hover:bg-[#FEF3C7] transition-all cursor-pointer" data-id="${provider.id}">
              Ver perfil
            </button>
            <button class="add-to-event flex-1 py-2.5 rounded-xl bg-[#755B00] text-white text-sm font-semibold hover:bg-[#5F4A00] transition-all cursor-pointer" data-provider-name="${provider.name.replace(/"/g, '&quot;')}" data-provider-price="${provider.reference_price ?? ''}">
              A\u00f1adir a mi evento
            </button>
          </div>
          <button onclick="window.showQuoteModal()" class="w-full py-2 rounded-xl border border-gray-200 text-[#9E8E6E] text-sm font-medium hover:bg-[#F8F5F0] transition-all cursor-pointer">
            Solicitar cotizaci\u00f3n
          </button>
        </div>
      </div>
    </div>
  `;
}
