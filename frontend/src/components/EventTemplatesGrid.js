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

// ----------------------------------------------------------------
// Colour palette — one entry per template slot (cycles if more)
// Add as many entries as needed; the frontend never hard-codes names.
// ----------------------------------------------------------------
const PALETTE = [
    { color: "bg-rose-50 border-rose-200",    iconBg: "bg-rose-100"    },
    { color: "bg-pink-50 border-pink-200",    iconBg: "bg-pink-100"    },
    { color: "bg-blue-50 border-blue-200",    iconBg: "bg-blue-100"    },
    { color: "bg-fuchsia-50 border-fuchsia-200", iconBg: "bg-fuchsia-100" },
    { color: "bg-emerald-50 border-emerald-200", iconBg: "bg-emerald-100" },
    { color: "bg-indigo-50 border-indigo-200",   iconBg: "bg-indigo-100"  },
    { color: "bg-orange-50 border-orange-200",   iconBg: "bg-orange-100"  },
    { color: "bg-teal-50 border-teal-200",    iconBg: "bg-teal-100"    },
    { color: "bg-amber-50 border-amber-200",  iconBg: "bg-amber-100"   },
    { color: "bg-violet-50 border-violet-200",iconBg: "bg-violet-100"  },
    { color: "bg-sky-50 border-sky-200",      iconBg: "bg-sky-100"     },
    { color: "bg-lime-50 border-lime-200",    iconBg: "bg-lime-100"    },
];

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
            const palette = PALETTE[idx % PALETTE.length];
            const fallback = FALLBACK_ICONS[idx % FALLBACK_ICONS.length];
            const { duration, catering } = inferBadges(t.template_items);

            return {
                id: t.id,
                title: t.name,
                description: t.description || "Estructura de evento predefinida.",
                iconUrl: t.icon_url || null,
                fallbackIcon: fallback,
                color: palette.color,
                iconBg: palette.iconBg,
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
                  <div class="w-14 h-14 ${t.iconBg} rounded-xl flex items-center justify-center">
                    ${renderIcon(t.iconUrl, t.fallbackIcon)}
                  </div>
                  <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                    <span class="text-[#755B00] text-sm font-semibold">Usar plantilla →</span>
                  </div>
                </div>
                <h3 class="font-display text-xl text-[#1E1B15] mb-2">${t.title}</h3>
                <p class="text-[#4D4637] text-sm leading-relaxed mb-4">${t.description}</p>
                <div class="flex flex-wrap gap-2">
                  <span class="px-3 py-1 ${t.color} rounded-full text-xs font-medium text-[#4D4637] border">${t.duration} hrs</span>
                  <span class="px-3 py-1 ${t.color} rounded-full text-xs font-medium text-[#4D4637] border">${t.catering}</span>
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

      <button onclick="window.handleGridBack()"
        class="flex items-center gap-2 text-[#755B00] hover:text-[#4D3D00] transition-colors mb-6 font-semibold text-lg cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Volver
      </button>

      <h1 class="font-display text-4xl md:text-5xl text-[#1E1B15] mb-3">Elige una Plantilla</h1>
      <p class="text-[#4D4637] text-lg mb-10">Selecciona una estructura predefinida para comenzar tu planificación más rápido.</p>

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
