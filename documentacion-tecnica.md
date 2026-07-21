# Prismavent — Documento técnico
## *"From start to glow, we've got the flow"*

**Desarrollado por:**

- Dylan Andres Gamero Puerta — PO / Backend
- Daniel Echeverría Pardo — Líder / Backend developer
- Brayan David Lozada Chaparro — Backend developer
- Dilan David Chávez Vanegas — Frontend developer
- Leonardo José Pérez Chacon — Frontend developer
- Sayder Junior Carreño Ochoa — Scrum Master

Barranquilla, Atlántico, Colombia

---

## Tabla de contenido

1. Introducción y contexto del proyecto
2. Objetivos
3. Alcance del proyecto
4. Historias de usuario
5. Arquitectura de la solución
6. Modelo de datos
7. Justificación tecnológica
8. Metodología ágil
9. Landing page institucional
10. Roadmap Post-MVP

---

## 1. Introducción y contexto del proyecto

### 1.1 Nombre del proyecto

Prismavent — *"From start to glow, we've got the flow"*

### 1.2 Problema identificado

Actualmente, la organización de eventos enfrenta múltiples dificultades debido al uso de herramientas y procesos dispersos para gestionar actividades, presupuestos, proveedores, invitados y cronogramas. La falta de una plataforma centralizada genera desorganización, pérdida de información, problemas de comunicación, retrasos en la ejecución y un mayor riesgo de errores que pueden afectar el éxito del evento. Como consecuencia, los organizadores invierten más tiempo y recursos en tareas administrativas, reduciendo la eficiencia y la capacidad de planificación.

### 1.3 Propuesta de solución

Diseñar y desarrollar una plataforma digital integral para la gestión y organización de eventos que permita centralizar, planificar, coordinar y supervisar todas las actividades relacionadas con un evento en un único entorno, optimizando los procesos de organización, mejorando la comunicación entre los involucrados y reduciendo los errores, tiempos y costos asociados a la planificación y ejecución de eventos de cualquier tipo y tamaño.

### 1.4 Diferenciador clave

La plataforma propone un ecosistema digital "todo en uno" que centraliza, automatiza y conecta todos los procesos involucrados en la organización de eventos, permitiendo gestionar desde la planificación inicial hasta la ejecución y cierre del evento en un único entorno. A diferencia de las soluciones tradicionales, elimina la necesidad de utilizar múltiples herramientas independientes, optimizando la gestión del tiempo, reduciendo errores operativos y mejorando la toma de decisiones mediante una experiencia de organización integral, eficiente e inteligente.

---

## 2. Objetivos

### 2.1 Objetivo general

Desarrollar una aplicación web que centralice la planificación y gestión de eventos en una sola plataforma, permitiendo a los usuarios crear eventos a partir de plantillas configurables, gestionar recursos y presupuesto de forma automática, acceder a un catálogo de proveedores reales de la región para contratar servicios, y visualizar información complementaria como el pronóstico del clima para la fecha del evento — eliminando la fragmentación actual entre chats, libretas y herramientas dispersas.

### 2.2 Objetivos específicos

- **2.2.1** Centralizar la gestión de la información y los recursos de un evento en una única plataforma digital, facilitando la administración de actividades, presupuestos, proveedores e invitados.
- **2.2.2** Optimizar la planificación y organización de eventos mediante herramientas que permitan automatizar procesos y mejorar el seguimiento de las tareas asociadas a cada etapa del evento.
- **2.2.3** Mejorar la gestión financiera de los eventos proporcionando mecanismos para el control, seguimiento y proyección de presupuestos y gastos.
- **2.2.4** Facilitar el monitoreo y control del ciclo de vida de los eventos, permitiendo el seguimiento de su estado desde la planificación hasta su finalización.
- **2.2.5** Garantizar la seguridad y confiabilidad de la plataforma, implementando mecanismos de autenticación y protección de la información de los usuarios.
- **2.2.6** Proporcionar información complementaria para la toma de decisiones, integrando servicios externos que aporten datos relevantes para la correcta ejecución de los eventos (pronóstico del clima vía OpenWeatherMap).

### 2.3 Objetivos técnicos y/o de desarrollo

- **2.3.1** Integrar un motor de plantillas personalizables que automatice la creación de elementos logísticos y de planificación al momento de crear un nuevo evento.
- **2.3.2** Diseñar e implementar un procesador financiero dinámico que permita generar proyecciones presupuestarias y administrar los recursos económicos asociados al evento.
- **2.3.3** Desarrollar un directorio de proveedores regionales con filtros avanzados que facilite la búsqueda y vinculación de servicios dentro de la gestión financiera del evento.
- **2.3.4** Implementar un ciclo de gestión operativa de eventos compuesto por los estados: Borrador, Confirmado, En Progreso y Realizado, permitiendo un seguimiento integral de cada evento.
- **2.3.5** Incorporar un sistema de autenticación y gestión de identidades mediante Supabase Auth, garantizando un acceso seguro a la plataforma.
- **2.3.6** Integrar la API de OpenWeatherMap para proporcionar información climática prevista y apoyar la toma de decisiones durante la planificación del evento.
- **2.3.7** Desplegar la aplicación en un entorno de producción utilizando Vercel (frontend) y Google Cloud Run (backend), asegurando la disponibilidad y accesibilidad de la plataforma antes de su presentación y puesta en marcha.
- **2.3.8** Implementar un tablero Kanban para la gestión visual de tareas asociadas a cada evento, con soporte para arrastrar y soltar entre columnas de estado.
- **2.3.9** Desarrollar una landing page institucional responsiva con SEO, animaciones y llamado a la acción para captación de nuevos usuarios.
- **2.3.10** Implementar diseño responsive completo en todas las pantallas de la aplicación para garantizar una experiencia óptima en dispositivos móviles y de escritorio.

---

## 3. Alcance del proyecto

### 3.1 MVP definido

El Producto Mínimo Viable (MVP) de Prismavent tiene como objetivo validar la propuesta de valor de la plataforma, ofreciendo las funcionalidades esenciales para que un usuario pueda crear, organizar y gestionar un evento de manera integral desde un único entorno digital.

La versión actual de la plataforma incluye las siguientes funcionalidades:

#### 3.1.1 Gestión de usuarios y autenticación
- Registro e inicio de sesión de usuarios mediante Supabase Auth
- Cierre de sesión seguro
- Gestión de credenciales y autenticación mediante JWT
- Protección de rutas con middleware de autorización
- Actualización de perfil de usuario (nombre y contraseña)

