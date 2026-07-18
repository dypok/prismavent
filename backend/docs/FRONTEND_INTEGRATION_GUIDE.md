# Guía de Integración para Frontend - Prismavent API

Esta guía contiene la especificación de todos los endpoints disponibles en el backend de **Prismavent** hasta el momento, detallando cómo funcionan, qué parámetros requieren, qué estructuras devuelven y las reglas de autenticación que debe seguir el frontend para interactuar correctamente con la API.

---

## 1. Configuración General

* **Base URL (Desarrollo):** `http://localhost:8000` (o el puerto configurado en el servidor uvicorn).
* **CORS (Cross-Origin Resource Sharing):** La API tiene habilitado CORS para aceptar peticiones desde cualquier origen (`*`), con cualquier método HTTP (`GET`, `POST`, `PUT`, `DELETE`, etc.) y cualquier header.
* **Formatos de datos:** Todas las peticiones y respuestas utilizan formato **JSON**. Las fechas se manejan bajo el estándar ISO-8601 (`YYYY-MM-DD` para fechas y `YYYY-MM-DDTHH:MM:SSZ` para fechas con hora).

---

## 2. Autenticación (Supabase Auth)

El backend utiliza un middleware de autenticación (`SupabaseAuthMiddleware`) que valida los tokens JWT emitidos por Supabase.

### 2.1 Rutas Públicas (No requieren Token)
Las siguientes rutas no requieren ninguna cabecera de autenticación:
* `GET /` (Verificación de estado de conexión)
* `POST /auth/register` (Registro de usuario)
* `POST /auth/login` (Inicio de sesión)
* `/docs`, `/redoc`, `/openapi.json` (Documentación interactiva de Swagger)

### 2.2 Rutas Privadas (Requieren Token)
Cualquier otra ruta no listada arriba requiere que el frontend envíe el token de acceso en las cabeceras HTTP.

* **Cabecera requerida:** `Authorization: Bearer <access_token>`
* **De dónde obtener el token:** Tras un inicio de sesión exitoso mediante `POST /auth/login`, el backend devuelve el objeto `session` de Supabase. El frontend debe extraer `session.access_token` e incluirlo en las cabeceras de las peticiones protegidas.
* **Errores de autenticación comunes:**
  * **HTTP 401 Unauthorized:** Si la cabecera `Authorization` no se envía o no tiene el formato `Bearer <token>`:
    ```json
    { "detail": "Missing or invalid Authorization header. Must be Bearer <token>" }
    ```
  * **HTTP 401 Unauthorized:** Si el token ha expirado o es inválido:
    ```json
    { "detail": "Token verification failed: <motivo_del_fallo>" }
    ```

---

## 3. Endpoints de Autenticación (`/auth`)

### 3.1 Registro de Usuario
* **Endpoint:** `POST /auth/register`
* **Descripción:** Registra un nuevo usuario en Supabase Auth y guarda sus metadatos adicionales (nombre y teléfono).
* **Cuerpo de la Petición (Request Body):**
  ```json
  {
    "email": "usuario@ejemplo.com",
    "password": "mi_password_seguro_123",
    "name": "Juan Pérez",
    "phone": "+573001234567"
  }
  ```
* **Respuesta Exitosa (HTTP 200 OK):**
  ```json
  {
    "message": "Registration successful. Please check your email for verification.",
    "user": {
      "id": "9f716fd2-e147-4211-a5c0-98e0f5143e19",
      "email": "usuario@ejemplo.com",
      "user_metadata": {
        "name": "Juan Pérez",
        "phone": "+573001234567"
      }
    }
  }
  ```

### 3.2 Inicio de Sesión (Login)
* **Endpoint:** `POST /auth/login`
* **Descripción:** Autentica al usuario con email y contraseña, devolviendo la sesión y el token de acceso para peticiones futuras.
* **Cuerpo de la Petición (Request Body):**
  ```json
  {
    "email": "usuario@ejemplo.com",
    "password": "mi_password_seguro_123"
  }
  ```
* **Respuesta Exitosa (HTTP 200 OK):**
  ```json
  {
    "message": "Login successful.",
    "session": {
      "access_token": "eyJhbGciOi...",
      "token_type": "bearer",
      "expires_in": 3600,
      "refresh_token": "def456...",
      "user": { ... }
    },
    "user": {
      "id": "9f716fd2-e147-4211-a5c0-98e0f5143e19",
      "email": "usuario@ejemplo.com"
    }
  }
  ```

### 3.3 Cerrar Sesión (Logout)
* **Endpoint:** `POST /auth/logout`
* **Seguridad:** Requiere Token (`Authorization: Bearer <token>`).
* **Descripción:** Invalida la sesión actual del usuario en Supabase.
* **Respuesta Exitosa (HTTP 200 OK):**
  ```json
  {
    "message": "Logout successful."
  }
  ```

