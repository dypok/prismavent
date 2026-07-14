# Development Summary – View My Events

## Overview

During the development of this user story, the **My Events** module was implemented, allowing authenticated users to view all the events they have created. The implementation integrated both Frontend and Backend components to provide a centralized view of user events, including calculated statistics such as progress percentage and estimated total cost. The solution follows the project's architecture while ensuring secure data access and an intuitive user experience.

---

# Frontend

The user interface was extended to integrate the **My Events** module into the application.

## Implemented Features

- Added the **My Events** page to display the authenticated user's events.
- Integrated the new view into the application's navigation menu.
- Updated the Sidebar to include direct access to the **My Events** section.
- Configured the application routing to support the new page.
- Connected the frontend with the Backend API to retrieve the authenticated user's events.
- Preserved the existing project architecture and visual design throughout the integration.

---

# Backend

The server-side logic was implemented to retrieve and process the authenticated user's events.

## Implemented Endpoint

### GET /events

Developed the endpoint responsible for returning all events belonging to the authenticated user.

The implementation includes:

- Retrieving the authenticated user's information from the JWT stored in `request.state.user`.
- Filtering events by the authenticated user's `user_id`.
- Executing an optimized `LEFT JOIN` with the `event_items` table to retrieve event statistics in a single query.
- Sorting events by `event_date` in ascending order, ensuring that upcoming events appear first.

---

# Data Processing

Additional calculations were incorporated into the event listing response.

These include:

- Total number of event items.
- Number of confirmed items.
- Estimated total cost calculated as:

  `quantity × unit_price`

- Progress percentage calculated as:

  `(confirmed_items / total_items) × 100`

- Progress values rounded to two decimal places.

---

# Data Models

A new response schema was implemented to provide enriched event information.

## Implemented Schema

### EventWithStatsResponse

This schema extends the existing `EventResponse` model by including:

- `progress` (float)
- `estimated_total` (Decimal)

This allows the frontend to receive both the event information and its calculated statistics within a single API response.

---

# API Integration

The communication between the Frontend and Backend was completed by updating the application's API service layer.

This implementation includes:

- Integration of the new **GET /events** service.
- Proper consumption of the Backend endpoint.
- Centralized API communication following the project's architecture.

---

# Final Outcome

As a result of this user story, authenticated users can now access the **My Events** module and view a complete list of their events.

The implemented solution allows users to:

- Access the **My Events** page from the application's navigation menu.
- View only the events associated with their account.
- See events ordered chronologically by their scheduled date.
- Monitor each event's completion progress.
- View the estimated total cost calculated from the associated event items.

The functionality was successfully integrated across Frontend and Backend, delivering a scalable, secure, and user-friendly event management experience, ready for Code Review and QA testing.

-----------------------------------------------------------------------

# Resumen de Desarrollo – Ver Lista de Mis Eventos

## Descripción General

Durante el desarrollo de esta historia de usuario se implementó el módulo **Mis Eventos**, permitiendo que los usuarios autenticados puedan visualizar todos los eventos que han creado. La implementación integró funcionalidades de Frontend y Backend para ofrecer una vista centralizada de los eventos del usuario, incluyendo estadísticas calculadas como el porcentaje de progreso y el costo total estimado. La solución se desarrolló siguiendo la arquitectura del proyecto, garantizando un acceso seguro a la información y una experiencia de usuario intuitiva.

---

# Frontend

Se amplió la interfaz de usuario para integrar el módulo **Mis Eventos** dentro de la aplicación.

## Funcionalidades implementadas

- Creación de la página **Mis Eventos** para visualizar los eventos del usuario autenticado.
- Integración de la nueva vista dentro del menú de navegación de la aplicación.
- Actualización del Sidebar para incluir acceso directo a la sección **Mis Eventos**.
- Configuración de las rutas necesarias para soportar la nueva pantalla.
- Integración del Frontend con la API del Backend para consultar los eventos del usuario autenticado.
- Conservación de la arquitectura y la línea de diseño establecidas por el proyecto durante toda la integración.

---

# Backend

Se implementó la lógica del servidor para consultar y procesar los eventos pertenecientes al usuario autenticado.

## Endpoint implementado

### GET /events

Se desarrolló el endpoint encargado de retornar todos los eventos asociados al usuario autenticado.

La implementación incluye:

- Obtención de la información del usuario autenticado desde el JWT almacenado en `request.state.user`.
- Filtrado de los eventos utilizando el `user_id` del usuario autenticado.
- Ejecución de un `LEFT JOIN` optimizado con la tabla `event_items` para obtener las estadísticas de cada evento en una única consulta.
- Ordenamiento de los eventos por la fecha del evento (`event_date`) de forma ascendente, mostrando primero los eventos más próximos.

---

# Procesamiento de Datos

Se incorporaron cálculos adicionales para enriquecer la información devuelta por el endpoint.

Estos incluyen:

- Cantidad total de recursos asociados al evento.
- Cantidad de recursos confirmados.
- Costo total estimado calculado mediante:

  `quantity × unit_price`

- Porcentaje de progreso calculado como:

  `(confirmed_items / total_items) × 100`

- Redondeo del porcentaje de progreso a dos decimales.

---

# Modelos de Datos

Se implementó un nuevo esquema de respuesta para proporcionar información enriquecida sobre cada evento.

## Esquema implementado

### EventWithStatsResponse

Este esquema extiende el modelo `EventResponse` agregando los siguientes campos:

- `progress` (float)
- `estimated_total` (Decimal)

Esto permite que el Frontend reciba tanto la información del evento como sus estadísticas calculadas en una única respuesta del API.

---

# Integración de la API

Se completó la comunicación entre Frontend y Backend mediante la actualización de la capa de servicios de la aplicación.

La implementación incluye:

- Integración del nuevo servicio **GET /events**.
- Consumo adecuado del endpoint desde el Frontend.
- Centralización de la comunicación con la API siguiendo la arquitectura del proyecto.

---

# Resultado Final

Como resultado de esta historia de usuario, los usuarios autenticados ahora pueden acceder al módulo **Mis Eventos** y visualizar la lista completa de los eventos que han creado.

La solución implementada permite que el usuario pueda:

- Acceder al módulo **Mis Eventos** desde el menú de navegación.
- Visualizar únicamente los eventos asociados a su cuenta.
- Consultar los eventos ordenados cronológicamente por su fecha programada.
- Monitorear el porcentaje de progreso de cada evento.
- Visualizar el costo total estimado calculado a partir de los recursos asociados.

La funcionalidad quedó completamente integrada entre Frontend y Backend, ofreciendo una experiencia segura, escalable y fácil de utilizar, lista para el proceso de Code Review y pruebas de QA.