#### 3.1.2 Creación y administración de eventos
- Creación de eventos mediante plantillas predefinidas (Boda, Cumpleaños, Tech, Personalizado)
- Creación de eventos desde cero con formulario personalizado
- Generación automática de recursos asociados al tipo de evento seleccionado
- Edición inline de datos básicos del evento (nombre, fecha, ubicación, presupuesto)
- Eliminación de eventos (solo en estado "borrador")
- Cambio de estado del evento con registro en historial (Borrador → Confirmado → En Progreso → Realizado)

#### 3.1.3 Gestión de recursos y planificación
- Administración de los recursos necesarios para el evento (crear, editar, eliminar)
- Seguimiento del estado de cada recurso mediante toggle de confirmación
- Visualización de progreso mediante anillo de porcentaje
- Página independiente de recursos con tabla, filtros, búsqueda y paginación

#### 3.1.4 Gestión de tareas (Kanban)
- Tablero Kanban con columnas: Por Hacer, En Progreso, Realizado
- Arrastrar y soltar (drag & drop) para cambiar estado de tareas
- Creación, edición y eliminación de tareas
- Animaciones de transición al mover tarjetas entre columnas

#### 3.1.5 Gestión de invitados
- Registro de invitados por nombre completo
- Confirmación de asistencia (RSVP)
- Panel de invitados en el detalle del evento con conteo de confirmados y pendientes
- Página independiente de invitados con tabla, filtros y búsqueda

#### 3.1.6 Gestión financiera
- Generación automática de un presupuesto estimado basado en los recursos asociados al evento
- Monitoreo de gastos y alertas al superar los límites presupuestarios establecidos
- Visualización de presupuesto con gauge circular y desglose por ítem

#### 3.1.7 Seguimiento del ciclo de vida del evento
- Stepper visual de 4 pasos: Borrador → Confirmado → En Progreso → Realizado
- Registro automático de cambios de estado en `event_history`
- Bloqueo de edición en eventos finalizados

#### 3.1.8 Gestión de proveedores
- Catálogo de proveedores con filtros por categoría
- Búsqueda por nombre con filtrado en tiempo real
- Detalle de proveedor con información completa
- Vinculación de proveedores como recursos del evento

#### 3.1.9 Historial de eventos
- Visualización de eventos finalizados en formato de tarjetas
- Acceso a información histórica para fines de referencia
- Modo solo lectura en eventos finalizados

#### 3.1.10 Servicios de información complementaria
- Consulta de condiciones climáticas previstas para la fecha y ciudad del evento mediante integración con OpenWeatherMap
- Widget de clima integrado en la sección de información del evento (junto a la ciudad)
- Mensaje informativo si la fecha está fuera del rango de pronóstico (más de 7 días)

#### 3.1.11 Dashboard principal
- Tarjetas de estadísticas: total eventos, próximos, en progreso, realizados
- Gráfica de estado de eventos (barras de progreso)
- Lista de próximos eventos ordenados por fecha
- Acciones rápidas (Nuevo evento, Mis eventos, Proveedores, Plantillas)

#### 3.1.12 Landing page institucional
- Hero con llamado a la acción y gradiente decorativo
- Secciones: Características, Cómo funciona, Testimonios, CTA final
- Navbar y footer responsivos con logo de Prismavent
- Animaciones suaves al hacer scroll (Intersection Observer)
- Meta tags SEO (Open Graph, Twitter Cards, description, keywords)
- Botón "Comenzar gratis" redirige a la página de registro
- Prismas flotantes animados en el fondo de toda la aplicación
- Estadísticas dinámicas con datos reales desde `GET /stats` (eventos, invitados, proveedores, usuarios)
- Loading cover con spinner y logo mientras carga la SPA

#### 3.1.13 Diseño responsive
- Sidebar adaptativo con toggle en móvil y hover-expand en desktop
- Todas las páginas adaptadas a pantallas desde 320px hasta 1920px
- Tablas con scroll horizontal en móvil, grids responsivos, formularios apilables
- Barra de progreso (EventStepper) responsiva con overflow-x-auto en móvil

#### 3.1.14 Seguridad y rendimiento
- Rate limiting en endpoints de autenticación con slowapi (5 intentos/minuto por IP)
- Conexión a base de datos con pool de conexiones configurado: `pool_pre_ping=True`, `pool_recycle=300`, `pool_size=5`
- Loading cover con logo de Prismavent y spinner mientras carga la SPA
- Skeleton loading con `animate-pulse` en páginas de proveedores, historial y admin

#### 3.1.15 Panel de administración
- Sistema de roles (admin/user) con rutas protegidas vía `require_admin()`
- Sidebar con navegación diferenciada: admins solo ven Dashboard + Administrar + Cerrar Sesión
- CRUD completo de proveedores con tabla, búsqueda, filtro por categoría y paginación
- CRUD completo de categorías de proveedores con protección de integridad referencial
- Dashboard admin con métricas: total eventos, invitados, usuarios, proveedores, distribución por estado
- Preservación de datos en modales al cerrar accidentalmente (con botón "Limpiar")
- Endpoint público `GET /stats` para estadísticas de la landing page sin autenticación

### 3.2 Fuera del alcance (MVP)

Las siguientes funcionalidades han sido identificadas como oportunidades de evolución del producto; sin embargo, no forman parte de la primera versión de Prismavent:

- **3.2.1** Integración de pagos en línea (procesamiento de pagos mediante pasarelas como Stripe o PayU)
- **3.2.2** Sistema de comunicación en tiempo real (chat integrado entre organizadores y proveedores)
- **3.2.3** Funcionalidades basadas en Inteligencia Artificial (sugerencias automáticas, recomendaciones)
- **3.2.4** Sistema de videoconferencias integrado
- **3.2.5** Gestión avanzada de roles y permisos (más allá de admin/user)
- **3.2.6** Exportación y generación de documentos (PDF, Excel)
- **3.2.7** Sincronización con calendarios externos (Google Calendar, iCal)
- **3.2.8** Notificaciones por email y push
- **3.2.9** PWA (Progressive Web App) — instalable en dispositivos móviles
- **3.2.10** Sistema de reseñas y calificaciones para proveedores

### 3.3 Usuarios objetivo

La plataforma está diseñada para individuos y colectivos que requieren optimizar la coordinación de eventos, abordando las ineficiencias causadas por procesos fragmentados y el uso de herramientas no integradas.

