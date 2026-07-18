# Development Summary – Landing Page Institucional - Frontend

Durante el desarrollo de esta user story, se implementó la landing page institucional de Prismavent, cubriendo tanto el diseño visual como la integración con el SPA existente, siguiendo la identidad de marca definida en Figma.

## Frontend

Se creó el componente `LandingPage.js` que se renderiza en la ruta raíz `/` del SPA, sin requerir autenticación. Los usuarios autenticados que visitan `/` son redirigidos automáticamente al dashboard mediante la lógica existente en `main.js`.

### Las siguientes funcionalidades fueron implementadas:

- **Navbar responsivo**: Logo de Prismavent + enlaces de navegación interna (Inicio, Características, Cómo funciona, Testimonios, Contacto) + botón "Comenzar gratis". Menú hamburguesa con toggle en móvil que oculta/muestra los enlaces.
- **Hero**: Título principal "Planifica eventos inolvidables con Prismavent", subtítulo descriptivo, badge "Plataforma todo-en-uno", dos CTAs: "Comenzar gratis" (redirige a `/auth`) y "Ver características" (scroll suave a la sección de características). Fondo con gradiente decorativo y círculos borrosos de los colores de la marca.
- **Estadísticas**: Barra horizontal con 4 indicadores: "10,000+ eventos creados", "50,000+ invitados gestionados", "98% satisfacción", "4.9 ★★★★★ valoración".
- **Características**: Grid de 6 tarjetas (3 columnas en desktop, 2 en tablet, 1 en móvil) con iconos SVG, título y descripción:
  - Gestión de Invitados (RSVP, confirmaciones, seguimiento)
  - Control de Presupuesto (gastos, disponibilidad, alertas)
  - Recursos del Evento (ítems, cantidades, proveedores)
  - Tablero Kanban (tareas, pendientes, en progreso, realizadas)
  - Directorio de Proveedores (categorías, contacto, reseñas)
  - Clima del Evento (pronóstico integrado para la fecha)
  Cada tarjeta con icono coloreado según el acento de la funcionalidad.
- **Cómo funciona**: 3 pasos en horizontal (Crea tu evento → Personaliza → Ejecuta) con círculos numerados y conectores punteados entre ellos. En móvil se apilan verticalmente.
- **Testimonios**: 3 tarjetas de clientes ficticios (María García, Carlos Mendoza, Ana López) con inicial, nombre, cargo y cita. Estrellas de calificación (5/5) en cada tarjeta.
- **CTA final**: Sección con gradiente oscuro (`#755B00 → #5A4700`) con título "¿Listo para empezar?" y botón "Comenzar gratis — es gratis".
- **Footer**: 4 columnas (logo + descripción, Producto, Compañía, Newsletter) con enlaces, formulario de suscripción (solo UI, sin backend) e iconos de redes sociales (Twitter, Instagram, LinkedIn, YouTube). Fondo oscuro `#1E1B15` con logo invertido a blanco.
- **Botón "Volver arriba"**: Flotante en la esquina inferior derecha, visible al hacer scroll > 400px. Al hacer clic, scroll suave al inicio.

### Aspectos técnicos

- **Archivo**: `frontend/src/pages/LandingPage.js` (~320 líneas)
- **Función principal**: `LandingPage()` — retorna el HTML completo de la landing page como template literal
- **Función de inicialización**: `initLandingPage()` — configura:
  - Intersection Observer para animaciones fade-in-up en todas las secciones al hacer scroll
  - Toggle del menú hamburguesa en móvil
  - Smooth scroll para todos los anchor links (`a[href^="#"]`)
  - Mostrar/ocultar botón "Volver arriba" según la posición del scroll
- **Animaciones**: Clase `.animate-fade-in-up` con keyframe `fadeInUp` (opacity 0 → 1, translateY 30px → 0, duración 0.6s) definida en `style.css`
- **Prismas flotantes**: 10 triángulos SVG animados posicionados aleatoriamente en la pantalla, con colores de marca (`#C9A84C`, `#376847`, `#755B00`), opacidad 25%, flotan hacia arriba rotando 360° y reduciendo escala. Capa `z-20` con `pointer-events: none` para no interferir con la interacción.
- **SEO**: Meta tags en `index.html`: description, keywords, Open Graph (og:title, og:description, og:image, og:type, og:url, og:locale), Twitter Cards (twitter:card, twitter:title, twitter:description, twitter:image)
- **Favicon**: Referencia a `/logo.png` en la pestaña del navegador
- **Responsive**: Mobile-first con breakpoints sm/md/lg. Navbar colapsable, grid de características responsive, testimonios apilables en móvil, hero centrado en una columna.

### Rutas e integración SPA

- La landing page se renderiza en la ruta `/` (pública, sin autenticación)
- Los usuarios autenticados son redirigidos a `/dashboard`
- El botón "Comenzar gratis" navega a `/auth` usando `window.navigateTo('/auth')`
- Los anchor links (`#features`, `#how-it-works`, etc.) hacen scroll suave dentro de la misma página

### Diseño y paleta de colores

- Fondo: `#FFF8F1` (crema)
- Acentos: `#C9A84C` (dorado) y `#755B00` (terracota)
- Texto: `#1E1B15` (casi negro)
- Secundario: `#9E8E6E` (gris cálido)
- Detalles: `#376847` (verde) — usado en el logo SVG
- Tipografía: Playfair Display (títulos, font-display), DM Sans (cuerpo, font-sans)
