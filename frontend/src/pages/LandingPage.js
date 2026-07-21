export function LandingPage() {
  return `
<div class="bg-[#FFF8F1] font-sans text-[#1E1B15]">

  <!-- ===== NAVBAR ===== -->
  <nav class="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E9E1D7]">
    <div class="max-w-7xl mx-auto px-4 lg:px-8 flex items-center justify-between h-16 lg:h-20">
      <a onclick="window.scrollTo({top:0,behavior:'smooth'})" class="flex items-center cursor-pointer shrink-0">
        <img src="/logo.png" alt="Prismavent" class="h-10 w-auto">
      </a>
      <div class="hidden md:flex items-center gap-8">
        <a href="#hero" class="text-sm text-[#4D4637] hover:text-[#755B00] transition-colors font-medium">Inicio</a>
        <a href="#features" class="text-sm text-[#4D4637] hover:text-[#755B00] transition-colors font-medium">Características</a>
        <a href="#how-it-works" class="text-sm text-[#4D4637] hover:text-[#755B00] transition-colors font-medium">Cómo funciona</a>
        <a href="#testimonials" class="text-sm text-[#4D4637] hover:text-[#755B00] transition-colors font-medium">Testimonios</a>
        <a href="#footer" class="text-sm text-[#4D4637] hover:text-[#755B00] transition-colors font-medium">Contacto</a>
      </div>
      <div class="flex items-center gap-3">
        <button onclick="window.navigateTo('/auth')" class="hidden sm:inline-block px-5 py-2.5 bg-[#755B00] hover:bg-[#5A4700] text-white rounded-xl text-sm font-semibold transition-all shadow-sm">Comenzar gratis</button>
        <button id="landing-menu-btn" class="md:hidden w-10 h-10 flex items-center justify-center text-[#755B00] hover:bg-[#FEF3C7] rounded-xl transition-colors cursor-pointer">${menuIcon()}</button>
      </div>
    </div>
    <div id="landing-mobile-menu" class="hidden md:hidden bg-white border-t border-[#E9E1D7] px-4 py-4 space-y-3">
      <a href="#hero" class="block text-sm text-[#4D4637] hover:text-[#755B00] py-2">Inicio</a>
      <a href="#features" class="block text-sm text-[#4D4637] hover:text-[#755B00] py-2">Características</a>
      <a href="#how-it-works" class="block text-sm text-[#4D4637] hover:text-[#755B00] py-2">Cómo funciona</a>
      <a href="#testimonials" class="block text-sm text-[#4D4637] hover:text-[#755B00] py-2">Testimonios</a>
      <a href="#footer" class="block text-sm text-[#4D4637] hover:text-[#755B00] py-2">Contacto</a>
      <button onclick="window.navigateTo('/auth')" class="w-full mt-2 px-5 py-2.5 bg-[#755B00] hover:bg-[#5A4700] text-white rounded-xl text-sm font-semibold transition">Comenzar gratis</button>
    </div>
  </nav>

  <!-- ===== HERO ===== -->
  <section id="hero" class="relative min-h-screen flex items-center pt-20 overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-b from-[#FFF8F1] via-[#FEF3C7]/30 to-[#FFF8F1] pointer-events-none"></div>
    <div class="absolute top-20 right-0 w-96 h-96 bg-[#C9A84C]/10 rounded-full blur-3xl"></div>
    <div class="absolute bottom-20 left-0 w-80 h-80 bg-[#376847]/10 rounded-full blur-3xl"></div>
    <div class="relative max-w-4xl mx-auto px-4 lg:px-8 text-center">
      <div class="animate-fade-in-up">
        <span class="inline-block px-4 py-1.5 bg-[#FEF3C7] text-[#755B00] text-xs font-semibold rounded-full uppercase tracking-wider mb-4">Plataforma todo-en-uno</span>
        <h1 class="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-[#1E1B15] leading-tight">
          Planifica eventos inolvidables con <span class="text-[#755B00]">Prismavent</span>
        </h1>
        <p class="text-[#9E8E6E] text-lg mt-6 leading-relaxed max-w-2xl mx-auto">
          La plataforma todo-en-uno para organizar bodas, conferencias y celebraciones. Gestiona invitados, presupuestos, proveedores y tareas en un solo lugar.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <button onclick="window.navigateTo('/auth')" class="px-6 py-3 bg-[#755B00] hover:bg-[#5A4700] text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg text-sm lg:text-base">Comenzar gratis</button>
          <a href="#features" class="px-6 py-3 border border-[#E9E1D7] bg-white hover:bg-[#FEF3C7] rounded-xl font-semibold text-[#4D4637] transition-all text-sm lg:text-base text-center">Ver características</a>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== ESTADÍSTICAS ===== -->
  <section class="relative bg-white border-y border-[#E9E1D7] py-8 lg:py-10">
    <div class="max-w-7xl mx-auto px-4 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8" id="stats-grid">
      <div class="text-center animate-fade-in-up">
        <p id="stat-events" class="text-3xl lg:text-4xl font-bold text-[#755B00]">--</p>
        <p class="text-sm text-[#9E8E6E] mt-1">eventos creados</p>
      </div>
      <div class="text-center animate-fade-in-up">
        <p id="stat-guests" class="text-3xl lg:text-4xl font-bold text-[#755B00]">--</p>
        <p class="text-sm text-[#9E8E6E] mt-1">invitados gestionados</p>
      </div>
      <div class="text-center animate-fade-in-up">
        <p id="stat-providers" class="text-3xl lg:text-4xl font-bold text-[#376847]">--</p>
        <p class="text-sm text-[#9E8E6E] mt-1">proveedores registrados</p>
      </div>
      <div class="text-center animate-fade-in-up">
        <p id="stat-users" class="text-3xl lg:text-4xl font-bold text-[#C9A84C]">--</p>
        <p class="text-sm text-[#9E8E6E] mt-1">usuarios registrados</p>
      </div>
    </div>
  </section>

  <!-- ===== CARACTERÍSTICAS ===== -->
  <section id="features" class="py-16 lg:py-24">
    <div class="max-w-7xl mx-auto px-4 lg:px-8">
      <div class="text-center max-w-2xl mx-auto">
        <span class="inline-block px-4 py-1.5 bg-[#FEF3C7] text-[#755B00] text-xs font-semibold rounded-full uppercase tracking-wider mb-4">Características</span>
        <h2 class="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-[#1E1B15]">Todo lo que necesitas para tu evento</h2>
        <p class="text-[#9E8E6E] mt-4 text-lg">Desde la lista de invitados hasta el clima del día, Prismavent lo cubre todo.</p>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        ${featureCard('users', 'Gestión de Invitados', 'RSVP, confirmaciones, seguimiento y comunicación con todos tus asistentes desde un solo panel.', '#755B00')}
        ${featureCard('dollar', 'Control de Presupuesto', 'Registra gastos, monitorea disponibilidad y recibe alertas cuando te acerques al límite.', '#376847')}
        ${featureCard('package', 'Recursos del Evento', 'Administra ítems, cantidades, proveedores y costos de todo lo necesario para tu evento.', '#C9A84C')}
        ${featureCard('kanban', 'Tablero Kanban', 'Organiza tareas con un sistema visual de pendientes, en progreso y realizadas. Arrastra y suelta.', '#755B00')}
        ${featureCard('store', 'Directorio de Proveedores', 'Encuentra y contacta proveedores por categoría, consulta reseñas y compara precios.', '#376847')}
        ${featureCard('sun', 'Clima del Evento', 'Consulta el pronóstico integrado para la fecha de tu evento y planifica con anticipación.', '#C9A84C')}
      </div>
    </div>
  </section>

  <!-- ===== CÓMO FUNCIONA ===== -->
  <section id="how-it-works" class="bg-white py-16 lg:py-24 border-y border-[#E9E1D7]">
    <div class="max-w-7xl mx-auto px-4 lg:px-8">
      <div class="text-center max-w-2xl mx-auto">
        <span class="inline-block px-4 py-1.5 bg-[#FEF3C7] text-[#755B00] text-xs font-semibold rounded-full uppercase tracking-wider mb-4">Cómo funciona</span>
        <h2 class="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-[#1E1B15]">Tres pasos para un evento perfecto</h2>
      </div>
      <div class="flex flex-col md:flex-row items-start md:items-center justify-center gap-6 md:gap-0 mt-12">
        ${stepCard('1', 'Crea tu evento', 'Define nombre, fecha, ciudad y tipo de evento. Elige entre creación personalizada o plantillas predefinidas.')}
        ${stepConnector()}
        ${stepCard('2', 'Personaliza', 'Agrega invitados, recursos, presupuesto y tareas. Asigna proveedores y configura cada detalle.')}
        ${stepConnector()}
        ${stepCard('3', 'Ejecuta', 'Coordina proveedores, monitorea el progreso con el tablero Kanban y recibe el pronóstico del clima.')}
      </div>
    </div>
  </section>

  <!-- ===== TESTIMONIOS ===== -->
  <section id="testimonials" class="py-16 lg:py-24">
    <div class="max-w-7xl mx-auto px-4 lg:px-8">
      <div class="text-center max-w-2xl mx-auto">
        <span class="inline-block px-4 py-1.5 bg-[#FEF3C7] text-[#755B00] text-xs font-semibold rounded-full uppercase tracking-wider mb-4">Testimonios</span>
        <h2 class="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-[#1E1B15]">Lo que dicen nuestros clientes</h2>
      </div>
      <div class="grid md:grid-cols-3 gap-6 mt-12">
        ${testimonialCard('María García', 'Organizadora de Bodas', 'Prismavent transformó mi forma de trabajar. Ahora puedo gestionar múltiples eventos desde un solo lugar, mis clientes están más felices y yo ahorro horas cada semana.', 'M')}
        ${testimonialCard('Carlos Mendoza', 'CEO de EventPro', 'La gestión de proveedores y el control de presupuesto nos ahorraron un 30% de tiempo en la organización de cada evento. Una herramienta indispensable.', 'C')}
        ${testimonialCard('Ana López', 'Planner Independiente', 'Nunca fue tan fácil coordinar un evento completo. Desde los invitados hasta el clima del día, todo está integrado. Lo recomiendo totalmente.', 'A')}
      </div>
    </div>
  </section>

  <!-- ===== CTA FINAL ===== -->
  <section class="bg-gradient-to-r from-[#755B00] to-[#5A4700] py-16 lg:py-20">
    <div class="max-w-3xl mx-auto px-4 text-center">
      <h2 class="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white">¿Listo para empezar?</h2>
      <p class="text-[#FEF3C7] text-lg mt-4 opacity-90">Únete a miles de organizadores que ya confían en Prismavent.</p>
      <button onclick="window.navigateTo('/auth')" class="mt-8 px-8 py-3.5 bg-white text-[#755B00] hover:bg-[#FEF3C7] hover:shadow-lg rounded-xl font-semibold transition-all shadow-md text-sm lg:text-base">Comenzar gratis — es gratis</button>
    </div>
  </section>

  <!-- ===== FOOTER ===== -->
  <footer id="footer" class="bg-[#1E1B15] text-white py-12 lg:py-16">
    <div class="max-w-7xl mx-auto px-4 lg:px-8">
      <div class="grid md:grid-cols-4 gap-8 lg:gap-12">
        <div>
          <div class="mb-4">
            <img src="/logo.png" alt="Prismavent" class="h-8 w-auto brightness-0 invert">
          </div>
          <p class="text-[#9E8E6E] text-sm leading-relaxed">La plataforma todo-en-uno para planificar y gestionar eventos inolvidables.</p>
        </div>
        <div>
          <h4 class="font-semibold text-sm uppercase tracking-wider text-[#C9A84C] mb-4">Producto</h4>
          <ul class="space-y-2.5">
            <li><a href="#features" class="text-sm text-[#9E8E6E] hover:text-white transition-colors">Características</a></li>
            <li><a href="#how-it-works" class="text-sm text-[#9E8E6E] hover:text-white transition-colors">Cómo funciona</a></li>
            <li><a href="#" class="text-sm text-[#9E8E6E] hover:text-white transition-colors">Precios</a></li>
            <li><a href="#" class="text-sm text-[#9E8E6E] hover:text-white transition-colors">FAQ</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold text-sm uppercase tracking-wider text-[#C9A84C] mb-4">Compañía</h4>
          <ul class="space-y-2.5">
            <li><a href="#" class="text-sm text-[#9E8E6E] hover:text-white transition-colors">Sobre nosotros</a></li>
            <li><a href="#" class="text-sm text-[#9E8E6E] hover:text-white transition-colors">Blog</a></li>
            <li><a href="#" class="text-sm text-[#9E8E6E] hover:text-white transition-colors">Contacto</a></li>
            <li><a href="#" class="text-sm text-[#9E8E6E] hover:text-white transition-colors">Términos</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold text-sm uppercase tracking-wider text-[#C9A84C] mb-4">Newsletter</h4>
          <p class="text-sm text-[#9E8E6E] mb-4">Recibe tips y novedades para organizar mejores eventos.</p>
          <form onsubmit="event.preventDefault(); alert('¡Gracias por suscribirte!')" class="flex gap-2">
            <input type="email" placeholder="tu@email.com" class="flex-1 px-3 py-2.5 bg-[#4D4637] text-white rounded-xl text-sm placeholder-[#9E8E6E] border border-[#4D4637] focus:border-[#C9A84C] focus:outline-none">
            <button type="submit" class="px-4 py-2.5 bg-[#C9A84C] hover:bg-[#755B00] text-white rounded-xl text-sm font-semibold transition-colors shrink-0">Suscribir</button>
          </form>
          <div class="flex items-center gap-3 mt-6">
            ${socialIcon('twitter')}
            ${socialIcon('instagram')}
            ${socialIcon('linkedin')}
            ${socialIcon('youtube')}
          </div>
        </div>
      </div>
      <div class="border-t border-[#4D4637] mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p class="text-sm text-[#9E8E6E]">© 2026 Prismavent. Todos los derechos reservados.</p>
        <p class="text-sm text-[#9E8E6E]">Hecho con <span class="text-red-400">❤️</span> para organizadores de eventos.</p>
      </div>
    </div>
  </footer>

  <!-- ===== BACK TO TOP ===== -->
  <button id="landing-back-to-top" onclick="window.scrollTo({top:0,behavior:'smooth'})" class="fixed bottom-6 right-6 w-11 h-11 bg-[#755B00] hover:bg-[#5A4700] text-white rounded-full shadow-lg hidden items-center justify-center transition-all z-40 cursor-pointer">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="18 15 12 9 6 15"/></svg>
  </button>

</div>
  `;
}