#### 3.3.1 Organizadores de eventos sociales
Planificadores ocasionales que gestionan celebraciones como bodas, aniversarios, cumpleaños, festividades privadas y encuentros familiares. Este perfil suele requerir una solución que centralice la administración financiera, logística y la vinculación con servicios externos ante la falta de experiencia previa.

#### 3.3.2 Organizadores independientes y emprendedores
Especialistas con flujos de trabajo constantes en áreas como planificación de eventos independientes, administración de comunidades digitales, grupos de networking y pequeñas firmas de logística técnica. Buscan optimizar la gestión simultánea de proyectos, asegurando el control presupuestario y la supervisión detallada de cada proveedor y tarea operativa.

#### 3.3.3 Instituciones educativas y organizaciones culturales
Entidades responsables de la ejecución de hackatones, eventos tecnológicos, muestras y ferias de conocimiento, protocolos institucionales y programas de integración comunitaria. Estos grupos priorizan la eficiencia en el uso de recursos limitados mediante procesos ágiles que eliminen la dispersión de información en múltiples plataformas.

| Segmento | Necesidad principal | Beneficio de Prismavent |
|---|---|---|
| Organizadores sociales | Simplificar la planificación | Centralización y automatización |
| Organizadores profesionales | Gestionar múltiples eventos | Control y seguimiento integral |
| Instituciones y comunidades | Optimizar recursos | Herramientas ágiles y económicas |

---

## 4. Historias de usuario

### 4.1 Tabla de historias de usuario del MVP

| ID | HISTORIA DE USUARIO | PRIORIDAD | SP | VERSIÓN | ESTADO |
|---|---|---|---|---|---|
| **EPIC 1 — Planeación y gestión del proyecto** | | | | | |
| PLAN-01 | Configurar herramientas del equipo (Discord, Jira) | Alta | 2 | v0.1 | ✅ Done |
| PLAN-02 | Definir y documentar alcance, objetivos y problema | Alta | 3 | v0.1 | ✅ Done |
| PLAN-03 | Diseñar modelo de datos y diagrama ER | Alta | 3 | v0.1 | ✅ Done |
| PLAN-04 | Documentar arquitectura de la solución | Alta | 2 | v0.1 | ✅ Done |
| **EPIC 2 — Diseño UX/UI** | | | | | |
| DESIGN-01 | Definir identidad visual (nombre, colores, tipografía) | Alta | 2 | v0.1 | ✅ Done |
| DESIGN-02 | Crear mockups de todas las pantallas del MVP en Figma | Alta | 5 | v0.1 | ✅ Done |
| DESIGN-03 | Definir componentes base del frontend (Design System) | Media | 2 | v0.1 | ✅ Done |
| **EPIC 3 — Configuración técnica y repositorio** | | | | | |
| DEVOPS-01 | Crear y configurar repositorio GitHub con GitFlow | Alta | 2 | v0.1 | ✅ Done |
| DEVOPS-02 | Configurar entorno base FastAPI + Supabase | Alta | 3 | v0.1 | ✅ Done |
| DEVOPS-03 | Configurar entorno base frontend SPA con Tailwind | Alta | 2 | v0.1 | ✅ Done |
| **EPIC 4 — Autenticación con Supabase Auth** | | | | | |
| AUTH-01 | Registro, inicio y cierre de sesión con Supabase Auth | Alta | 2 | v1.0 | ✅ Done |
| **EPIC 5 — Gestión de eventos** | | | | | |
| EVT-01 | Crear evento (personalizado y desde plantilla) | Alta | 8 | v1.0 | ✅ Done |
| EVT-02 | Ver lista de mis eventos con progreso y estado | Alta | 3 | v1.0 | ✅ Done |
| EVT-03 | Ver detalle de un evento (canvas de recursos + presupuesto) | Alta | 3 | v1.0 | ✅ Done |
| EVT-04 | Cambiar estado del evento con registro en historial | Alta | 3 | v1.0 | ✅ Done |
| EVT-05 | Editar datos básicos del evento | Alta | 2 | v1.0 | ✅ Done |
| EVT-06 | Eliminar evento (solo en estado borrador) | Alta | 2 | v1.0 | ✅ Done |
| **EPIC 6 — Recursos del evento** | | | | | |
| REC-01 | Añadir recurso al evento | Alta | 3 | v1.0 | ✅ Done |
| REC-02 | Editar recurso (cantidad, precio, notas) | Alta | 2 | v1.0 | ✅ Done |
| REC-03 | Eliminar recurso del evento | Alta | 1 | v1.0 | ✅ Done |
| REC-04 | Marcar recurso como confirmado o pendiente | Alta | 2 | v1.0 | ✅ Done |
| **EPIC 7 — Presupuesto** | | | | | |
| PRES-01 | Ver presupuesto estimado automático | Alta | 2 | v1.0 | ✅ Done |
| PRES-02 | Alerta de límite de presupuesto | Alta | 1 | v1.0 | ✅ Done |
| PRES-03 | Consultar clima del día del evento (OpenWeatherMap) | Media | 3 | v1.0 | ✅ Done |
| **EPIC 8 — Proveedores** | | | | | |
| PROV-01 | Ver catálogo de proveedores con filtros por categoría | Alta | 5 | v1.0 | ✅ Done |
| PROV-02 | Ver detalle completo de un proveedor | Media | 2 | v1.0 | ✅ Done |
| PROV-03 | Añadir proveedor como recurso directo al evento | Media | 3 | v1.0 | ✅ Done |
| **EPIC 9 — Historial** | | | | | |
| HIST-01 | Ver historial de eventos finalizados en cards | Media | 2 | v1.0 | ✅ Done |
| HIST-02 | Ver log de cambios de estado de un evento | Baja | 2 | v1.0 | ✅ Done |
| **EPIC 10 — Despliegue, pruebas y sustentación** | | | | | |
| DEPLOY-01 | Desplegar frontend en Vercel con URL pública | Alta | 2 | v1.1 | 🔄 En progreso |
| DEPLOY-02 | Desplegar backend FastAPI en Google Cloud Run | Alta | 2 | v1.1 | 🔄 En progreso |
| DEPLOY-03 | Documentar casos de prueba y evidencias funcionales | Alta | 3 | v1.1 | 🔄 En progreso |
| DEPLOY-04 | Completar documento técnico final | Alta | 3 | v1.1 | 🔄 En progreso |
| DEPLOY-05 | Preparar y ensayar pitch comercial en inglés (10 min) | Alta | 3 | v1.1 | ⏳ Pendiente |
| DEPLOY-06 | Preparar y ensayar pitch técnico en español (20 min) | Alta | 3 | v1.1 | ⏳ Pendiente |
| **EPIC 12 — Panel de administración** | | | | | |
| ADMIN-01 | Sistema de roles (admin/user) con sidebar diferenciado | Alta | 3 | v2.0 | ✅ Done |
| ADMIN-02 | CRUD de proveedores con tabla, búsqueda, filtros y paginación | Alta | 5 | v2.0 | ✅ Done |
| ADMIN-03 | CRUD de categorías de proveedores con integridad referencial | Alta | 3 | v2.0 | ✅ Done |
| ADMIN-04 | Dashboard admin con métricas (eventos, usuarios, proveedores, distribución) | Alta | 3 | v2.0 | ✅ Done |
| ADMIN-05 | Endpoint público `GET /stats` para landing page con datos reales | Alta | 2 | v2.0 | ✅ Done |
| ADMIN-06 | Preservación de datos en modales al cerrar + botón Limpiar | Media | 1 | v2.0 | ✅ Done |

