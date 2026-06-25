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

### Pre-requisitos
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo.
* [Node.js](https://nodejs.org/) (Para levantar el frontend localmente).
* Git configurado.

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