---

## 4. Endpoints de Plantillas (`/templates`)

### 4.1 Obtener Plantillas del Sistema
* **Endpoint:** `GET /templates`
* **Seguridad:** Requiere Token (`Authorization: Bearer <token>`).
* **Descripción:** Obtiene un listado de plantillas de eventos disponibles en el sistema (por ejemplo, bodas, cumpleaños) que incluyen una lista de recursos recomendados (`template_items`).
* **Respuesta Exitosa (HTTP 200 OK):**
  ```json
  [
    {
      "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "event_type_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
      "name": "Boda Estándar",
      "description": "Plantilla recomendada para bodas de hasta 100 invitados con recursos esenciales.",
      "template_items": [
        {
          "name": "Catering / Comida",
          "quantity": 100,
          "reference_price": "45.00"
        },
        {
          "name": "Decoración de Salón",
          "quantity": 1,
          "reference_price": "850.00"
        }
      ]
    }
  ]
  ```

---

## 5. Endpoints de Eventos (`/events`)

### 5.1 Crear Evento
* **Endpoint:** `POST /events`
* **Seguridad:** Requiere Token (`Authorization: Bearer <token>`).
* **Descripción:** Crea un nuevo evento. Si se especifica un `template_id` o `user_template_id`, el backend clona automáticamente todos los ítems de esa plantilla hacia la tabla `event_items` del evento recién creado, inicializándolos en estado no confirmado y con precios unitarios de referencia.
* **Cuerpo de la Petición (Request Body):**
  ```json
  {
    "name": "Boda de Ana y Luis",
    "description": "Celebración en salón campestre.",
    "event_date": "2026-10-12",
    "guest_count": 80,
    "max_budget": 5000.00,
    "template_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "user_template_id": null,
    "city_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
    "city_custom": null,
    "event_type_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    "location": "Salón Eventos Green Meadows",
    "visibility_status": "active"
  }
  ```
  > [!NOTE]
  > El campo `event_date` **debe ser una fecha futura**. Si se envía la fecha de hoy o una fecha pasada, el backend responderá con un error de validación `HTTP 422 Unprocessable Entity` o `HTTP 400 Bad Request`.
* **Respuesta Exitosa (HTTP 200 OK):**
  ```json
  {
    "id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44",
    "user_id": "9f716fd2-e147-4211-a5c0-98e0f5143e19",
    "name": "Boda de Ana y Luis",
    "description": "Celebración en salón campestre.",
    "event_date": "2026-10-12",
    "guest_count": 80,
    "max_budget": "5000.00",
    "template_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "user_template_id": null,
    "city_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
    "city_custom": null,
    "event_type_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    "location": "Salón Eventos Green Meadows",
    "status": "borrador",
    "visibility_status": "active",
    "created_at": "2026-07-09T14:30:00Z",
    "updated_at": "2026-07-09T14:30:00Z"
  }
  ```

### 5.2 Obtener Detalle de un Evento (Con Presupuesto y Contadores de Invitados)
* **Endpoint:** `GET /events/{event_id}`
* **Seguridad:** Requiere Token (`Authorization: Bearer <token>`).
* **Descripción:** Obtiene la información detallada de un evento específico que pertenezca al usuario autenticado. Incluye el cálculo del presupuesto, alerta, lista de recursos, lista de invitados y los contadores agregados para el dashboard del cliente.
* **Parámetros de Ruta (Path Parameters):**
  * `event_id` (UUID): ID único del evento.
* **Respuesta Exitosa (HTTP 200 OK):**
  ```json
  {
    "id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44",
    "user_id": "9f716fd2-e147-4211-a5c0-98e0f5143e19",
    "name": "Boda de Ana y Luis",
    "description": "Celebración en salón campestre.",
    "event_date": "2026-10-12",
    "guest_count": 80,
    "max_budget": "5000.00",
    "template_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "user_template_id": null,
    "city_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
    "city_custom": null,
    "event_type_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    "location": "Salón Eventos Green Meadows",
    "status": "borrador",
    "visibility_status": "active",
    "created_at": "2026-07-09T14:30:00.000Z",
    "updated_at": "2026-07-09T14:30:00.000Z",
    "event_items": [
      {
        "id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55",
        "name": "Catering / Comida",
        "quantity": 80,
        "unit_price": "45.00",
        "confirmed": false,
        "notes": null
      }
    ],
    "guests": [
      {
        "id": "8f88c8b8-4c4c-4e4e-8e8e-c8c8b8a8b8c8",
        "event_id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44",
        "full_name": "Juan Perez",
        "confirmed": true,
        "notes": "Vegetariano",
        "created_at": "2026-07-10T11:00:00Z",
        "updated_at": "2026-07-10T11:00:00Z"
      },
      {
        "id": "7f77c7b7-3c3c-3e3e-7e7e-c7c7b7a7b7c7",
        "event_id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44",
        "full_name": "Maria Lopez",
        "confirmed": false,
        "notes": "Mesa 3",
        "created_at": "2026-07-10T11:05:00Z",
        "updated_at": "2026-07-10T11:05:00Z"
      }
    ],
    "registered_guests_count": 2,
    "confirmed_guests_count": 1,
    "unconfirmed_guests_count": 1,
    "total_estimated": "4450.00",
    "over_budget": false,
    "budget_exceeded_by": "0.00"
  }
  ```