function menuIcon() {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;
}

function featureCard(icon, title, desc, color) {
  const icons = {
    users: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    dollar: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    package: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    kanban: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><rect x="7" y="7" width="3" height="10"/><rect x="14" y="12" width="3" height="5"/></svg>',
    store: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    sun: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
  };
  return `
    <div class="bg-white rounded-2xl border border-[#E9E1D7] p-6 lg:p-7 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 animate-fade-in-up">
      <div class="w-11 h-11 rounded-xl flex items-center justify-center" style="background:${color}15;color:${color}">
        ${icons[icon] || ''}
      </div>
      <h3 class="font-semibold text-[#1E1B15] text-base mt-4">${title}</h3>
      <p class="text-sm text-[#9E8E6E] mt-2 leading-relaxed">${desc}</p>
    </div>
  `;
}

function stepCard(num, title, desc) {
  return `
    <div class="flex flex-col items-center text-center max-w-xs mx-auto md:mx-0 animate-fade-in-up">
      <div class="w-14 h-14 rounded-full bg-[#FEF3C7] text-[#755B00] flex items-center justify-center font-display text-xl font-bold shadow-sm">${num}</div>
      <h3 class="font-semibold text-[#1E1B15] text-lg mt-4">${title}</h3>
      <p class="text-sm text-[#9E8E6E] mt-2 leading-relaxed">${desc}</p>
    </div>
  `;
}