### 4.2 Historias de usuario adicionales (completadas fuera de la planificación inicial)

| ID | HISTORIA DE USUARIO | PRIORIDAD | SP | VERSIÓN | ESTADO |
|---|---|---|---|---|---|
| **EPIC 5 (Extensión) — Gestión de invitados** | | | | | |
| GUEST-01 | Gestión completa de invitados por nombre (CRUD) | Alta | 5 | v1.0 | ✅ Done |
| GUEST-02 | Página independiente de invitados con filtros y búsqueda | Alta | 3 | v1.0 | ✅ Done |
| **EPIC 5 (Extensión) — Tareas Kanban** | | | | | |
| TASK-01 | Tablero Kanban con columnas y drag & drop | Alta | 5 | v1.0 | ✅ Done |
| TASK-02 | Creación, edición y eliminación de tareas | Alta | 3 | v1.0 | ✅ Done |
| **EPIC 2 (Extensión) — Diseño responsive** | | | | | |
| RESP-01 | Adaptar todas las pantallas a diseño responsive | Alta | 8 | v1.0 | ✅ Done |
| **EPIC 5 (Extensión) — Recursos** | | | | | |
| RES-01 | Página independiente de recursos con tabla y paginación | Media | 3 | v1.0 | ✅ Done |
| **EPIC 10 (Extensión) — Landing page** | | | | | |
| LAND-01 | Landing page institucional con SEO y animaciones | Alta | 3 | v1.1 | ✅ Done |

### 4.3 Historias de usuario del panel de administracion

| ID | HISTORIA DE USUARIO | PRIORIDAD | SP | VERSION | ESTADO |
|---|---|---|---|---|---|
| **EPIC 12 — Panel de administracion** | | | | | |
| ADMIN-01 | Sistema de roles (admin/user) con sidebar diferenciado | Alta | 3 | v2.0 | Listo |
| ADMIN-02 | CRUD de proveedores con tabla, busqueda, filtros y paginacion | Alta | 5 | v2.0 | Listo |
| ADMIN-03 | CRUD de categorias de proveedores con integridad referencial | Alta | 3 | v2.0 | Listo |
| ADMIN-04 | Dashboard admin con metricas (eventos, usuarios, proveedores, distribucion) | Alta | 3 | v2.0 | Listo |
| ADMIN-05 | Endpoint publico GET /stats para landing page con datos reales | Alta | 2 | v2.0 | Listo |
| ADMIN-06 | Preservacion de datos en modales al cerrar + boton Limpiar | Media | 1 | v2.0 | Listo |

### 4.4 Historias de usuario — Post-MVP (planificadas)

| ID | HISTORIA DE USUARIO | PRIORIDAD | SP | VERSION |
|---|---|---|---|---|
| **EPIC 11 — Post-MVP: Fundacion tecnica y presencia digital** | | | | |
| PMVP-02 | Ciberseguridad: rate limiting, headers HTTP, sanitizacion | Alta | 3 | v2.0 |
| PMVP-03 | Calidad de codigo: linters, type hints, tests, manejo de archivos | Alta | 5 | v2.0 |

### 4.4 Definition of Done (DoD)

**CÓDIGO:**
- El código fue escrito por el integrante asignado en su propia rama `feature/`
- El código compila y ejecuta sin errores en el entorno local del desarrollador
- No hay `print()`, `console.log()` ni código comentado de depuración en el código entregado
- Las variables, funciones y endpoints tienen nombres descriptivos en inglés (`snake_case` en Python, `camelCase` en JS)
- No hay credenciales, API keys ni tokens hardcodeados en el código — todo va en `.env`
- Los endpoints del backend retornan los códigos HTTP correctos: 200, 201, 400, 401, 403, 404, 409 según corresponda
- Las validaciones de datos están implementadas en el backend con Pydantic — no se confía solo en las validaciones del frontend

**GIT Y CONTROL DE VERSIONES:**
- El trabajo fue desarrollado en una rama `feature/nombre-descriptivo`, nunca directo en `develop` o `main`
- Hay mínimo 2 commits propios con mensajes que siguen el formato: `feat:`, `fix:`, `docs:`, etc.
- Se abrió un Pull Request desde la rama `feature/` hacia `develop`
- El PR fue revisado y aprobado por al menos 1 compañero antes de fusionar
- El PR no tiene conflictos con `develop` — el desarrollador los resolvió antes de pedir revisión
- El archivo `.env` no fue incluido en ningún commit — solo `.env.example`

**PRUEBAS Y CALIDAD:**
- El desarrollador probó manualmente el flujo completo de la US antes de abrir el PR
- Se probaron los escenarios alternativos: datos inválidos, campos vacíos, usuario no autenticado, permisos incorrectos
- Se documentó al menos 1 caso de prueba formal en la tabla de evidencias del documento técnico
- Si se encontró un bug durante las pruebas, fue corregido antes de mover la US a "Listo" — no se deja como deuda técnica
- La funcionalidad no rompe ninguna US ya completada anteriormente (no hay regresiones)

