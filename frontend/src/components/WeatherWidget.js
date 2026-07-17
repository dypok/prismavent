import { apiFetch } from "../service/api.js";

const weatherIcons = {
  "Clear": `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EAB308" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  "Clouds": `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`,
  "Rain": `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><line x1="9" y1="15" x2="8" y2="17"/><line x1="13" y1="15" x2="11.5" y2="19"/><line x1="17" y1="15" x2="15" y2="17"/></svg>`,
  "Drizzle": `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><line x1="10" y1="17" x2="9.5" y2="19"/><line x1="14" y1="17" x2="13.5" y2="19"/></svg>`,
  "Thunderstorm": `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><polyline points="11 12 9 16 13 16 11 20"/></svg>`,
  "Snow": `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DBEAFE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><line x1="10" y1="17" x2="9.5" y2="19"/><line x1="14" y1="17" x2="13.5" y2="19"/><line x1="12" y1="15" x2="11.5" y2="17"/></svg>`,
  "Mist": `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="5" y1="9" x2="19" y2="9"/></svg>`,
  "Fog": `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="5" y1="9" x2="19" y2="9"/></svg>`,
  "Haze": `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="5" y1="9" x2="19" y2="9"/></svg>`,
};

const conditionLabels = {
  "Clear": "Despejado",
  "Clouds": "Nublado",
  "Rain": "Lluvia",
  "Drizzle": "Llovizna",
  "Thunderstorm": "Tormenta",
  "Snow": "Nieve",
  "Mist": "Bruma",
  "Fog": "Niebla",
  "Haze": "Calima",
};

export async function initWeatherWidget(eventId, isFinalized) {
  const container = document.getElementById("weather-widget");
  if (!container) return;

  if (isFinalized) {
    container.remove();
    return;
  }

  try {
    const data = await apiFetch(`/events/${eventId}/weather`);

    if (data.temp != null && data.condition) {
      const svg = weatherIcons[data.condition] || weatherIcons["Clouds"];
      const label = conditionLabels[data.condition] || data.description || data.condition;
      const msgHtml = data.message && data.message !== "Forecast available"
        ? `<span class="text-[#9E8E6E] text-[10px] ml-1">${data.message}</span>`
        : '';

      container.innerHTML = `
        ${svg}
        <span class="font-semibold text-[#755B00]">${Math.round(data.temp)}°C</span>
        <span class="text-[#9E8E6E] text-xs capitalize">${label}</span>
        ${msgHtml}
      `;
    } else {
      const msg = data.message === "Forecast available"
        ? "Clima no disponible"
        : (data.message || 'Clima no disponible');
      container.innerHTML = `<span class="text-[#9E8E6E] text-xs">${msg}</span>`;
    }
  } catch {
    const el = document.getElementById("weather-widget");
    if (el) el.innerHTML = `<span class="text-[#9E8E6E] text-xs">Clima no disponible</span>`;
  }
}
