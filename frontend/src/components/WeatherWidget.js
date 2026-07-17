import { apiFetch } from "../service/api.js";

export async function initWeatherWidget(eventId, isFinalized) {
  const container = document.getElementById("weather-widget");
  if (!container) return;

  if (isFinalized) {
    container.remove();
    return;
  }

  try {
    const data = await apiFetch(`/events/${eventId}/weather`);

    if (data.temp != null && data.icon) {
      container.innerHTML = `
        <img src="https://openweathermap.org/img/wn/${data.icon}@2x.png" alt="${data.description || ''}" class="w-7 h-7">
        <span class="font-semibold text-[#755B00]">${Math.round(data.temp)}°C</span>
        <span class="text-[#9E8E6E] text-xs capitalize">${data.description || ''}</span>
        ${data.message ? `<span class="text-[#9E8E6E] text-[10px] ml-1">${data.message}</span>` : ''}
      `;
    } else {
      container.innerHTML = `<span class="text-[#9E8E6E] text-xs">${data.message || 'Clima no disponible'}</span>`;
    }
  } catch {
    const el = document.getElementById("weather-widget");
    if (el) el.innerHTML = `<span class="text-[#9E8E6E] text-xs">Clima no disponible</span>`;
  }
}