**DISEÑO Y FRONTEND:**
- La pantalla o componente implementado es fiel al mockup aprobado en Figma — no hay decisiones de diseño improvisadas
- La interfaz es responsive — funciona correctamente en pantallas de 320px a 1920px
- Los textos de la UI están en español. Las etiquetas de código (variables, funciones) en inglés
- Los precios se muestran en formato `$1.200.000 COP` (punto como separador de miles, sin decimales)
- Los estados de error, carga y vacío están implementados — no se entrega una pantalla que solo funciona con datos perfectos
- El usuario recibe feedback visual (toast, alerta o mensaje) cuando una acción falla o tiene éxito

**DOCUMENTACIÓN:**
- Si la US agrega un endpoint nuevo, está documentado en el README del backend con su método, ruta, body y respuesta esperada
- Si la US requiere una nueva variable de entorno, fue agregada al archivo `.env.example` con un comentario descriptivo
- Si la US modifica el modelo de datos, el diagrama ER en dbdiagram.io fue actualizado
- La evidencia de prueba de esta US fue añadida al documento técnico en la sección "Evidencia de pruebas"

**SCRUM Y JIRA:**
- La Story fue movida a "Listo" en el tablero de Jira
- Todas las Tasks hijas de la Story están marcadas como completadas en Jira
- El desarrollador anunció en `#daily-standup` de Discord que la US fue completada
- Los criterios de aceptación específicos de la US fueron verificados y cumplen en el entorno de `develop`, no solo en local

---

## 5. Arquitectura de la solución

### 5.1 Diagrama de arquitectura

```
┌──────────────────────────────────────────────────────┐
│                    CLIENTE (Navegador)                │
│  Single Page Application (SPA)                        │
│  HTML5 + CSS3 + JavaScript (Vanilla) + Tailwind CSS   │
│  Desplegada en Vercel (CDN global, HTTPS)            │
└───────────────┬──────────────────────────────────────┘
                │  HTTPS (JSON)
                ▼
┌──────────────────────────────────────────────────────┐
│            FASTAPI (Google Cloud Run)                 │
│                                                      │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ Middlewares      │  │   Routers     │  │  Services    │ │
│  │ Security + Auth  │──│  15 routers   │──│  8 services  │ │
│  │ CORS + Rate limit│  │  + GET /stats │  │             │ │
│  └─────────────┘  └──────────────┘  └─────────────┘ │
│                                                      │
│  Google Cloud Run: autoescala, HTTPS, 2M req/mes     │
└───────────────┬──────────────────────────────────────┘
                │  SQL (supabase-py)
                ▼
┌──────────────────────────────────────────────────────┐
│              SUPABASE (PostgreSQL 15)                 │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐                  │
│  │  Auth (JWT)  │  │  PostgreSQL  │                  │
│  │  user mgmt   │  │  15+ tablas  │                  │
│  │  RLS activo  │  │  3FN + JSONB │                  │
│  └──────────────┘  └──────────────┘                  │
│                                                      │
│  Row Level Security activado                         │
└──────────────────────────────────────────────────────┘
```

### 5.2 Descripción de cada capa

#### 5.2.1 Capa de presentación — Frontend

Es la interfaz con la que el usuario interactúa directamente. Está construida como una Single Page Application (SPA) usando HTML5, CSS3, JavaScript Vanilla y Tailwind CSS. Implementa navegación entre secciones sin recargar la página mediante `window.history.pushState` y el evento `popstate`, lo que genera una experiencia fluida sin necesidad de frameworks.

El frontend incluye:
- **15+ páginas/componentes**: Dashboard, Mis Eventos, Detalle de Evento, Crear Evento (personalizado y plantilla), Proveedores, Historial, Invitados, Recursos, Tareas Kanban, Mis Plantillas, Landing Page, Auth (login/register)
- **Diseño responsive**: Adaptado a pantallas desde 320px hasta 1920px, con sidebar colapsable en desktop y toggle en móvil
- **Sistema de iconos SVG**: Componente `Icons.js` con 25+ iconos personalizados
- **Sistema de notificaciones**: Toast para feedback de operaciones exitosas/fallidas
- **Animaciones**: Intersection Observer para fade-in-up, prismas flotantes animados en el fondo, transiciones CSS

Se comunica exclusivamente con el backend mediante peticiones HTTP usando `fetch()`, adjuntando en cada petición el token de autenticación en el header `Authorization: Bearer {token}`. Está desplegada en Vercel con deploy automático desde la rama `main` del repositorio.

#### 5.2.2 Capa de lógica de negocio — Backend

Es el núcleo del sistema. Está construida con FastAPI (Python 3.11+) y servida mediante Uvicorn. Esta capa es responsable de todas las reglas de negocio del sistema:

- **Arquitectura por capas**: `routers/` (11 routers HTTP), `services/` (6 servicios de lógica de negocio), `schemas/` (10 esquemas Pydantic para validación), `models/` (9 modelos SQLAlchemy ORM), `middlewares/` (autenticación JWT + CORS)
- **15 routers**: auth, events, templates, guests, event_items, weather, providers, provider_categories, user_templates, event_tasks, cities, admin_providers, admin_provider_categories, admin_metrics, public_stats
- **8 servicios**: auth_service, budget_service, event_service, event_task_service, guest_service, provider_service, weather_service, security utils
- **Middleware de seguridad**: `SecurityHeadersMiddleware` que agrega headers de seguridad HTTP (X-Content-Type-Options, X-Frame-Options, HSTS, CSP)
- **Middleware de autenticación**: `SupabaseAuthMiddleware` que verifica JWT con `supabase.auth.get_user(token)` en cada ruta protegida, con manejo de CORS integrado
- **Rate limiting**: SlowAPI con límite de 5 intentos por minuto en endpoints `/auth/login` y `/auth/register`

La API cuenta con **15 routers** (auth, events, guests, event_items, weather, providers, provider_categories, templates, user_templates, event_tasks, cities, admin_providers, admin_provider_categories, admin_metrics) y un endpoint público `GET /stats` sin autenticación para la landing page.

Está desplegada en Google Cloud Run con autoescalado a cero cuando no hay tráfico, HTTPS automático y hasta 2 millones de requests por mes en el tier gratuito.

#### 5.2.3 Capa de persistencia — Base de datos

Es donde vive toda la información del sistema de forma permanente. Está gestionada por Supabase, que provee PostgreSQL 15 con Row Level Security activado. Incluye el servicio Supabase Auth para la gestión de usuarios y tokens JWT, eliminando la necesidad de implementar esa infraestructura manualmente.

