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

## 4. Estrategia de Consultas a Base de Datos: SQL Directo vs ORM

En **Prismavent**, decidimos implementar un enfoque híbrido en el acceso a datos. Aunque usamos **SQLAlchemy** como infraestructura, los routers ejecutan consultas **SQL directas/nativas** mediante `db.execute(text(...))` en lugar de utilizar métodos puros del ORM (como `db.query(Model)` o `db.add()`).

### 4.1 ¿Por qué decidimos usar SQL Directo en los routers?

1. **Rendimiento superior (Evitar "Overhead" del ORM):**
   El ORM tradicional realiza la "hidratación" de objetos, mapeando cada fila obtenida de la base de datos a una instancia de modelo de Python y rastreando su estado de cambios. En flujos de lectura y escritura rápidos de la API, esto genera un consumo de CPU innecesario. Al usar `result._mapping`, obtenemos diccionarios de clave-valor nativos que se inyectan directamente en los esquemas de validación de Pydantic, acelerando la respuesta drásticamente.

2. **Control absoluto y depuración fluida:**
   Facilita la escritura y mantenimiento de sentencias complejas de SQL (por ejemplo, inserciones multitabla utilizando `RETURNING`, cláusulas `ON CONFLICT`, o filtrados avanzados). El desarrollador escribe exactamente el mismo código que correría en el explorador de Supabase o PostgreSQL, sin tener que descifrar la sintaxis equivalente en el DSL de consultas de SQLAlchemy.

3. **Prevención de dependencias circulares:**
   Evitamos tener que importar todos los modelos físicos de base de datos (`app/models/event.py`, `app/models/event_item.py`, etc.) en cada router simplemente para hacer consultas sencillas. Esto desacopla el router del modelo físico del ORM y previene bugs de importación circular en Python.

### 4.2 ¿Qué rol mantiene SQLAlchemy entonces?

SQLAlchemy no se descarta; se utiliza como el motor de infraestructura central para:
* **Manejo del Ciclo de Vida y Sesión de Conexiones:** La inyección de dependencias `Depends(get_db)` gestiona automáticamente cuándo se abre y cierra cada sesión de base de datos (`SessionLocal`).
* **Pooling de Conexiones:** Mantenemos las ventajas de rendimiento del pooling nativo de conexiones a Postgres.
* **Control de Transacciones:** Lógicas críticas de escritura (como clonar ítems de una plantilla al crear un evento) siguen gozando de la seguridad de transacciones ACID gracias a los métodos `db.commit()` y `db.rollback()`.

### 4.3 Seguridad y Prevención de Inyección SQL (SQL Injection)

El enfoque de SQL directo es **completamente seguro contra Inyección SQL** en el backend actual de **Prismavent** debido a que todas las consultas dinámicas implementan **parametrización estricta**.

Cuando el motor de base de datos recibe una consulta parametrizada, compila la estructura SQL por separado de los datos de entrada. Esto significa que si un atacante envía código malicioso (ej. `'; DROP TABLE events; --`), Postgres tratará dicha entrada estrictamente como un valor de tipo string o UUID y no como código ejecutable.

#### Ejemplo de Código Seguro en el Backend:
```python
# SEGURO: La query y los datos de entrada se envían al motor de base de datos por separado.
event_res = db.execute(
    text("SELECT * FROM events WHERE id = :id AND user_id = :user_id"),
    {"id": event_id, "user_id": current_user.id}
).fetchone()
```

### 4.4 Recomendaciones de Seguridad para Desarrolladores

Para evitar brechas de seguridad accidentales, el equipo de desarrollo de backend debe apegarse a las siguientes normas:

1. **Uso Obligatorio de `text()`:** Todas las sentencias SQL escritas en string dentro de Python deben ser explícitamente envueltas en el constructor `text()` de SQLAlchemy.
2. **Prohibición de Interpolación y Concatenación:**
   * **NUNCA** utilices F-strings de Python (ej. `f"SELECT * FROM events WHERE id = '{event_id}'"`) para ingresar variables.
   * **NUNCA** utilices concatenación de strings con el operador `+` para construir queries.
   * **NUNCA** utilices interpolación clásica con el operador `%`.
3. **Mapeo con Placeholders y Diccionarios:** Toda variable dinámica debe declararse en el string de la query usando la sintaxis `:nombre_parametro`, y pasarse como un diccionario en el segundo argumento de `db.execute()`.
4. **Validación Previa con Pydantic:** Todos los datos recibidos desde peticiones HTTP deben ser previamente validados y sanitizados a través de los esquemas de Pydantic antes de llegar a la capa de base de datos.

---

## 5. Guía de Pruebas y Mocking de Autenticación

Al escribir pruebas de integración para endpoints protegidos, se debe usar `fastapi.testclient.TestClient`. Como la autenticación se maneja a nivel de middleware interceptor, sigue estas buenas prácticas:

