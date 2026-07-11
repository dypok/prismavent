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
    "budget_alert": false
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
    "budget_alert": false
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
2. **`budget_alert` (Boolean):**
   * Es `true` si `total_estimated` supera estrictamente el presupuesto máximo definido (`max_budget`).
   * Es `false` si el total estimado está dentro del presupuesto máximo, o si `max_budget` es `null`.
   * Esta alerta está diseñada para activar alertas visuales (ejemplo: cambiar la barra a color rojo) en el dashboard del cliente.
