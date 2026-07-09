// src/components/EventTemplatesGrid.js

export function EventTemplatesGrid() {
    const templates = [
        {
            id: 'birthday',
            title: 'Cumpleaños',
            description: 'Celebración personal con decoración, pastel y música.',
            icon: '🎂',
            color: 'bg-pink-50 border-pink-200',
            iconColor: 'bg-pink-100 text-pink-600',
            preset: {
                type: 'Cumpleaños',
                catering: 'Sí - Completo (Comida + Bebida)',
                duration: 4,
                streaming: 'No',
                speakers: 0,
                promotional: 'Sí (Roll-ups, brochures, gifts)',
                notes: 'Celebración de cumpleaños con decoración temática, pastel y entretenimiento.'
            }
        },
        {
            id: 'wedding',
            title: 'Boda',
            description: 'Ceremonia elegante con banquete, música y decoración floral.',
            icon: '💍',
            color: 'bg-rose-50 border-rose-200',
            iconColor: 'bg-rose-100 text-rose-600',
            preset: {
                type: 'Boda',
                catering: 'Sí - Completo (Comida + Bebida + Barra libre)',
                duration: 8,
                streaming: 'Sí',
                speakers: 2,
                promotional: 'Sí (Roll-ups, brochures, gifts)',
                notes: 'Ceremonia nupcial con banquete, música en vivo, decoración floral y fotografía.'
            }
        },
        {
            id: 'conference',
            title: 'Conferencia',
            description: 'Evento corporativo con proyección, sonido y coffee break.',
            icon: '🎤',
            color: 'bg-blue-50 border-blue-200',
            iconColor: 'bg-blue-100 text-blue-600',
            preset: {
                type: 'Conferencia',
                catering: 'Sí - Coffee break + Almuerzo',
                duration: 6,
                streaming: 'Sí',
                speakers: 3,
                promotional: 'Sí (Roll-ups, brochures, gifts)',
                notes: 'Evento corporativo con presentaciones, networking y material promocional.'
            }
        },
        {
            id: 'corporate',
            title: 'Evento Corporativo',
            description: 'Reunión de empresa con team building y actividades grupales.',
            icon: '🏢',
            color: 'bg-slate-50 border-slate-200',
            iconColor: 'bg-slate-100 text-slate-600',
            preset: {
                type: 'Evento Corporativo',
                catering: 'Sí - Completo (Comida + Bebida)',
                duration: 5,
                streaming: 'No',
                speakers: 1,
                promotional: 'Sí (Roll-ups, brochures, gifts)',
                notes: 'Reunión empresarial con actividades de team building y presentaciones.'
            }
        },
        {
            id: 'graduation',
            title: 'Graduación',
            description: 'Ceremonia con discursos, entrega de diplomas y celebración.',
            icon: '🎓',
            color: 'bg-purple-50 border-purple-200',
            iconColor: 'bg-purple-100 text-purple-600',
            preset: {
                type: 'Graduación',
                catering: 'Sí - Completo (Comida + Bebida)',
                duration: 4,
                streaming: 'Sí',
                speakers: 4,
                promotional: 'Sí (Roll-ups, brochures, gifts)',
                notes: 'Ceremonia de graduación con discursos, entrega de diplomas y celebración.'
            }
        },
        {
            id: 'babyshower',
            title: 'Baby Shower',
            description: 'Celebración íntima con juegos, regalos y refrigerios.',
            icon: '🍼',
            color: 'bg-sky-50 border-sky-200',
            iconColor: 'bg-sky-100 text-sky-600',
            preset: {
                type: 'Baby Shower',
                catering: 'Sí - Refrigerios + Bebidas',
                duration: 3,
                streaming: 'No',
                speakers: 0,
                promotional: 'No',
                notes: 'Celebración íntima con juegos, regalos, decoración temática y refrigerios.'
            }
        },
        // 🔥 NUEVAS PLANTILLAS
        {
            id: 'anniversary',
            title: 'Aniversario',
            description: 'Cena romántica o celebración de años juntos con serenata y brindis.',
            icon: '🥂',
            color: 'bg-red-50 border-red-200',
            iconColor: 'bg-red-100 text-red-600',
            preset: {
                type: 'Aniversario',
                catering: 'Sí - Cena gourmet + Vinos',
                duration: 4,
                streaming: 'No',
                speakers: 1,
                promotional: 'No',
                notes: 'Cena romántica con serenata, brindis especial y decoración elegante.'
            }
        },
        {
            id: 'quinceanera',
            title: 'Quinceañera',
            description: 'Fiesta tradicional con vals, coreografía, corte de torta y fotografía.',
            icon: '👑',
            color: 'bg-fuchsia-50 border-fuchsia-200',
            iconColor: 'bg-fuchsia-100 text-fuchsia-600',
            preset: {
                type: 'Quinceañera',
                catering: 'Sí - Completo (Comida + Bebida + Postres)',
                duration: 6,
                streaming: 'Sí',
                speakers: 2,
                promotional: 'Sí (Roll-ups, brochures, gifts)',
                notes: 'Fiesta de quinceañera con vals, coreografía, corte de torta y fotografía profesional.'
            }
        },
        {
            id: 'christening',
            title: 'Bautizo',
            description: 'Ceremonia religiosa con celebración familiar y refrigerios.',
            icon: '⛪',
            color: 'bg-cyan-50 border-cyan-200',
            iconColor: 'bg-cyan-100 text-cyan-600',
            preset: {
                type: 'Bautizo',
                catering: 'Sí - Refrigerios + Bebidas',
                duration: 3,
                streaming: 'No',
                speakers: 1,
                promotional: 'No',
                notes: 'Ceremonia religiosa con celebración familiar, refrigerios y fotografía.'
            }
        },
        {
            id: 'product-launch',
            title: 'Lanzamiento de Producto',
            description: 'Evento de marca con demos, prensa, influencers y catering premium.',
            icon: '🚀',
            color: 'bg-indigo-50 border-indigo-200',
            iconColor: 'bg-indigo-100 text-indigo-600',
            preset: {
                type: 'Lanzamiento de Producto',
                catering: 'Sí - Catering premium + Coctelería',
                duration: 4,
                streaming: 'Sí',
                speakers: 2,
                promotional: 'Sí (Roll-ups, brochures, gifts)',
                notes: 'Evento de lanzamiento con demostraciones, prensa, influencers y catering premium.'
            }
        },
        {
            id: 'workshop',
            title: 'Taller / Workshop',
            description: 'Sesión educativa interactiva con material didáctico y coffee break.',
            icon: '🛠️',
            color: 'bg-teal-50 border-teal-200',
            iconColor: 'bg-teal-100 text-teal-600',
            preset: {
                type: 'Taller / Workshop',
                catering: 'Sí - Coffee break + Almuerzo ligero',
                duration: 5,
                streaming: 'Sí',
                speakers: 1,
                promotional: 'Sí (Roll-ups, brochures, gifts)',
                notes: 'Sesión educativa interactiva con material didáctico, coffee break y networking.'
            }
        },
        {
            id: 'christmas',
            title: 'Fiesta Navideña',
            description: 'Cena de fin de año con intercambio de regalos, música y decoración.',
            icon: '🎄',
            color: 'bg-green-50 border-green-200',
            iconColor: 'bg-green-100 text-green-600',
            preset: {
                type: 'Fiesta Navideña',
                catering: 'Sí - Cena completa + Barra de postres',
                duration: 5,
                streaming: 'No',
                speakers: 1,
                promotional: 'Sí (Roll-ups, brochures, gifts)',
                notes: 'Cena navideña con intercambio de regalos, música en vivo y decoración temática.'
            }
        },
        {
            id: 'farewell',
            title: 'Despedida de Soltero/a',
            description: 'Fiesta divertida con juegos, sorpresas y celebración con amigos.',
            icon: '🎉',
            color: 'bg-violet-50 border-violet-200',
            iconColor: 'bg-violet-100 text-violet-600',
            preset: {
                type: 'Despedida de Soltero/a',
                catering: 'Sí - Botanas + Bebidas',
                duration: 5,
                streaming: 'No',
                speakers: 0,
                promotional: 'No',
                notes: 'Fiesta de despedida con juegos, sorpresas, botanas y celebración con amigos.'
            }
        },
        {
            id: 'fundraiser',
            title: 'Evento Benéfico',
            description: 'Gala solidaria con subasta, cena y presentación de causa.',
            icon: '💝',
            color: 'bg-amber-50 border-amber-200',
            iconColor: 'bg-amber-100 text-amber-600',
            preset: {
                type: 'Evento Benéfico',
                catering: 'Sí - Cena de gala + Barra libre',
                duration: 5,
                streaming: 'Sí',
                speakers: 3,
                promotional: 'Sí (Roll-ups, brochures, gifts)',
                notes: 'Gala benéfica con subasta silenciosa, presentación de causa y cena de gala.'
            }
        },
        {
            id: 'reunion',
            title: 'Reunión Familiar',
            description: 'Encuentro íntimo con actividades grupales, comida y recuerdos.',
            icon: '👨‍👩‍👧‍👦',
            color: 'bg-orange-50 border-orange-200',
            iconColor: 'bg-orange-100 text-orange-600',
            preset: {
                type: 'Reunión Familiar',
                catering: 'Sí - Parrillada + Bebidas',
                duration: 6,
                streaming: 'No',
                speakers: 0,
                promotional: 'No',
                notes: 'Reunión familiar con actividades grupales, parrillada y compartir recuerdos.'
            }
        }
    ];

    function handleSelectTemplate(template) {
        localStorage.setItem('selectedEventTemplate', JSON.stringify(template.preset));
        window.dispatchEvent(new CustomEvent('templateSelected', { 
            detail: template 
        }));
    }

    function goBack() {
        window.dispatchEvent(new CustomEvent('showTemplateSelection'));
    }

    function startCustomEvent() {
        window.dispatchEvent(new CustomEvent('showCustomEventForm'));
    }

    const container = document.createElement('div');
    container.className = 'h-full bg-[#FFF8F1] flex flex-col animate-fade-in';
    container.innerHTML = `
        <div class="flex-1 p-8 overflow-y-auto">
            <div class="w-full max-w-6xl mx-auto">
                <!-- Header -->
                <div class="mb-10">
                    <button id="btn-back" class="flex items-center gap-2 text-[#755B00] hover:text-[#4D3D00] transition-colors mb-6 font-semibold text-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        Volver
                    </button>
                    <h1 class="font-display text-4xl md:text-5xl text-[#1E1B15] mb-3">Elige una Plantilla</h1>
                    <p class="text-[#4D4637] text-lg">Selecciona una estructura predefinida para comenzar tu planificación más rápido.</p>
                </div>

                <!-- Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${templates.map(t => `
                        <div class="group relative bg-white rounded-2xl border border-[#E9E1D7] p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1" data-template-id="${t.id}">
                            <div class="flex items-start justify-between mb-4">
                                <div class="w-14 h-14 ${t.iconColor} rounded-xl flex items-center justify-center text-2xl">
                                    ${t.icon}
                                </div>
                                <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span class="text-[#755B00] text-sm font-semibold">Usar plantilla →</span>
                                </div>
                            </div>
                            <h3 class="font-display text-xl text-[#1E1B15] mb-2">${t.title}</h3>
                            <p class="text-[#4D4637] text-sm leading-relaxed mb-4">${t.description}</p>
                            <div class="flex flex-wrap gap-2">
                                <span class="px-3 py-1 ${t.color} rounded-full text-xs font-medium text-[#4D4637] border">${t.preset.duration} hrs</span>
                                <span class="px-3 py-1 ${t.color} rounded-full text-xs font-medium text-[#4D4637] border">${t.preset.catering.split(' - ')[1] || t.preset.catering}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Custom Template CTA -->
                <div class="mt-12 p-8 bg-[#FEF3C7] rounded-2xl border border-[#FDE68A] text-center">
                    <h3 class="font-display text-xl text-[#1E1B15] mb-2">¿Ninguna se adapta a ti?</h3>
                    <p class="text-[#4D4637] mb-4">Crea un evento completamente personalizado desde cero.</p>
                    <button id="btn-custom-event" class="inline-flex items-center gap-2 px-6 py-3 bg-[#755B00] text-white rounded-xl font-semibold hover:bg-[#5A4700] transition-colors">
                        Crear desde cero
                        <span class="text-xl">→</span>
                    </button>
                </div>
            </div>
        </div>
    `;

    // Event listeners
    setTimeout(() => {
        // Click en tarjeta de plantilla
        container.querySelectorAll('[data-template-id]').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.templateId;
                const template = templates.find(t => t.id === id);
                handleSelectTemplate(template);
            });
        });

        // Botón volver
        container.querySelector('#btn-back').addEventListener('click', goBack);

        //  BOTÓN "CREAR DESDE CERO" - Ahora abre el formulario personalizado
        container.querySelector('#btn-custom-event').addEventListener('click', startCustomEvent);
    }, 0);

    return container;
}