### 5.3 Actualizar Evento (Edición Parcial - PATCH)
* **Endpoint:** `PATCH /events/{event_id}`
* **Seguridad:** Requiere Token (`Authorization: Bearer <token>`).
* **Descripción:** Permite actualizar de forma parcial la información de un evento existente (por ejemplo, cambiar el nombre, presupuesto máximo, fecha, etc.). Sólo se actualizarán los campos que sean enviados en el cuerpo de la petición (hasta 9 campos editables).
* **Campos Editables en el Body:**
  * `name` (String, Opcional): Nuevo nombre del evento.
  * `description` (String, Opcional): Nueva descripción.
  * `event_date` (String YYYY-MM-DD, Opcional): Nueva fecha. **Debe ser una fecha futura (posterior a hoy)**; de lo contrario, responderá con HTTP 400.
  * `guest_count` (Integer, Opcional): Cantidad manual de invitados. **Sólo es editable cuando el modo de tracking de invitados por nombre está desactivado**; si el modo de tracking está activo, este campo no se acepta y la petición responderá con HTTP 400.
  * `max_budget` (Decimal, Opcional): Nuevo presupuesto máximo.
  * `city_id` (String UUID, Opcional): ID de la ciudad del evento.
  * `city_custom` (String, Opcional): Nombre de ciudad personalizada.
  * `location` (String, Opcional): Dirección o ubicación del evento.
  * `visibility_status` (String, Opcional): Estado de visibilidad (ej. `"active"`).
  
  > [!IMPORTANT]
  > Campos como `id`, `user_id`, `status`, `template_id`, `user_template_id`, `created_at` y `updated_at` **no son editables** y se ignoran silenciosamente si son enviados en la petición. El campo `updated_at` se actualiza de forma automática por el backend a `NOW()` en cada edición exitosa.

  > [!CAUTION]
  > Si el estado actual del evento es `"finalizado"`, el evento es inmutable. Cualquier intento de actualizarlo retornará un error `HTTP 400 Bad Request`.

* **Cuerpo de la Petición (Request Body) - Ejemplo:**
  ```json
  {
    "name": "Boda de Ana y Luis - Nueva Fecha",
    "event_date": "2026-10-15",
    "max_budget": 6000.00
  }
  ```
* **Respuesta Exitosa (HTTP 200 OK):**
  Retorna el detalle completo del evento actualizado (con el mismo formato que `GET /events/{event_id}`), recalculando también las métricas de presupuesto:
  ```json
  {
    "id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44",
    "user_id": "9f716fd2-e147-4211-a5c0-98e0f5143e19",
    "name": "Boda de Ana y Luis - Nueva Fecha",
    "description": "Celebración en salón campestre.",
    "event_date": "2026-10-15",
    "guest_count": 80,
    "max_budget": "6000.00",
    "template_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "user_template_id": null,
    "city_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
    "city_custom": null,
    "event_type_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    "location": "Salón Eventos Green Meadows",
    "status": "borrador",
    "visibility_status": "active",
    "created_at": "2026-07-09T14:30:00.000Z",
    "updated_at": "2026-07-09T15:10:00.000Z",
    "event_items": [
      {
        "id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55",
        "name": "Catering / Comida",
        "quantity": 80,
        "unit_price": "45.00",
        "confirmed": false,
        "notes": null
      }
    ],
    "guests": [],
    "registered_guests_count": 0,
    "confirmed_guests_count": 0,
    "unconfirmed_guests_count": 0,
    "total_estimated": "3600.00",
    "over_budget": false,
    "budget_exceeded_by": "0.00"
  }
  ```

### 5.4 Eliminar Evento (DELETE)
* **Endpoint:** `DELETE /events/{event_id}`
* **Seguridad:** Requiere Token (`Authorization: Bearer <token>`).
* **Descripción:** Elimina un evento existente junto con todos sus recursos e invitados asociados (eliminación en cascada).
* **Reglas de negocio aplicadas:**
  * El evento debe pertenecer al usuario autenticado (de lo contrario retorna `HTTP 404 Not Found`).
  * El evento únicamente se puede eliminar si se encuentra en estado `"borrador"`. Si se encuentra en cualquier otro estado (ej. `"planificando"`, `"confirmado"`, `"finalizado"`), la petición será rechazada con `HTTP 400 Bad Request`.
