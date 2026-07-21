# 🚀 Prismavent - Core Repository

Bienvenido al repositorio oficial de Prismavent. Este proyecto es una plataforma integral de gestión de eventos desarrollada bajo metodologías ágiles (Scrum) y estructurada con una arquitectura limpia.

**Autor Principal y Líder Técnico:** Dylan Gamero  
**Escuadrón de Desarrollo:** Sayder, Daniel, Bryan, Leonardo, Dilan.

---

## 🛠️ Stack Tecnológico

**Backend:**
* **Framework:** FastAPI (Python 3.11)
* **Base de Datos:** PostgreSQL (Alojada en la nube vía Supabase)
* **ORM:** SQLAlchemy (Estructura en 3FN)
* **Contenerización:** Docker & Docker Compose

**Frontend:**
* **Tecnologías:** HTML5, TailwindCSS
* **Lenguaje:** JavaScript

---

## 🚀 Cómo inicializar el proyecto en local

Para garantizar que todo el equipo trabaje en el mismo entorno sin conflictos de dependencias, el backend está completamente contenerizado. 

<<<<<<< Updated upstream
### Pre-requisitos
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo.
* [Node.js](https://nodejs.org/) (Para levantar el frontend localmente).
* Git configurado.
=======
### Para administradores
| Funcionalidad | Descripción |
|---|---|
| **CRUD de proveedores** | Tabla con búsqueda, filtros y paginación |
| **CRUD de categorías** | Gestión de categorías con integridad referencial |
| **Métricas** | Dashboard con totales, distribución por estado y más |
| **Sidebar exclusivo** | Navegación adaptada al rol |

### Experiencia de usuario
- **Landing page** institucional con estadísticas dinámicas
- **Diseño responsive** — funciona en móvil, tablet y escritorio
- **Animaciones** sutiles (prismas flotantes, fade-in-up, transiciones)
- **Carga inteligente** — skeletons, loading cover y datos perezosos
- **SPA** — navegación fluida sin recargar la página

---

## <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#755B00" stroke-width="2" stroke-linecap="round" style="vertical-align:middle;margin-right:4px"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg> Stack Tecnológico

| Capa | Tecnología | Propósito |
|---|---|---|
| **Frontend** | HTML5 + CSS3 + JavaScript Vanilla | SPA sin frameworks |
| **Estilos** | Tailwind CSS v4 | Diseño utility-first |
| **Backend** | Python 3.11+ / FastAPI | API REST asíncrona |
| **Base de datos** | PostgreSQL 15 (Supabase) | Persistencia y Auth |
| **Autenticación** | Supabase Auth + JWT | Registro, login, roles |
| **ORM** | SQLAlchemy 2.0 | Pool de conexiones |
| **Validación** | Pydantic v2 | Schemas request/response |
| **Servidor ASGI** | Uvicorn | Servidor de producción |
| **Rate limiting** | slowapi | 5 intentos/min en auth |
| **HTTP Client** | httpx | Llamadas a OpenWeatherMap |
| **Despliegue** | Vercel (frontend) + Google Cloud (backend) | Producción |

### Dependencias clave
```
fastapi, uvicorn, SQLAlchemy, psycopg2-binary, supabase,
pydantic, python-dotenv, httpx, slowapi, PyJWT, starlette
```

---

## <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#755B00" stroke-width="2" stroke-linecap="round" style="vertical-align:middle;margin-right:4px"><polyline points="4 17 10 11 10 3"/><polyline points="16 21 20 17 20 11"/><polyline points="8 21 12 17 12 11"/></svg> Arquitectura

```
┌──────────────────────────────────────────────────────┐
│              CLIENTE (Navegador / Vercel)             │
│ SPA: HTML5 + Tailwind CSS + JavaScript Vanilla       │
│ 15 páginas · 23 componentes · Router pushState       │
└───────────────┬──────────────────────────────────────┘
                │ HTTPS (JSON)
                ▼
┌──────────────────────────────────────────────────────┐
│              FASTAPI (Google Cloud / e2)              │
│                                                      │
│  Middlewares: SecurityHeaders → Auth → CORS           │
│  15 routers · 12 services · 14 schemas               │
│  10 modelos SQLAlchemy · SlowAPI rate limiting       │
└───────────────┬──────────────────────────────────────┘
                │ SQL (supabase-py)
                ▼
┌──────────────────────────────────────────────────────┐
│              SUPABASE (PostgreSQL 15)                 │
│                                                      │
│  13 tablas · Auth integrado · Row Level Security     │
│  Triggers: updated_at, rating, template validation   │
└──────────────────────────────────────────────────────┘
```

---

## <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#755B00" stroke-width="2" stroke-linecap="round" style="vertical-align:middle;margin-right:4px"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg> Capturas de Pantalla

| Landing Page | Dashboard | Eventos | Proveedores |
|---|---|---|---|
| Hero + estadísticas | Métricas admin | Grid con progreso | Catálogo con filtros |
| Panel Admin | Tablero Kanban | Detalle evento | Gestión invitados |
| CRUD proveedores | CRUD categorías | Historial | Login |

*(Capturas disponibles en la carpeta `docs/screenshots/`)*

---

## <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#755B00" stroke-width="2" stroke-linecap="round" style="vertical-align:middle;margin-right:4px"><polyline points="4 14 8 14 8 20 16 20 16 14 20 14"/><polygon points="4 14 12 2 20 14"/><line x1="12" y1="2" x2="12" y2="14"/></svg> Instalación Local

### Requisitos previos
- Node.js 18+
- Docker y Docker Compose (opcional)
- Cuenta en [Supabase](https://supabase.com) (gratis)

### Backend
>>>>>>> Stashed changes

### Paso 1: Clonar el repositorio
Asegúrate de clonar el proyecto y posicionarte en la rama de desarrollo:
```bash
git clone https://github.com/dypok/prismavent.git
cd prismavent
git checkout develop
```
### Paso 2: Variables de entorno 
Configurar el archivo .env
```
DATABASE_URL=postgresql://postgres.tu_id:TuContraseña@aws-0-region.pooler.supabase.com:6543/postgres 
 ```
### Paso 3: Levantar el backend (docker)
```
docker compose up --build
```

### Paso 4: Levantar el frontend
```
npm install
npm run dev
```

## Cómo trabajar con gitflow?

Reglas de las Ramas Principales

🔒 main: Rama de producción. Código 100% estable y funcional. Prohibido hacer commits directos aquí.

🧪 develop: Rama de integración. Aquí se unen el trabajo del frontend y el backend. Prohibido hacer commits directos aquí.

Cómo trabajar en una nueva tarea (Paso a Paso)
Todos los integrantes del escuadrón deben seguir este flujo exacto al tomar una tarjeta de GitHub Projects:

### 1. Actualizar tu entorno base:
```
git checkout develop
git pull origin develop
```
### 2. Crea tu rama aislada

```
git checkout -b feature/nombre-de-la-tarea
```

### 3. Programa y guarda tus cambios
```
git add .
git commit -m "feat: descripción clara de lo que hiciste"
```

### 4. Subes tu rama a github
```
git push -u origin feature/nombre-de-la-tarea
```