function stepConnector() {
  return `
    <div class="hidden md:flex items-center justify-center shrink-0 w-12 mx-2">
      <svg width="48" height="2" viewBox="0 0 48 2" fill="none"><line x1="0" y1="1" x2="48" y2="1" stroke="#E9E1D7" stroke-width="2" stroke-dasharray="4 4"/></svg>
    </div>
  `;
}

function testimonialCard(name, role, quote, initial) {
  return `
    <div class="bg-white rounded-2xl border border-[#E9E1D7] p-6 lg:p-7 shadow-sm animate-fade-in-up">
      <div class="flex items-center gap-1 mb-4">
        ${'<svg width="16" height="16" viewBox="0 0 24 24" fill="#C9A84C" stroke="#C9A84C"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'.repeat(5)}
      </div>
      <p class="text-sm text-[#4D4637] leading-relaxed italic">"${quote}"</p>
      <div class="flex items-center gap-3 mt-5 pt-4 border-t border-[#F5EDE0]">
        <div class="w-10 h-10 rounded-full bg-[#FEF3C7] text-[#755B00] flex items-center justify-center font-semibold text-sm">${initial}</div>
        <div>
          <p class="text-sm font-semibold text-[#1E1B15]">${name}</p>
          <p class="text-xs text-[#9E8E6E]">${role}</p>
        </div>
      </div>
    </div>
  `;
}