* **Respuesta Exitosa (HTTP 200 OK):**
  ```json
  {
    "message": "Evento eliminado exitosamente"
  }
  ```

---

## 6. Endpoints de Gestión de Invitados (`/events/{event_id}/guests`)

Todos los endpoints siguientes requieren token de acceso JWT en la cabecera `Authorization` y validan que el evento pertenezca al usuario autenticado. Además, si el evento está en estado `"finalizado"`, cualquier operación de escritura (`POST`, `PATCH`, `DELETE`) será bloqueada con un error `HTTP 400 Bad Request`.

### 6.1 Listar Invitados de un Evento
* **Endpoint:** `GET /events/{event_id}/guests`
* **Descripción:** Devuelve el listado completo de invitados agregados al evento en orden cronológico de creación.
* **Respuesta Exitosa (HTTP 200 OK):**
  ```json
  [
    {
      "id": "8f88c8b8-4c4c-4e4e-8e8e-c8c8b8a8b8c8",
      "event_id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44",
      "full_name": "Juan Perez",
      "confirmed": true,
      "notes": "Vegetariano",
      "created_at": "2026-07-10T11:00:00Z",
      "updated_at": "2026-07-10T11:00:00Z"
    }
  ]
  ```

### 6.2 Crear Invitado (Sincronización Automática de Cupo)
* **Endpoint:** `POST /events/{event_id}/guests`
* **Descripción:** Agrega un nuevo invitado al evento.
* **Regla Especial de Sincronización:** Si al guardar el nuevo invitado el total de personas en la lista supera el cupo previsto (`guest_count` del evento), el backend **actualizará automáticamente** el valor de `guest_count` del evento en la base de datos para alinearlo con el total real, actualizando también su fecha `updated_at`.
* **Cuerpo de la Petición (Request Body):**
  ```json
  {
    "full_name": "Carlos Gomez",
    "confirmed": false,
    "notes": "Trae acompañante"
  }
  ```
* **Respuesta Exitosa (HTTP 200 OK):**
  ```json
  {
    "id": "9a99d9b9-5c5c-5e5e-9e9e-c9c9b9a9b9c9",
    "event_id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44",
    "full_name": "Carlos Gomez",
    "confirmed": false,
    "notes": "Trae acompañante",
    "created_at": "2026-07-10T18:20:00Z",
    "updated_at": "2026-07-10T18:20:00Z"
  }
  ```

### 6.3 Editar Invitado
* **Endpoint:** `PATCH /events/{event_id}/guests/{guest_id}`
* **Descripción:** Actualiza de forma parcial el nombre, el estado de confirmación o las notas de un invitado existente.
* **Cuerpo de la Petición (Request Body):**
  ```json
  {
    "confirmed": true
  }
  ```
* **Respuesta Exitosa (HTTP 200 OK):**
  ```json
  {
    "id": "9a99d9b9-5c5c-5e5e-9e9e-c9c9b9a9b9c9",
    "event_id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44",
    "full_name": "Carlos Gomez",
    "confirmed": true,
    "notes": "Trae acompañante",
    "created_at": "2026-07-10T18:20:00Z",
    "updated_at": "2026-07-10T18:20:02Z"
  }
  ```

### 6.4 Eliminar Invitado
* **Endpoint:** `DELETE /events/{event_id}/guests/{guest_id}`
* **Descripción:** Elimina el registro del invitado del evento.
* **Respuesta Exitosa (HTTP 200 OK):**
  ```json
  {
    "message": "Invitado eliminado exitosamente"
  }
  ```

---

## 7. Lógica de Negocio de Presupuestos (Campos Clave)

Cuando consumas el endpoint `GET /events/{event_id}`, verás dos campos de vital importancia para la interfaz del usuario:
1. **`total_estimated` (String conteniendo un Decimal):** Es la suma calculada en el backend de todos los ítems del evento, multiplicando cantidad por precio unitario:
    $$\text{total\_estimated} = \sum (\text{quantity} \times \text{unit\_price})$$
2. **`over_budget` (Boolean):**
   * Es `true` si `total_estimated` supera estrictamente el presupuesto máximo definido (`max_budget`).
   * Es `false` si el total estimado está dentro del presupuesto máximo, o si `max_budget` es `null`.
   * Esta alerta está diseñada para activar alertas visuales (ejemplo: cambiar la barra a color rojo) en el dashboard del cliente.