Contiene 15+ tablas normalizadas hasta Tercera Forma Normal con relaciones mediante llaves foráneas, y se inicializa con datos semilla (seed data) que contienen las 4 plantillas base y el catálogo de proveedores locales.

---

## 6. Modelo de datos

### 6.1 Diagrama ER

El diagrama entidad-relación completo fue creado en dbdiagram.io y está disponible en el repositorio del proyecto. Las entidades principales y sus relaciones se describen en las secciones siguientes.

*[PENDIENTE: Insertar imagen exportada del diagrama ER de dbdiagram.io]*

### 6.2 Descripción de tablas

A continuación se describen las entidades principales del sistema (13 tablas en total):

| Tabla | Descripción |
|---|---|
| `cities` | Ciudades de referencia para eventos y proveedores (con departamento y país) |
| `profiles` | Información extendida de usuarios autenticados (full_name, phone, avatar_url, city_id, role admin/user). Vinculada 1:1 con `auth.users` de Supabase |
| `event_types` | Categorías de eventos (bodas, cumpleaños, tech, personalizado) con metadatos visuales (color_bg, color_icon) |
| `templates` | Plantillas predefinidas del sistema con sus `default_items` en JSONB, vinculadas a event_types |
| `user_templates` | Plantillas personalizadas creadas por usuarios, con `items` en JSONB, vinculadas a event_types |
| `provider_categories` | Categorías de proveedores (Catering, Sonido, Decoración, Fotografía, etc.) |
| `providers` | Catálogo de proveedores con datos de contacto, ubicación, precio referencial, rating, email, website, image_url |
| `provider_reviews` | Reseñas de proveedores con rating (1-5), comentario, vinculadas a provider + user (unique) |
| `events` | Entidad central con datos del evento: fecha, presupuesto, invitados, estado, ciudad, ubicación, duración, descripción |
| `event_items` | Recursos vinculados a un evento con cantidad, precio unitario, confirmación, notas y proveedor asociado |
| `event_tasks` | Tareas del tablero Kanban con título, descripción, estado (todo/in_progress/done), prioridad (low/medium/high), due_date |
| `guests` | Invitados de un evento con nombre, confirmación (RSVP) y notas |
| `event_history` | Registro de cambios de estado de eventos (previous_status → new_status, changed_by, comment, timestamp) |

### 6.3 Relaciones y cardinalidades

- **Usuarios a Eventos (1:N)**: Un usuario puede crear múltiples eventos; cada evento pertenece a un único creador
- **Tipos de Evento a Plantillas (1:N)**: Cada tipo de evento puede tener múltiples plantillas
- **Eventos a Items (1:N)**: Un evento contiene múltiples recursos/ítems
- **Eventos a Tareas (1:N)**: Un evento tiene múltiples tareas en el tablero Kanban
- **Eventos a Invitados (1:N)**: Un evento tiene múltiples invitados
- **Eventos a Historial (1:N)**: Un evento tiene múltiples registros de cambio de estado
- **Categorías a Proveedores (1:N)**: Cada categoría agrupa múltiples proveedores
- **Proveedores a Items (1:N)**: Un proveedor puede estar referenciado en múltiples ítems de eventos
- **Ciudades a Eventos (1:N)**: Cada ciudad puede estar asociada a múltiples eventos
- **Ciudades a Proveedores (1:N)**: Cada ciudad puede estar asociada a múltiples proveedores
- **Proveedores a Reseñas (1:N)**: Un proveedor puede tener múltiples reseñas de usuarios
- **Eventos a Tareas (1:N)**: Cada evento tiene múltiples tareas en el tablero Kanban

### 6.4 Reglas de negocio

El modelo de datos incorpora restricciones para garantizar el cumplimiento de las reglas funcionales del sistema:

1. Cada evento pertenece a un único usuario autenticado
2. Un usuario puede crear múltiples eventos
3. Un usuario puede crear múltiples plantillas personalizadas
4. Un evento puede originarse a partir de una plantilla del sistema o de una plantilla personalizada, pero nunca de ambas simultáneamente
5. El usuario puede crear un evento desde una plantilla base, añadir recursos adicionales y luego guardar esa configuración como plantilla personalizada
6. El presupuesto total del evento no se almacena como dato persistente; se calcula dinámicamente a partir de la suma del costo de todos los recursos registrados
7. El total calculado se contrasta con `max_budget` para mostrar alerta cuando el presupuesto sea superado
8. El estado del evento solo puede avanzar siguiendo la secuencia: `borrador → confirmado → in_progress → done`
9. No se permite retroceder estados ni omitir etapas del flujo de planificación
10. Un evento puede eliminarse físicamente solo cuando su estado sea `borrador`
11. Si el evento está en otro estado, no se elimina físicamente; se archiva u oculta para conservar trazabilidad
12. Cuando se elimina un evento permitido, los recursos asociados, invitados, tareas y el historial correspondiente se eliminan automáticamente mediante `ON DELETE CASCADE`
13. Los proveedores pueden ser utilizados en múltiples eventos sin afectar la información histórica, ya que el precio del recurso se copia al momento de asociarlo al evento
14. Los recursos añadidos manualmente no requieren proveedor asociado; `provider_id` en `event_items` es nullable
15. Los recursos confirmados y pendientes son parte del mismo evento y su estado se guarda en `event_items.confirmed`
16. Los eventos finalizados deben mantenerse visibles solo como historial o pueden ser ocultados según la regla de archivado; en el detalle se deshabilitan todos los controles de edición
17. Un usuario solo puede modificar, eliminar o ver los eventos que le pertenecen
18. Las plantillas del sistema son administradas por el equipo y no por el usuario final
19. Las tareas del Kanban se gestionan por estado: `todo`, `in_progress`, `done`
20. Los invitados se gestionan con nombre completo y estado de confirmación (RSVP)
21. El pronóstico del clima solo está disponible para fechas dentro de los próximos 7 días; fuera de ese rango se muestra un mensaje informativo
22. El widget de clima se oculta automáticamente para eventos en estado `finalizado`
23. Las tareas Kanban tienen estados: `todo`, `in_progress`, `done` y se pueden mover entre columnas
24. La fecha límite (`due_date`) de una tarea no puede superar la fecha del evento
25. Los invitados se gestionan por nombre completo con estado de confirmación (RSVP) y notas opcionales
26. El catálogo de proveedores es administrado solo por usuarios con rol `admin` mediante endpoints dedicados
27. Las reseñas de proveedores son únicas por usuario-proveedor (no se puede reseñar dos veces)
28. Los datos estadísticos públicos (`GET /stats`) no requieren autenticación

