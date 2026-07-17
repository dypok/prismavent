import { getTemplates } from "../service/api.js";

// Cache for fetched templates
let fetchedTemplates = [];

window.handleGridTemplateSelect = function (templateId) {
    const list = window.__fetchedTemplates || fetchedTemplates || [];
    const template = list.find((t) => t.id === templateId);

    if (template) {
        localStorage.setItem(
            "selectedEventTemplate",
            JSON.stringify(template.preset)
        );
    }
    window.history.pushState({}, "", "/events/new/custom");
    window.dispatchEvent(new PopStateEvent("popstate"));
};

window.handleGridBack = function () {
    window.history.pushState({}, "", "/events/new");
    window.dispatchEvent(new PopStateEvent("popstate"));
};

// Fallback emojis when a template has no icon_url
const FALLBACK_ICONS = ["✨", "🎉", "🏢", "🎓", "💍", "🎂", "💻", "🎈", "🌟", "🎊", "🌿", "🎶"];

function renderSkeleton() {
    return Array(3).fill(0).map(() => `
        <div class="bg-white rounded-2xl border border-[#E9E1D7] p-6 animate-pulse">
            <div class="w-14 h-14 bg-gray-200 rounded-xl mb-4"></div>
            <div class="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div class="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
            <div class="flex gap-2">
                <div class="h-6 bg-gray-200 rounded-full w-16"></div>
                <div class="h-6 bg-gray-200 rounded-full w-20"></div>
            </div>
        </div>
    `).join("");
}

/**
 * Render the icon element for a template card.
 * If icon_url is present → <img> tag loading the SVG from the URL.
 * Otherwise → emoji span fallback.
 */
function renderIcon(iconUrl, fallbackEmoji) {
    if (iconUrl) {
        return `<img src="${iconUrl}" class="w-7 h-7" alt="icono plantilla" onerror="this.replaceWith(document.createTextNode('${fallbackEmoji}'))" />`;
    }
    return `<span class="text-2xl">${fallbackEmoji}</span>`;
}

/**
 * Derive a human-readable duration and catering hint from the template's
 * default_items list — no hard-coded template names required.
 */
function inferBadges(templateItems) {
    if (!Array.isArray(templateItems) || templateItems.length === 0) {
        return { duration: 4, catering: "No incluido" };
    }

    const names = templateItems.map(i => (i.name || "").toLowerCase());

    // Duration heuristic: more items → longer event
    let duration = Math.min(4 + Math.floor(templateItems.length / 3), 12);

    // Catering heuristic: look for recognisable catering-related item names
    let catering = "No incluido";
    if (names.some(n => n.includes("banquet") || n.includes("cena") || n.includes("almuerzo"))) {
        catering = "Banquete completo";
    } else if (names.some(n => n.includes("coffee") || n.includes("ejecutivo"))) {
        catering = "Coffee break";
    } else if (names.some(n => n.includes("catering") || n.includes("comida") || n.includes("alimentac"))) {
        catering = "Catering incluido";
    } else if (names.some(n => n.includes("postre") || n.includes("torta") || n.includes("snack") || n.includes("dulce"))) {
        catering = "Postres y bebidas";
    }

    return { duration, catering };
}

async function loadTemplates() {
    const grid = document.getElementById("templates-grid");
    if (!grid) return;

    try {
        const dbTemplates = await getTemplates();

        // Exclude the "Personalizado" entry — it's a special internal template
        const templatesToShow = dbTemplates.filter(t => !t.name.toLowerCase().includes("personalizado"));

        fetchedTemplates = templatesToShow.map((t, idx) => {
            const fallback = FALLBACK_ICONS[idx % FALLBACK_ICONS.length];
            const { duration, catering } = inferBadges(t.template_items);

            return {
                id: t.id,
                title: t.name,
                description: t.description || "Estructura de evento predefinida.",
                iconUrl: t.icon_url || null,
                fallbackIcon: fallback,
                colorBg: t.color_bg || '#FEF3C7',
                colorIcon: t.color_icon || '#755B00',
                preset: {
                    id: t.id,
                    type: t.name.replace("Plantilla ", ""),
                    city: "",
                    guestCount: 50,
                    maxBudget: 2000000,
                    notes: t.description || ""
                },
                duration,
                catering
            };
        });

        window.__fetchedTemplates = fetchedTemplates;

        if (fetchedTemplates.length === 0) {
            grid.innerHTML = `<p class="col-span-full text-center text-[#9E8E6E]">No hay plantillas disponibles en la base de datos.</p>`;
            return;
        }

        grid.innerHTML = fetchedTemplates.map(
            (t) => `
              <div onclick="window.handleGridTemplateSelect('${t.id}')"
                class="group relative bg-white rounded-2xl border border-[#E9E1D7] p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1">
                <div class="flex items-start justify-between mb-4">
                  <div class="w-14 h-14 rounded-xl flex items-center justify-center" style="background-color: ${t.colorBg}; color: ${t.colorIcon};">
                    ${renderIcon(t.iconUrl, t.fallbackIcon)}
                  </div>
                  <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                    <span class="text-[#755B00] text-sm font-semibold">Usar plantilla →</span>
                  </div>
                </div>
                <h3 class="font-display text-xl text-[#1E1B15] mb-2">${t.title}</h3>
                <p class="text-[#4D4637] text-sm leading-relaxed mb-4">${t.description}</p>
                <div class="flex flex-wrap gap-2">
                  <span class="px-3 py-1 rounded-full text-xs font-medium border" style="background-color: ${t.colorBg}; color: ${t.colorIcon}; border-color: ${t.colorIcon}40;">${t.duration} hrs</span>
                  <span class="px-3 py-1 rounded-full text-xs font-medium border" style="background-color: ${t.colorBg}; color: ${t.colorIcon}; border-color: ${t.colorIcon}40;">${t.catering}</span>
                </div>
              </div>
            `
        ).join("");

    } catch (error) {
        console.error("Error loading templates:", error);
        grid.innerHTML = `<p class="col-span-full text-red-600 text-center py-6">Error al cargar las plantillas de la base de datos: ${error.message}</p>`;
    }
}

export function EventTemplatesGrid() {
    // Schedule asynchronous loading of templates
    setTimeout(loadTemplates, 0);

    return `
    <div class="w-full max-w-6xl mx-auto animate-fade-in">

      <div id="templates-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${renderSkeleton()}
      </div>

      <div class="mt-12 p-8 bg-[#FEF3C7] rounded-2xl border border-[#FDE68A] text-center">
        <h3 class="font-display text-xl text-[#1E1B15] mb-2">¿Ninguna se adapta a ti?</h3>
        <p class="text-[#4D4637] mb-4">Crea un evento completamente personalizado desde cero.</p>
        <button onclick="window.handleTemplateSelect('custom')"
          class="inline-flex items-center gap-2 px-6 py-3 bg-[#755B00] text-white rounded-xl font-semibold hover:bg-[#5A4700] transition-colors cursor-pointer">
          Crear desde cero
          <span class="text-xl">→</span>
        </button>
      </div>

    </div>
  `;
}