3. **`budget_exceeded_by` (String conteniendo un Decimal):**
   * Indica la diferencia monetaria exacta por la cual el total estimado excede el presupuesto máximo.
   * Es `0.00` si no se ha excedido el presupuesto o si `max_budget` no está definido.
4. **Tipados y Validación de `max_budget`:**
   * Al enviar el valor de `max_budget` (en peticiones `POST /events` o `PATCH /events/{event_id}`), el frontend debe enviarlo como un valor numérico (`number`) o una cadena de texto conteniendo un número válido (ej. `"5000.00"`), o `null` si no hay límite de presupuesto.
   * **Tipos admitidos en la lógica del backend**: `Decimal`, `float`, `int`, `str` o `None` (`null`).
   * Enviar tipos de datos no compatibles (como arreglos `[]` o diccionarios `{}`) está prohibido y será rechazado por la capa de validación de esquemas (Pydantic), resultando en un error `HTTP 422 Unprocessable Entity`.

---

## 8. Endpoints de Gestión de Recursos del Evento (`/events/{event_id}/items`)

Todos los endpoints de gestión de recursos (`event_items`) requieren que el frontend envíe el token de acceso en las cabeceras HTTP (`Authorization: Bearer <token>`). Además, validan la propiedad del evento (solo el dueño puede alterarlos).

Para simplificar el estado en el frontend y evitar llamadas HTTP adicionales para refrescar el presupuesto o el listado del evento, **todas las operaciones de creación, edición y eliminación de recursos retornan el detalle completo y actualizado del evento (`EventDetailOut`)**, con los campos de presupuesto (`total_estimated`, `over_budget` y `budget_exceeded_by`) recalculados en tiempo real.

### 8.1 Crear Recurso (Item) del Evento
* **Endpoint:** `POST /events/{event_id}/items`
* **Descripción:** Agrega un nuevo ítem/recurso al evento especificado.
* **Cuerpo de la Petición (Request Body):**
  ```json
  {
    "name": "Música y Sonido",
    "quantity": 1,
    "unit_price": 350.00,
    "notes": "DJ local de Barranquilla"
  }
  ```
* **Respuesta Exitosa (HTTP 200 OK):**
  Retorna el objeto detallado del evento (`EventDetailOut`), idéntico al de `GET /events/{event_id}`, conteniendo la lista de recursos actualizada y el nuevo cálculo del presupuesto.

### 8.2 Editar Recurso (Item) del Evento
* **Endpoint:** `PATCH /events/{event_id}/items/{item_id}`
* **Descripción:** Edita los campos de un ítem existente (incluyendo cantidad, precio unitario, notas o si está confirmado).
* **Cuerpo de la Petición (Request Body):**
  ```json
  {
    "quantity": 2,
    "unit_price": 380.00,
    "confirmed": true
  }
  ```
* **Respuesta Exitosa (HTTP 200 OK):**
  Retorna el objeto detallado del evento (`EventDetailOut`), recalculando los totales y alertas presupuestarias inmediatamente.

### 8.3 Eliminar Recurso (Item) del Evento
* **Endpoint:** `DELETE /events/{event_id}/items/{item_id}`
* **Descripción:** Elimina un recurso del evento.
* **Respuesta Exitosa (HTTP 200 OK):**
  Retorna el objeto detallado del evento (`EventDetailOut`), reflejando la eliminación del recurso y la disminución del presupuesto estimado.

---

## 9. Endpoint de Pronóstico del Clima (`/events/{event_id}/weather`)

Permite obtener el pronóstico del clima para el día y la ciudad del evento. Este endpoint interactúa con la API de OpenWeatherMap.

### 9.1 Obtener Clima del Evento
* **Endpoint:** `GET /events/{event_id}/weather`
* **Seguridad:** Requiere Token (`Authorization: Bearer <token>`). Solo el dueño del evento puede realizar la consulta.
* **Descripción:** Consulta el pronóstico para la fecha y ciudad del evento. Si la ciudad del evento está vacía, se asume `"Barranquilla"` por defecto.
* **Reglas de Negocio:**
  * Si la fecha del evento es mayor a 7 días en el futuro (o es en el pasado), retorna una respuesta exitosa (HTTP 200 OK) con los campos climáticos en `null` y un mensaje informativo.
  * Si la fecha está dentro de los próximos 7 días, realiza la consulta y devuelve la temperatura, condición, descripción e ícono del clima correspondiente.
  * Si el servicio meteorológico externo falla o no está configurado, responde con un error HTTP 502 Bad Gateway y un detalle de error amigable.

* **Respuesta Exitosa - Clima Disponible (HTTP 200 OK):**
  ```json
  {
    "temp": 30.2,
    "condition": "Clear",
    "description": "clear sky",
    "icon": "01d",
    "message": "Forecast available"
  }
  ```