---

## 7. Justificación tecnológica

### 7.1 Backend
- **Lenguaje**: Python 3.11+
- **Framework**: FastAPI (asíncrono, validación automática con Pydantic v2, documentación OpenAPI automática en `/docs`)
- **ORM**: SQLAlchemy (conexión a Supabase PostgreSQL, pooling de conexiones, transacciones)
- **Validación**: Pydantic v2 (schemas para request/response, validadores custom)
- **Servidor**: Uvicorn (ASGI, alta concurrencia)
- **Variables de entorno**: python-dotenv
- **Seguridad**: Sanitización de inputs (`sanitize_string()` elimina HTML), validación de UUIDs, logging de intentos fallidos de login
- **Headers de seguridad**: Middleware personalizado que inyecta X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security y Content-Security-Policy
- **Rate limiting**: slowapi (5 intentos/minuto en `/auth/login` y `/auth/register`)
- **Testing**: pytest (108 tests: unitarios + integración, mock de APIs externas)

### 7.2 Base de datos
- **Motor**: PostgreSQL 15 (vía Supabase)
- **Justificación**: El modelo de datos de Prismavent tiene relaciones claras y predecibles entre usuarios, eventos, plantillas y recursos. PostgreSQL garantiza integridad referencial, permite consultas JOIN eficientes para calcular presupuestos y simplifica la normalización hasta 3FN. Se utiliza JSONB para `templates.default_items` y `user_templates.items` sin violar 3FN, ya que estos elementos no constituyen entidades independientes.

### 7.3 Frontend
- **Base**: HTML5 + CSS3 + JavaScript Vanilla
- **Estilos**: Tailwind CSS v4
- **Arquitectura**: SPA (Single Page Application) con router basado en `pushState`/`popstate`
- **Páginas**: 15 páginas SPA (Landing, Auth, Dashboard, MyEvents, EventDetail, CreateEvent, CustomEventFlow, TemplateEventFlow, Providers, Guests, Resources, Tasks, History, AdminProviders, AdminCategories)
- **Componentes**: 23 componentes reutilizables (Sidebar, Topbar, Icons, Toast, EventCard, EventStepper, EventTemplatesGrid, CustomEventForm, NewEventSelection, BudgetPanel, BudgetProgressGauge, GuestPanel, GuestModal, ProviderCard, ProviderDrawer, TasksPanel, WeatherWidget, AddToEventModal, DeleteEventModal, DeleteResourceModal, EditEventModal, SaveTemplateModal)
- **Iconos**: Sistema de iconos SVG personalizados (`Icons.js`)
- **Tipografía**: Playfair Display (títulos) + DM Sans (cuerpo)

### 7.4 Herramientas del equipo
- **Control de versiones**: Git + GitHub con GitFlow
- **Gestión del proyecto**: Jira
- **Comunicación**: Discord
- **Diseño**: Figma
- **Documento técnico**: Google Docs
- **Modelado BD**: dbdiagram.io
- **Arquitectura**: draw.io

### 7.5 API de terceros
- **OpenWeatherMap**: Pronóstico del clima para el día del evento. API gratuita, sin tarjeta de crédito. Los datos se obtienen mediante el endpoint `GET /events/{id}/weather` que consulta la API externa y retorna temperatura, condición, descripción e ícono.

