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
Dividimos las responsabilidades en carpetas dedicadas dentro del directorio [app](../backend/app/):

| Responsabilidad | Ubicación Antigua | Ubicación Nueva | Propósito |
| :--- | :--- | :--- | :--- |
| **Cliente Supabase** | `app/supabase_client.py` | [app/core/supabase.py](../backend/app/core/supabase.py) | Centralizar la conexión y configuración de servicios externos. |
| **Esquemas Pydantic** | `app/auth.py` | [app/schemas/auth.py](../backend/app/schemas/auth.py) | Validación de datos de entrada/salida de la API en singular. |
| **Modelos SQLAlchemy** | *No existían* | `app/models/` | Mapeo objeto-relacional y definición del esquema físico de tablas en singular. |
| **Middleware Auth** | `app/auth.py` | [app/middlewares/auth_middleware.py](../backend/app/middlewares/auth_middleware.py) | Interceptar solicitudes HTTP globales y verificar tokens JWT. |
| **Dependencias Comunes** | *No existían* | `app/dependencies.py` | Inyectar lógica compartida (como la obtención limpia de `current_user`). |
| **Endpoints / Rutas** | `app/auth.py` | [app/routers/auth.py](../backend/app/routers/auth.py) | Definición pura de métodos HTTP, códigos de estado y respuestas en plural. |
| **Lógica y Servicios** | *No existían* | `app/services/` | Lógica de cálculo, consumo de APIs y procesos pesados aislados. |

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

Cuando trabajes en tu respectiva historia de usuario (por ejemplo, Gestión de Eventos o Gestión de Recursos), debes seguir este orden de creación de archivos, respetando la nomenclatura en **singular** para modelos/esquemas y en **plural** para los routers:

### 1. Capa de Modelos de Base de Datos (`app/models/`)
Crea el modelo de SQLAlchemy en singular. Define la tabla y sus tipos de datos correspondientes (por ejemplo, `UUID`, `Numeric`, `Date`, etc.).
* *Ejemplo*: Crear `app/models/event.py` para definir la clase `Event`. Importa y registra el modelo en `app/models/__init__.py`.

### 2. Capa de Validación y Esquemas (`app/schemas/`)
Define qué datos vas a recibir y a devolver en la API en singular usando Pydantic.
* *Ejemplo*: Crear `app/schemas/event.py` para definir `EventCreate`, `EventResponse` y `EventDetailOut`.

### 3. Capa de Lógica de Negocio y Servicios (`app/services/`)
Si la funcionalidad requiere cálculos matemáticos, validación de reglas complejas o consumo de APIs externas, encapsúlalo en un archivo de servicio. **Nunca** coloques lógica de cálculo compleja directamente en los routers.
* *Ejemplo*: Crear `app/services/budget_service.py` para calcular el costo estimado de los recursos.

### 4. Capa de Dependencias y Autenticación (`app/dependencies.py`)
Usa dependencias estándar de FastAPI para desacoplar el request del endpoint de forma reutilizable y limpia.
* *Ejemplo*: Usa `Depends(get_current_user)` para obtener el usuario autenticado desde el estado del request de Supabase JWT de forma segura.

### 5. Capa de Rutas y Controladores (`app/routers/`)
Crea el archivo del router en plural. Este archivo debe definir los endpoints necesarios (`@router.get`, `@router.post`, etc.).
* *Ejemplo*: Crear `app/routers/events.py` e importar los esquemas y servicios correspondientes.
* *Nota*: **No mezcles lógica de cálculo directa ni inicialización de clientes externos en este archivo**.

### 6. Registro en el Entry Point ([app/main.py](../backend/app/main.py))
Una vez completadas tus capas, importa y registra tu router en el archivo principal utilizando `app.include_router(tu_router)`.

---

## 4. Guía de Pruebas y Mocking de Autenticación

Al escribir pruebas de integración para endpoints protegidos, se debe usar `fastapi.testclient.TestClient`. Como la autenticación se maneja a nivel de middleware interceptor, sigue estas buenas prácticas:

1. **Mockear el Middleware**: Sobrescribe la función `get_supabase_client` del middleware de autenticación (`app.middlewares.auth_middleware.get_supabase_client`) para que retorne un cliente de prueba mockeado.
2. **Controlar el Usuario Autenticado**: Haz que la llamada mockeada retorne un objeto de usuario simulado con el ID necesario para las pruebas de propiedad.
3. **Enviar Cabeceras de Autorización**: En cada petición del cliente de pruebas, envía un Bearer Token en los headers (ej. `headers={"Authorization": "Bearer test-token"}`) para habilitar el paso exitoso del middleware.