* **Respuesta Exitosa - Restricción de Fecha (HTTP 200 OK):**
  ```json
  {
    "temp": null,
    "condition": null,
    "description": null,
    "icon": null,
    "message": "Weather forecast is only available up to 7 days before the event. 8 days remaining."
  }
  ```

* **Respuesta de Error de Conexión / Externa (HTTP 502 Bad Gateway):**
  ```json
  {
    "detail": "Failed to connect to the external weather service."
  }
  ```
## 9. Endpoints de Catálogo de Proveedores (`/providers`)

Todos los endpoints de proveedores requieren que el frontend envíe el token de acceso en las cabeceras HTTP (`Authorization: Bearer <token>`).

### Seguridad y Roles (`can_edit`)
* **Lectura:** Todos los usuarios autenticados pueden consultar el catálogo de proveedores (`GET /providers` y `GET /providers/{id}`).
* **Escritura:** Solo los usuarios con rol de administrador (`admin`) pueden crear, modificar o eliminar proveedores (`POST`, `PATCH`, `DELETE`).
* **Visualización Dinámica (`can_edit`):** Para facilitar que el frontend oculte o muestre los botones de edición y borrado, las respuestas de los proveedores incluyen el campo booleano `can_edit`. Este será `true` si el usuario que realiza la petición es administrador, y `false` en caso contrario.

### 9.1 Obtener Catálogo de Proveedores
* **Endpoint:** `GET /providers`
* **Parámetros de Consulta (Query Parameters):**
  * `category_id` (UUID, opcional): Filtrar proveedores por categoría específica.
  * `search` (String, opcional): Buscar proveedores por coincidencia parcial de nombre (búsqueda insensible a mayúsculas).
* **Respuesta Exitosa (HTTP 200 OK):**
  ```json
  [
    {
      "id": "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1",
      "category_id": "c1000000-0000-0000-0000-000000000001",
      "city_id": "d1000000-0000-0000-0000-000000000001",
      "name": "Catering Barranquilla Premium",
      "description": "El mejor servicio de comida y banquetes para tu boda.",
      "phone": "3001234567",
      "website": "https://cateringbaq.com",
      "address": "Calle 72 # 45-67",
      "reference_price": "45.00",
      "price_unit": "por persona",
      "rating": "4.8",
      "created_at": "2026-07-09T14:30:00Z",
      "can_edit": false
    }
  ]
  ```

### 9.2 Obtener Detalle de un Proveedor
* **Endpoint:** `GET /providers/{provider_id}`
* **Parámetros de Ruta (Path Parameters):**
  * `provider_id` (UUID): ID del proveedor a consultar.
* **Respuesta Exitosa (HTTP 200 OK):**
  ```json
  {
    "id": "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1",
    "category_id": "c1000000-0000-0000-0000-000000000001",
    "city_id": "d1000000-0000-0000-0000-000000000001",
    "name": "Catering Barranquilla Premium",
    "description": "El mejor servicio de comida y banquetes para tu boda.",
    "phone": "3001234567",
    "website": "https://cateringbaq.com",
    "address": "Calle 72 # 45-67",
    "reference_price": "45.00",
    "price_unit": "por persona",
    "rating": "4.8",
    "created_at": "2026-07-09T14:30:00Z",
    "can_edit": false
  }
  ```

### 9.3 Crear Proveedor (Solo Admin)
* **Endpoint:** `POST /providers`
* **Seguridad:** Requiere rol `admin` (`HTTP 403 Forbidden` si no se tienen permisos).
* **Cuerpo de la Petición (Request Body):**
  ```json
  {
    "category_id": "c1000000-0000-0000-0000-000000000001",
    "city_id": "d1000000-0000-0000-0000-000000000001",
    "name": "Sonido Barranquilla",
    "description": "Servicios de DJs y amplificación profesional.",
    "phone": "3009876543",
    "website": "https://sonidobaq.com",
    "address": "Carrera 43 # 50-20",
    "reference_price": "1200000.00",
    "price_unit": "por evento",
    "rating": "4.5"
  }
  ```
* **Respuesta Exitosa (HTTP 201 Created):**
  ```json
  {
    "id": "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2",
    "category_id": "c1000000-0000-0000-0000-000000000001",
    "city_id": "d1000000-0000-0000-0000-000000000001",
    "name": "Sonido Barranquilla",
    "description": "Servicios de DJs y amplificación profesional.",
    "phone": "3009876543",
    "website": "https://sonidobaq.com",
    "address": "Carrera 43 # 50-20",
    "reference_price": "1200000.00",
    "price_unit": "por evento",
    "rating": "4.5",
    "created_at": "2026-07-16T11:00:00Z",
    "can_edit": true
  }
  ```