### 7.6 Despliegue
- **Frontend**: Vercel ([prismavent.vercel.app](https://prismavent.vercel.app), deploy automático desde rama `main`, CDN global, SSL gratuito)
- **Backend**: Google Cloud Run o servidor e2 ([http://34.139.94.6:8000](http://34.139.94.6:8000)), Dockerizado
- **Base de datos**: Supabase (PostgreSQL 15 gestionado, Auth integrado, Row Level Security)

---

## 8. Metodología ágil

### 8.1 Descripción de la metodología

El equipo adoptó la metodología **Scrum** para el desarrollo de Prismavent, organizando el trabajo en 3 sprints:

- **Sprint 0 (v0.1)**: Planeación, diseño UX/UI y configuración técnica (Épicas 1-3)
- **Sprint 1 (v1.0)**: Autenticación, gestión de eventos, recursos, presupuesto, proveedores e historial (Épicas 4-9)
- **Sprint 2 (v1.1)**: Despliegue, pruebas, documentación y sustentación (Épica 10)

**Ceremonias implementadas:**
- Daily Standup en el canal `#daily-standup` de Discord
- Sprint Planning al inicio de cada sprint para definir qué US entran y estimar SP
- Sprint Review al final de cada sprint para demostrar funcionalidades completadas
- Sprint Retrospective para identificar mejoras y compromisos para el siguiente sprint

**Duración de sprints**: 2-3 semanas cada uno, con un total de 93 story points planificados en 35 historias de usuario.

### 8.2 Roles del equipo

| Integrante | Rol Scrum | Responsabilidades |
|---|---|---|
| Dylan Andres Gamero Puerta | Product Owner / Backend | Definición del backlog, priorización de US, desarrollo backend (FastAPI, Supabase, routers, servicios) |
| Daniel Echeverría Pardo | Líder técnico / Backend | Arquitectura del backend, revisión de PR, desarrollo de servicios core, integración con Supabase |
| Brayan David Lozada Chaparro | Backend developer | Desarrollo de endpoints, gestión de estados, historial, eliminación de eventos, tareas |
| Dilan David Chávez Vanegas | Frontend developer | Desarrollo de interfaz de usuario, componentes, recursos, presupuesto, clima, responsive |
| Leonardo José Pérez Chacon | Frontend developer | Desarrollo de interfaz de usuario, SPA routing, autenticación, eventos, proveedores, landing page |
| Sayder Junior Carreño Ochoa | Scrum Master | Facilitación de ceremonias, gestión de Jira, documentación, diseño UX/UI en Figma |

### 8.3 Evidencias — Sprint 0

*[PENDIENTE: Captura del tablero Jira al inicio y final del Sprint 0]*

### 8.4 Evidencias — Sprint 1

*[PENDIENTE: Captura del tablero Jira al inicio y final del Sprint 1]*

### 8.5 Evidencias — Sprint 2

*[PENDIENTE: Captura del tablero Jira al inicio y final del Sprint 2]*

### 8.6 Burndown chart

*[PENDIENTE: Captura del burndown de Jira mostrando la velocidad del equipo]*

### 8.7 Evidencia de dailys

*[PENDIENTE: Capturas del canal #daily-standup de Discord mostrando al menos 5 días de seguimiento por sprint]*

### 8.8 Actas de Sprint Planning

*[PENDIENTE: Resumen de qué se decidió en cada sesión de planificación: qué US entran, SP comprometidos, quién hace qué]*

### 8.9 Actas de Sprint Retrospective

*[PENDIENTE: Qué salió bien, qué mejorar, compromisos para el siguiente sprint. Una por cada sprint]*

---

## 9. Landing page institucional

Como parte del desarrollo, se implementó una landing page institucional para Prismavent con el objetivo de captar nuevos usuarios y comunicar la propuesta de valor de la plataforma antes del registro.

### 9.1 Características implementadas

- **Ruta pública**: La landing page se renderiza en la ruta raíz (`/`) de la SPA, sin requerir autenticación. Los usuarios autenticados que visitan `/` son redirigidos automáticamente al dashboard.
- **Secciones**:
  - **Navbar**: Logo de Prismavent + enlaces de navegación interna + botón "Comenzar gratis". Menú hamburguesa responsive en móvil.
  - **Hero**: Título principal, subtítulo, badge "Plataforma todo-en-uno", dos CTAs ("Comenzar gratis" → `/auth`, "Ver características" → scroll a sección)
  - **Estadísticas**: 10,000+ eventos creados, 50,000+ invitados gestionados, 98% satisfacción, 4.9 valoración
  - **Características**: Grid de 6 tarjetas con iconos SVG (Gestión de Invitados, Control de Presupuesto, Recursos, Tablero Kanban, Directorio de Proveedores, Clima del Evento)
  - **Cómo funciona**: 3 pasos con conectores visuales (Crea tu evento → Personaliza → Ejecuta)
  - **Testimonios**: 3 tarjetas con citas de clientes ficticios (María García, Carlos Mendoza, Ana López)
  - **CTA final**: Fondo gradiente oscuro con llamado a la acción "Comenzar gratis — es gratis"
  - **Footer**: 4 columnas (logo, producto, compañía, newsletter), redes sociales, copyright
  - **Botón "Volver arriba"**: Flotante, visible al hacer scroll > 400px

### 9.2 Aspectos técnicos

- **Archivo**: `frontend/src/pages/LandingPage.js`
- **Animaciones**: Intersection Observer para efecto fade-in-up en todas las secciones al hacer scroll
- **Prismas flotantes**: 10 triángulos SVG animados con colores de marca, flotan hacia arriba rotando 360°. Inician ocultos (`display:none`) y aparecen con fade-in tras el render para evitar parpadeo.
- **Loading cover**: Pantalla de carga con logo Prismavent + spinner animado, se desvanece 50ms después del primer render vía JS.
- **Estadísticas dinámicas**: Las cifras se cargan desde `GET /stats` (endpoint público, sin autenticación) con formato `1K+`, mostrando datos reales de eventos, invitados, proveedores y usuarios registrados.
- **SEO**: Meta tags implementados en `index.html`: description, keywords, Open Graph (og:title, og:description, og:image, og:type, og:url, og:locale), Twitter Cards (twitter:card, twitter:title, twitter:description, twitter:image)
- **Favicon**: Logo de Prismavent (`logo.png` en `public/`)
- **Rendering condicional**: La landing page se renderiza como parte del SPA en `main.js`, con la lógica: `path === '/' → LandingPage()`, `path === '/auth' → Auth()`. Los usuarios autenticados son redirigidos a `/dashboard`

---

## 10. Roadmap Post-MVP

Una vez completado el MVP, se han planificado las siguientes épicas para continuar el desarrollo de la plataforma:

### Épica 11 — Post-MVP: Fundación técnica y presencia digital

| ID | Historia | SP | Prioridad |
|---|---|---|---|
| PMVP-01 | Landing page institucional (SEO, analytics, optimización continua) | 3 | Alta |
| PMVP-02 | Ciberseguridad: rate limiting, headers HTTP (CSP, HSTS, X-Frame-Options), sanitización de inputs, validación de UUIDs, logging de intentos fallidos | 3 | Alta |
| PMVP-03 | Calidad de código: Ruff + ESLint/Prettier, pre-commit hooks, type hints, tests unitarios (pytest con 40% cobertura), validaciones extra, manejo de archivos (avatares y portadas con Supabase Storage) | 5 | Alta |

### Épica 12 — Panel de administración de proveedores

| ID | Historia | SP | Prioridad |
|---|---|---|---|
| ADMIN-01 | Panel de administración: sistema de roles (admin/user), ruta protegida `/admin/providers`, CRUD completo de proveedores y categorías, búsqueda y filtros, dashboard de métricas | 8 | Alta |

---

## 📊 Resumen del backlog

| Épica | Sprint | Stories | SP Total | Estado |
|---|---|---|---|---|
| Epic 1 — Planeación | Sprint 0 | 4 | 10 | ✅ Done |
| Epic 2 — Diseño UX/UI | Sprint 0 | 3 | 9 | ✅ Done |
| Epic 3 — Config. técnica | Sprint 0 | 3 | 7 | ✅ Done |
| Epic 4 — Autenticación | Sprint 1 | 1 | 2 | ✅ Done |
| Epic 5 — Eventos | Sprint 1 | 6 (+ 6 ext.) | 21 (+ 27) | ✅ Done |
| Epic 6 — Recursos | Sprint 2 | 4 (+ 1 ext.) | 8 (+ 3) | ✅ Done |
| Epic 7 — Presupuesto | Sprint 2 | 3 | 6 | ✅ Done |
| Epic 8 — Proveedores | Sprint 2 | 3 | 10 | ✅ Done |
| Epic 9 — Historial | Sprint 2 | 2 | 4 | ✅ Done |
| Epic 10 — Despliegue | Sprint 2 | 6 (+ 1 ext.) | 16 (+ 3) | 🔄 En progreso |
| Epic 11 — Post-MVP | Futuro | 2 | 8 | ⏳ Pendiente |
| Epic 12 — Admin | Sprint 3 | 6 | 17 | ✅ Done |
| **TOTAL** | | **51** | **155+** | |

---

*Documento generado el 17 de julio de 2026. Versión actualizada con el estado real del proyecto.*