function socialIcon(platform) {
  const icons = {
    twitter: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    instagram: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
    linkedin: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
    youtube: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>'
  };
  return `<a href="#" class="w-9 h-9 rounded-lg bg-[#4D4637] hover:bg-[#755B00] flex items-center justify-center text-[#9E8E6E] hover:text-white transition-all">${icons[platform] || ''}</a>`;
}

export function initLandingPage() {
  loadStats();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.animate-fade-in-up').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
  });

  const menuBtn = document.getElementById('landing-menu-btn');
  const mobileMenu = document.getElementById('landing-mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
  }

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const id = a.getAttribute('href')?.slice(1);
      if (id) {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
          mobileMenu.classList.add('hidden');
        }
      }
    });
  });

  const backToTop = document.getElementById('landing-back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.style.display = window.scrollY > 400 ? 'flex' : 'none';
    });
  }
}

async function loadStats() {
  try {
<<<<<<< HEAD
    const res = await fetch(`/stats`);
=======
    const res = await fetch(`https://bridge-mortgages-delivers-remaining.trycloudflare.com/stats`);
>>>>>>> 0996179 (fix: use Cloudflare Tunnel URL for HTTPS backend)
    const stats = await res.json();
    const fmt = (n) => n >= 1000 ? Math.floor(n / 1000) + 'K+' : n + '+';
    const setStat = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = fmt(val || 0); };
    setStat('stat-events', stats.total_events);
    setStat('stat-guests', stats.total_guests);
    setStat('stat-providers', stats.total_providers);
    setStat('stat-users', stats.total_users);
  } catch (e) {
    // Fallback to defaults
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('stat-events', '--');
    set('stat-guests', '--');
    set('stat-providers', '--');
    set('stat-users', '--');
  }
}