### 9.4 Editar Proveedor (Solo Admin)
* **Endpoint:** `PATCH /providers/{provider_id}`
* **Seguridad:** Requiere rol `admin` (`HTTP 403 Forbidden` si no se tienen permisos).
* **Descripción:** Permite actualización parcial de un proveedor.
* **Cuerpo de la Petición (Request Body):**
  ```json
  {
    "name": "Sonido Barranquilla Pro",
    "reference_price": "1400000.00"
  }
  ```
* **Respuesta Exitosa (HTTP 200 OK):**
  ```json
  {
    "id": "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2",
    "category_id": "c1000000-0000-0000-0000-000000000001",
    "city_id": "d1000000-0000-0000-0000-000000000001",
    "name": "Sonido Barranquilla Pro",
    "description": "Servicios de DJs y amplificación profesional.",
    "phone": "3009876543",
    "website": "https://sonidobaq.com",
    "address": "Carrera 43 # 50-20",
    "reference_price": "1400000.00",
    "price_unit": "por evento",
    "rating": "4.5",
    "created_at": "2026-07-16T11:00:00Z",
    "can_edit": true
  }
  ```

### 9.5 Eliminar Proveedor (Solo Admin)
* **Endpoint:** `DELETE /providers/{provider_id}`
* **Seguridad:** Requiere rol `admin` (`HTTP 403 Forbidden` si no se tienen permisos).
* **Respuesta Exitosa (HTTP 204 No Content):**
  *(Sin cuerpo en la respuesta)*

---

## 10. Endpoints de Tareas del Evento — Kanban (`/events/{event_id}/tasks`)

Permite gestionar un tablero Kanban de tareas para cada evento. Cada tarea tiene un título, descripción, prioridad visual y fecha límite. El estado de la tarea (`todo`, `in_progress`, `done`) define su columna en el tablero.

### 10.1 Listar Tareas
* **Endpoint:** `GET /events/{event_id}/tasks`
* **Seguridad:** Requiere Token (`Authorization: Bearer <token>`). Solo el dueño del evento.
* **Respuesta Exitosa (HTTP 200 OK):**
  ```json
  [
    {
      "id": "a1b2c3d4-...",
      "event_id": "e0eebc99-...",
      "title": "Contratar catering",
      "description": "Contactar al menos 3 proveedores",
      "status": "in_progress",
      "priority": "high",
      "due_date": "2026-10-05",
      "created_at": "2026-07-16T10:00:00Z",
      "updated_at": "2026-07-16T10:00:00Z"
    }
  ]
  ```

### 10.2 Crear Tarea
* **Endpoint:** `POST /events/{event_id}/tasks`
* **Seguridad:** Requiere Token. Solo el dueño del evento.
* **Cuerpo de la Petición:**
  ```json
  {
    "title": "Contratar catering",
    "description": "Contactar al menos 3 proveedores",
    "priority": "high",
    "due_date": "2026-10-05"
  }
  ```
* **Reglas de Validación:**
  * `title`: requerido, 1-255 caracteres.
  * `priority`: debe ser `low`, `medium` o `high` (default: `medium`).
  * `due_date`: requerido, debe ser una fecha futura y **no puede ser posterior a la fecha del evento**.
  * El evento no debe estar en estado `finalizado`.
* **Respuesta Exitosa (HTTP 200 OK):**
  Retorna el objeto de la tarea creada (misma estructura que en el listado).

### 10.3 Editar Tarea (Parcial)
* **Endpoint:** `PATCH /events/{event_id}/tasks/{task_id}`
* **Seguridad:** Requiere Token. Solo el dueño del evento.
* **Campos editables:** `title`, `description`, `priority`, `due_date`.
* **Cuerpo de la Petición (ejemplo):**
  ```json
  {
    "title": "Contratar catering actualizado",
    "priority": "medium"
  }
  ```
* **Validaciones:** Mismas reglas que creación para `due_date` y `priority`.
* **Respuesta Exitosa (HTTP 200 OK):**
  Retorna el objeto completo de la tarea actualizada.

### 10.4 Mover Tarea entre Columnas Kanban
* **Endpoint:** `PATCH /events/{event_id}/tasks/{task_id}/move`
* **Seguridad:** Requiere Token. Solo el dueño del evento.
* **Descripción:** Cambia exclusivamente el estado de la tarea para moverla entre columnas del tablero Kanban.
* **Cuerpo de la Petición:**
  ```json
  {
    "status": "in_progress"
  }
  ```
* **Estados válidos:** `todo`, `in_progress`, `done`.
* **Respuesta Exitosa (HTTP 200 OK):**
  Retorna el objeto completo de la tarea con el nuevo estado.