1. **Mockear el Middleware**: Sobrescribe la función `get_supabase_client` del middleware de autenticación (`app.middlewares.auth_middleware.get_supabase_client`) para que retorne un cliente de prueba mockeado.
2. **Controlar el Usuario Autenticado**: Haz que la llamada mockeada retorne un objeto de usuario simulado con el ID necesario para las pruebas de propiedad.
3. **Enviar Cabeceras de Autorización**: En cada petición del cliente de pruebas, envía un Bearer Token en los headers (ej. `headers={"Authorization": "Bearer test-token"}`) para habilitar el paso exitoso del middleware.
## 6. Estándar de Arquitectura Frontend: Patrón de Componentes y Rutas

A raíz del desarrollo del flujo de creación de eventos (plantilla vs. personalizado), surgieron dos patrones distintos e incompatibles para construir pantallas en el frontend. El equipo definió cuál es el estándar oficial de ahora en adelante.

### Patrón Oficial (Adoptado)

* **Componentes como funciones que devuelven un string de HTML**, insertado en el DOM vía `innerHTML`.
* **Navegación mediante URLs reales**, usando `window.history.pushState()` seguido de `window.dispatchEvent(new PopStateEvent("popstate"))`.
* `main.js` centraliza el ruteo: escucha `popstate` y decide qué componente renderizar según `window.location.pathname`.
* Los manejadores de eventos (`onclick`, `onsubmit`, etc.) se registran como funciones globales en `window` (ej. `window.handleLogout`, `window.navigateTo`) o mediante **delegación de eventos sobre `document`** (ver sección 7) cuando el elemento aún no existe en el DOM al momento de cargar el script.

**Ejemplo correcto:**
```js
window.handleTemplateSelect = function (option) {
  window.history.pushState({}, "", "/events/new/custom");
  window.dispatchEvent(new PopStateEvent("popstate"));
};
```

### Patrón Descontinuado (No usar)

* Componentes que devuelven un nodo del DOM vía `document.createElement(...)`.
* Cambios de vista manipulando `innerHTML` de un contenedor interno, sin cambiar la URL del navegador.
* Comunicación entre componentes mediante `CustomEvent` / `window.dispatchEvent(new CustomEvent(...))` en vez de rutas.
* Navegación forzando `window.location.reload()`.

**Por qué se descartó:** rompe la navegación por URL (recargar la página o compartir un link no lleva al usuario al mismo lugar), pierde el estado de la SPA en cada clic, y no es compatible con el sistema de rutas ya centralizado en `main.js`.

Si tu historia de usuario requiere una pantalla nueva, sigue el patrón oficial. Si encuentras código con el patrón descontinuado, coordina con el equipo antes de reescribirlo o extenderlo.

---

## 7. Advertencia: SPA y el evento `DOMContentLoaded`

**Nunca uses `document.addEventListener('DOMContentLoaded', ...)` para enganchar eventos de un formulario o componente.**

`DOMContentLoaded` se dispara **una sola vez**, cuando el HTML *inicial* del documento termina de cargar. Como esta aplicación es una SPA, la mayoría de los componentes (formularios, botones, etc.) se insertan **dinámicamente** en el DOM mucho después de ese momento — para cuando el componente existe, el evento ya se disparó y nunca se vuelve a disparar. El resultado es un bug silencioso: el listener nunca se registra y el formulario simplemente no responde a los clics, sin ningún error en consola.

**Usa delegación de eventos sobre `document` en su lugar**, que funciona sin importar cuándo se insertó el elemento:

```js
// ❌ Incorrecto: el formulario puede no existir aún cuando esto corre,
// o este evento ya pudo haber ocurrido antes de insertarlo.
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('login-form').addEventListener('submit', handleLogin);
});

// ✅ Correcto: funciona sin importar cuándo se inserta el formulario en el DOM.
document.addEventListener('submit', (e) => {
  if (e.target.id === 'login-form') {
    handleLogin(e);
  }
});
```

---

## 8. Convención de Coordinación en Ramas Compartidas

Cuando dos o más integrantes trabajan sobre archivos relacionados (por ejemplo, componentes de una misma pantalla) en la misma rama o en ramas que van a mergearse pronto, sigue estas reglas para evitar pisar el trabajo de otros:

1. **Avisa antes de subir cambios a una rama que no es la tuya**, especialmente si vas a reescribir o reemplazar archivos que otro compañero ya está usando activamente.
2. **Evita hacer push directo de código experimental o sin terminar** a la rama de otro integrante sin coordinarlo primero — usa tu propia rama o un PR para que el dueño de la rama pueda revisar antes de integrar.
3. **Si necesitas tomar contenido de otra rama** (componentes, estilos, lógica), tráelo explícitamente (`git show`, `git diff`, merge coordinado) en vez de que llegue como un push directo inesperado.
4. **Si detectas que un archivo fue sobrescrito sin aviso**, no lo reviertas en silencio: comunica el hallazgo en el canal del equipo antes de decidir cómo proceder, para evitar ciclos de "reescribir sobre lo reescrito".