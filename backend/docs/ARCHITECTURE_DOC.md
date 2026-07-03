# Guía de Referencia: Arquitectura del Backend (Prismavent)

Este documento sirve como referencia oficial para el equipo de desarrollo de **Prismavent**. Explica por qué decidimos estructurar el backend bajo una arquitectura modular por capas (estilo MVC para FastAPI) y cómo cada integrante debe implementar sus tareas de ahora en adelante para mantener el código limpio y profesional.

---

## 1. El Problema vs. La Solución

### Estructura Anterior (Acoplada)
En la estructura inicial, archivos como `auth.py` contenían:
1. Definiciones de esquemas de Pydantic (Validación).
2. Endpoints HTTP (FastAPI Routing).
3. Middleware de autenticación global (Lógica de Intercepción).
4. Inicialización directa de Supabase en archivos sueltos.

**Consecuencias**: Alto acoplamiento, dificultad para mockear o testear código, y archivos extremadamente grandes y difíciles de leer a medida que avanza el proyecto.

### Estructura Nueva (Arquitectura por Capas)
Dividimos las responsabilidades en carpetas dedicadas dentro del directorio [app](file:///C:/Users/LENOVO/Documents/DANI%20DOCS/RIWI/PROYECTO%20INTEGRADOR/prismavent/backend/app/):

| Responsabilidad | Ubicación Antigua | Ubicación Nueva | Propósito |
| :--- | :--- | :--- | :--- |
| **Cliente Supabase** | `app/supabase_client.py` | [app/core/supabase.py](file:///C:/Users/LENOVO/Documents/DANI%20DOCS/RIWI/PROYECTO%20INTEGRADOR/prismavent/backend/app/core/supabase.py) | Centralizar la conexión y configuración de servicios externos. |
| **Esquemas Pydantic** | `app/auth.py` | [app/schemas/auth.py](file:///C:/Users/LENOVO/Documents/DANI%20DOCS/RIWI/PROYECTO%20INTEGRADOR/prismavent/backend/app/schemas/auth.py) | Validación de datos de entrada/salida de la API. |
| **Middleware Auth** | `app/auth.py` | [app/middlewares/auth_middleware.py](file:///C:/Users/LENOVO/Documents/DANI%20DOCS/RIWI/PROYECTO%20INTEGRADOR/prismavent/backend/app/middlewares/auth_middleware.py) | Interceptar solicitudes HTTP globales y verificar tokens JWT. |
| **Endpoints / Rutas** | `app/auth.py` | [app/routers/auth.py](file:///C:/Users/LENOVO/Documents/DANI%20DOCS/RIWI/PROYECTO%20INTEGRADOR/prismavent/backend/app/routers/auth.py) | Definición pura de métodos HTTP, códigos de estado y respuestas. |

---

## 2. Flujo de una Petición (Lifecycle)

Cuando el cliente hace un llamado al backend, la petición sigue este flujo lineal y ordenado:

```
[ Cliente (Frontend) ]
         │ (Petición HTTP con Authorization: Bearer <JWT>)
         ▼
[ app/middlewares/auth_middleware.py ]
         │ (1. Valida el token contra Supabase Auth)
         │ (2. Inyecta el usuario en request.state.user)
         ▼
[ app/routers/auth.py ]
         │ (3. Valida el body de entrada usando el Schema)
         │ (4. Ejecuta la operación utilizando el cliente centralizado)
         ▼
[ app/core/supabase.py ] (Llama a Supabase Cloud)
```

---

## 3. Guía de Capas para Desarrolladores

Cuando trabajes en tu respectiva historia de usuario (por ejemplo, Gestión de Eventos o Gestión de Recursos), debes seguir este orden de creación de archivos:

### 1. Capa de Datos y Modelado (`app/schemas/`)
Define qué datos vas a recibir y a devolver en la API. Usa Pydantic para validar tipos de datos antes de que toquen la base de datos.
* *Ejemplo*: Crear `app/schemas/events.py` para definir `EventCreate` y `EventResponse`.

### 2. Capa de Rutas (`app/routers/`)
Crea el archivo del router y define los endpoints necesarios (`@router.get`, `@router.post`, etc.).
* *Ejemplo*: Crear `app/routers/events.py` e importar los esquemas correspondientes.
* *Nota*: **No mezcles middleware ni lógica de conexión directa en este archivo**.

### 3. Capa de Configuración o Utilidades (`app/core/`)
Si necesitas inicializar clientes de terceros (como OpenWeatherMap) o utilidades de seguridad adicionales, ponlos aquí.

### 4. Registro en el Entry Point ([app/main.py](file:///C:/Users/LENOVO/Documents/DANI%20DOCS/RIWI/PROYECTO%20INTEGRADOR/prismavent/backend/app/main.py))
Una vez completadas tus capas, importa y registra tu router en el archivo principal utilizando `app.include_router(tu_router)`.