### Códigos de Error Comunes
| Código | Escenario | Detail |
|---|---|---|
| `404` | Evento o tarea no existe | `"Event not found"` / `"Task not found"` |
| `403` | Usuario no es dueño del evento | `"You do not have permission to access this event"` |
| `400` | Evento finalizado | `"Cannot modify a finalized event"` |
| `400` | `due_date` posterior a `event_date` | `"Task due date cannot be after the event date."` |
| `422` | Status inválido en `/move` | Error de validación de Pydantic |

---

## 11. Admin Providers (`/admin/providers`)

Todos los endpoints de esta sección requieren rol `admin`. Si el usuario no es administrador, el backend retorna `HTTP 403 Forbidden`.

### 11.1 Listar Proveedores (Paginado)
* **Endpoint:** `GET /admin/providers`
* **Seguridad:** `require_admin` (HTTP 403 si no es admin)
* **Parámetros Query:**
  * `page` (int, default 1): Número de página.
  * `per_page` (int, default 10, max 100): Resultados por página.
  * `search` (str, opcional): Búsqueda por nombre (ILIKE).
  * `category_id` (UUID, opcional): Filtrar por categoría.
* **Respuesta Exitosa (HTTP 200 OK):**
  ```json
  {
    "providers": [
      {
        "id": "uuid",
        "category_id": "uuid",
        "city_id": "uuid",
        "name": "Proveedor Ejemplo",
        "description": "Descripción...",
        "phone": "3001234567",
        "email": "contacto@proveedor.com",
        "website": "https://ejemplo.com",
        "address": "Calle 123",
        "image_url": "https://...",
        "reference_price": 45000.00,
        "price_unit": "por persona",
        "rating": 4.5,
        "display_rating": 4.5,
        "created_at": "2024-01-01T00:00:00Z",
        "can_edit": true
      }
    ],
    "total": 25,
    "page": 1,
    "per_page": 10,
    "pages": 3
  }
  ```
* **Nota:** `display_rating` se calcula como el promedio de `provider_reviews.rating` si existen reseñas; de lo contrario usa `providers.rating` (valor semilla).

### 11.2 Obtener Detalle de Proveedor
* **Endpoint:** `GET /admin/providers/{provider_id}`
* **Seguridad:** `require_admin`
* **Respuesta Exitosa (HTTP 200 OK):**
  ```json
  {
    "id": "uuid",
    "name": "Proveedor Ejemplo",
    "reviews": [
      {
        "id": "uuid",
        "provider_id": "uuid",
        "user_id": "uuid",
        "rating": 4.5,
        "comment": "Excelente servicio",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "can_edit": true
  }
  ```
  Incluye todos los campos de `ProviderResponse` más el array `reviews`.

### 11.3 Crear Proveedor
* **Endpoint:** `POST /admin/providers`
* **Seguridad:** `require_admin`
* **Cuerpo de la Petición:**
  ```json
  {
    "category_id": "uuid",
    "city_id": "uuid",
    "name": "Nuevo Proveedor",
    "description": "Descripción opcional",
    "phone": "3001234567",
    "email": "contacto@proveedor.com",
    "website": "https://ejemplo.com",
    "address": "Calle 123",
    "image_url": "https://...",
    "reference_price": 45000.00,
    "price_unit": "por persona",
    "rating": 4.0
  }
  ```
* **Validaciones:** `name` requerido, `category_id` y `city_id` deben existir en DB, `rating` entre 0 y 5, `reference_price` >= 0.
* **Respuesta Exitosa (HTTP 201 Created):** Retorna el objeto completo del proveedor creado.

### 11.4 Actualizar Proveedor
* **Endpoint:** `PUT /admin/providers/{provider_id}`
* **Seguridad:** `require_admin`
* **Descripción:** Reemplazo completo del proveedor. Se envían todos los campos (mismos que creación).
* **Respuesta Exitosa (HTTP 200 OK):** Retorna el objeto completo del proveedor actualizado.
* **HTTP 404:** Si el proveedor no existe.

### 11.5 Eliminar Proveedor
* **Endpoint:** `DELETE /admin/providers/{provider_id}`
* **Seguridad:** `require_admin`
* **Respuesta Exitosa (HTTP 204 No Content):** Proveedor eliminado.
* **HTTP 404:** Si el proveedor no existe.
* **HTTP 409:** Si el proveedor tiene reseñas vinculadas (`provider_reviews`). La eliminación se bloquea para mantener integridad referencial.

### Códigos de Error
| Código | Escenario | Detail |
|---|---|---|
| `403` | Usuario no es admin | `"Forbidden"` |
| `404` | Proveedor no encontrado | `"Proveedor no encontrado"` |
| `409` | Proveedor con reseñas | `"No se puede eliminar: el proveedor tiene reseñas vinculadas"` |
| `400` | Categoría o ciudad inválida | `"Categoría no encontrada"` / `"Ciudad no encontrada"` |
