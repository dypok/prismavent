import { getTemplates, getUserTemplates, deleteUserTemplate } from "../service/api.js";
import { showToast } from "./Toast.js";
import { icon } from "./Icons.js";

let fetchedTemplates = [];
let fetchedUserTemplates = [];

window.handleGridTemplateSelect = function (templateId, isUserTemplate = false) {
    let template;
    if (isUserTemplate) {
        template = fetchedUserTemplates.find((t) => t.id === templateId);
    } else {
        template = fetchedTemplates.find((t) => t.id === templateId);
    }

    if (template) {
        localStorage.setItem(
            "selectedEventTemplate",
            JSON.stringify(template.preset)
        );
    }
    window.history.replaceState({}, "", "/events/new/custom");
    window.dispatchEvent(new PopStateEvent("popstate"));
};

window.handleGridBack = function () {
    window.history.replaceState({}, "", "/events/new");
    window.dispatchEvent(new PopStateEvent("popstate"));
};

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

function renderIcon(iconUrl, fallbackEmoji) {
    if (iconUrl) {
        return `<img src="${iconUrl}" class="w-7 h-7" alt="icono plantilla" onerror="this.replaceWith(document.createTextNode('${fallbackEmoji}'))" />`;
    }
    return `<span class="text-2xl">${fallbackEmoji}</span>`;
}

function inferBadges(templateItems) {
    if (!Array.isArray(templateItems) || templateItems.length === 0) {
        return { duration: 4, catering: "No incluido" };
    }

    const names = templateItems.map(i => (i.name || "").toLowerCase());
    let duration = Math.min(4 + Math.floor(templateItems.length / 3), 12);
    
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

window.loadAllTemplates = async function() {
    const gridSystem = document.getElementById("templates-grid-system");
    const gridUser = document.getElementById("templates-grid-user");
    if (!gridSystem) return;

    try {
        const [dbTemplates, dbUserTemplates] = await Promise.all([
            getTemplates(),
            getUserTemplates()
        ]);

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

        fetchedUserTemplates = dbUserTemplates.map((t, idx) => {
            const fallback = FALLBACK_ICONS[idx % FALLBACK_ICONS.length];
            const { duration, catering } = inferBadges(t.items);

            return {
                id: t.id,
                title: t.name,
                description: t.description || "Plantilla creada por ti.",
                iconUrl: null,
                fallbackIcon: fallback,
                colorBg: '#E0F2FE',
                colorIcon: '#0369A1',
                preset: {
                    user_template_id: t.id,
                    type: t.name,
                    city: "",
                    guestCount: 50,
                    maxBudget: 2000000,
                    notes: t.description || ""
                },
                duration,
                catering
            };
        });

        if (fetchedUserTemplates.length > 0 && gridUser) {
            document.getElementById("user-templates-section").classList.remove("hidden");
            gridUser.innerHTML = fetchedUserTemplates.map(t => renderTemplateCard(t, true)).join("");
        } else if (gridUser) {
            document.getElementById("user-templates-section").classList.add("hidden");
        }

        gridSystem.innerHTML = fetchedTemplates.map(t => renderTemplateCard(t, false)).join("");

    } catch (err) {
        console.error("Error loading templates", err);
        gridSystem.innerHTML = `<p class="text-red-500 col-span-full">No se pudieron cargar las plantillas.</p>`;
    }
};

function renderTemplateCard(t, isUserTemplate) {
    return `
        <div onclick="window.handleGridTemplateSelect('${t.id}', ${isUserTemplate})"
            class="group relative bg-white rounded-2xl border border-[#E9E1D7] p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1">
            <div class="flex items-start justify-between mb-4">
                <div class="w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style="background-color: ${t.colorBg}; color: ${t.colorIcon};">
                    ${renderIcon(t.iconUrl, t.fallbackIcon)}
                </div>
                <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                    <span class="text-sm font-semibold" style="color: ${t.colorIcon}">Usar plantilla &rarr;</span>
                </div>
            </div>
            <h3 class="font-display text-xl text-[#1E1B15] mb-2">${t.title}</h3>
            <p class="text-[#4D4637] text-sm leading-relaxed mb-4">${t.description}</p>
            <div class="flex flex-wrap gap-2">
                <span class="px-3 py-1 rounded-full text-xs font-medium border" style="background-color: ${t.colorBg}; border-color: ${t.colorIcon}; color: ${t.colorIcon}">${t.duration} hrs</span>
                <span class="px-3 py-1 rounded-full text-xs font-medium border" style="background-color: ${t.colorBg}; border-color: ${t.colorIcon}; color: ${t.colorIcon}">${t.catering.split(" - ")[1] || t.catering}</span>
            </div>
        </div>
    `;
}

export function EventTemplatesGrid() {
    setTimeout(() => {
        window.loadAllTemplates();
    }, 0);

    return `
    <div class="w-full max-w-6xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <button onclick="window.handleGridBack()"
          class="flex items-center gap-2 text-[#755B00] hover:text-[#4D3D00] transition-colors font-semibold text-lg">
          ${icon('chevron-left', 20)}
          Volver
        </button>
        <button onclick="window.navigateTo('/my-templates')" class="px-4 py-2 bg-white border border-[#E9E1D7] text-[#755B00] rounded-xl text-sm font-semibold hover:bg-[#FEF3C7] transition-all shadow-sm">
          Gestionar Mis Plantillas
        </button>
      </div>

      <h1 class="font-display text-4xl md:text-5xl text-[#1E1B15] mb-3">Elige una Plantilla</h1>
      <p class="text-[#4D4637] text-lg mb-10">Selecciona una estructura predefinida para comenzar tu planificación más rápido.</p>

      <div id="user-templates-section" class="mb-12 hidden">
        <div class="flex items-center gap-3 mb-6">
            <h2 class="font-display text-2xl text-[#1E1B15]">Mis Plantillas</h2>
            <div class="h-px bg-[#E9E1D7] flex-1"></div>
            <button onclick="window.navigateTo('/my-templates')" class="text-sm font-medium text-[#755B00] hover:underline whitespace-nowrap">Gestionar Plantillas</button>
        </div>
        <div id="templates-grid-user" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${renderSkeleton()}
        </div>
      </div>

      <div class="mb-12">
        <div class="flex items-center gap-3 mb-6">
            <h2 class="font-display text-2xl text-[#1E1B15]">Plantillas del Sistema</h2>
            <div class="h-px bg-[#E9E1D7] flex-1"></div>
        </div>
        <div id="templates-grid-system" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${renderSkeleton()}
        </div>
      </div>

      <div class="mt-12 p-8 bg-[#FEF3C7] rounded-2xl border border-[#FDE68A] text-center">
        <h3 class="font-display text-xl text-[#1E1B15] mb-2">¿Ninguna se adapta a ti?</h3>
        <p class="text-[#4D4637] mb-4">Crea un evento completamente personalizado desde cero.</p>
        <button onclick="window.handleTemplateSelect('custom')"
          class="inline-flex items-center gap-2 px-6 py-3 bg-[#755B00] text-white rounded-xl font-semibold hover:bg-[#5A4700] transition-colors cursor-pointer">
          Crear desde cero
          <span class="text-xl">&rarr;</span>
        </button>
      </div>
    </div>
  `;
}
