------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# Development Summary – View Event Details

## Overview

During the development of this user story, the **Event Details** module was implemented, allowing authenticated users to view all the information related to a specific event. The solution integrated Frontend and Backend functionalities to display the event's general information, associated resources, estimated budget, budget alerts, and resource confirmation progress. The entire implementation followed the project's architecture, ensuring secure access to information and a user experience aligned with the established design.

---

# Frontend

A complete user interface was developed to display the details of an event and dynamically present all the information retrieved from the Backend.

## Implemented Features

- Integrated the event creation form with the Backend to automatically redirect users to the event details page after successfully creating an event.
- Implemented a **4-step visual stepper** following the design defined in Figma.
- Developed the budget panel displaying:
  - Estimated budget.
  - Resource breakdown.
  - Subtotals for each resource.
- Implemented a visual budget alert banner when the estimated budget exceeds the event's maximum budget.
- Developed a dynamic confirmed resources counter displayed in the format **"X of Y confirmed"**.
- Fully integrated the **GET /events/{id}** endpoint to retrieve and dynamically render the event information.

---

# Backend

The server-side logic was implemented to retrieve the complete details of an event belonging to the authenticated user.

## Implemented Endpoint

### GET /events/{id}

Developed the endpoint responsible for returning all the information of a specific event along with all its associated resources.

The implementation includes:

- Retrieving the authenticated user through `SupabaseAuthMiddleware`.
- Validating that the requested event belongs to the authenticated user.
- Returning a **404** error when the event does not exist or does not belong to the requesting user.
- Retrieving the event together with all its `event_items`.

---

# Data Processing

Additional calculations were implemented to enrich the information returned by the endpoint.

These include:

- Calculating the estimated total budget using:

  `quantity × unit_price`

- Using high-precision (`Decimal`) values for monetary calculations.
- Generating a budget alert whenever the estimated cost exceeds the event's maximum budget.
- Dynamically calculating the number of confirmed resources relative to the total associated resources.

---

# Data Models

New models and response schemas were implemented to support the complete event details response.

## Implemented Components

- Models:
  - `Event`
  - `EventItem`

- Response Schemas:
  - `EventDetailResponse`
  - `EventDetailOut`

These models allow the API to return all event information, associated resources, and calculated statistics within a single response.

---

# API Integration

The communication between the Frontend and Backend was completed for the event details workflow.

The implementation includes:

- Integration of the **GET /events/{id}** endpoint.
- Consuming the endpoint from the Frontend using the authenticated user's access token.
- Dynamically rendering the information retrieved from the API.
- Automatically redirecting users to the event details page after successfully creating an event.

---

# Validations

Several validations were implemented to ensure data integrity and secure access.

These include:

- Verifying event ownership before allowing access.
- JWT-based authentication.
- Validation of non-existent events or events belonging to another user.
- Budget evaluation against the maximum configured budget without preventing the event from being displayed.

---

# Final Outcome

As a result of this user story, the complete **Event Details** module was successfully delivered by integrating both Frontend and Backend to provide a detailed and dynamic view of each event.

The implemented solution allows users to:

- View the complete information of a specific event.
- Display all resources associated with the event.
- Review the estimated budget and detailed cost breakdown.
- Receive alerts whenever the estimated budget exceeds the configured limit.
- Monitor the confirmation progress of event resources.
- Visualize the workflow status through a four-step stepper.
- Access only the events they own through authentication and authorization validations.

The functionality was fully integrated between the Frontend and Backend, delivering a secure, scalable solution aligned with the project's architecture, ready for **Code Review** and **QA testing**.

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# Resumen de Desarrollo – Ver Detalle de un Evento

## Descripción General

Durante el desarrollo de esta historia de usuario se implementó el módulo **Detalle de Evento**, permitiendo que los usuarios autenticados puedan consultar toda la información relacionada con un evento específico. La solución integró funcionalidades de Frontend y Backend para mostrar los datos generales del evento, los recursos asociados, el presupuesto estimado, las alertas de presupuesto y el progreso de confirmación de los recursos. Todo el desarrollo se realizó siguiendo la arquitectura del proyecto, garantizando la seguridad en el acceso a la información y una experiencia de usuario alineada con el diseño establecido.

---

# Frontend

Se desarrolló la interfaz completa para visualizar el detalle de un evento y presentar de forma dinámica toda la información obtenida desde el Backend.

## Funcionalidades implementadas

- Integración del formulario de creación de eventos con el Backend para redirigir automáticamente al detalle del evento después de su creación.
- Implementación del **Stepper** visual de cuatro pasos siguiendo el diseño definido en Figma.
- Desarrollo del panel de presupuesto mostrando:
  - Presupuesto estimado.
  - Desglose de recursos.
  - Subtotales por cada recurso.
- Implementación de un banner de alerta cuando el presupuesto estimado supera el presupuesto máximo configurado para el evento.
- Desarrollo de un contador dinámico de recursos confirmados en formato **"X of Y confirmed"**.
- Integración completa con el endpoint **GET /events/{id}** para consumir la información del evento y actualizar la vista dinámicamente.

---

# Backend

Se implementó la lógica necesaria para consultar el detalle completo de un evento perteneciente al usuario autenticado.

## Endpoint implementado

### GET /events/{id}

Se desarrolló el endpoint encargado de retornar toda la información de un evento específico junto con todos sus recursos asociados.

La implementación incluye:

- Obtención del usuario autenticado mediante `SupabaseAuthMiddleware`.
- Validación de que el evento pertenezca al usuario autenticado.
- Retorno de un error **404** cuando el evento no existe o no pertenece al usuario solicitante.
- Consulta del evento junto con todos sus `event_items`.

---

# Procesamiento de Datos

Se incorporaron cálculos adicionales para enriquecer la información retornada por el endpoint.

Estos incluyen:

- Cálculo del presupuesto total estimado mediante la suma de:

  `quantity × unit_price`

- Uso de valores de alta precisión (`Decimal`) para los cálculos monetarios.
- Generación de una alerta de presupuesto cuando el costo estimado supera el presupuesto máximo definido para el evento.
- Cálculo dinámico del número de recursos confirmados respecto al total de recursos asociados.

---

# Modelos de Datos

Se implementaron nuevos modelos y esquemas para soportar el detalle completo del evento.

## Componentes implementados

- Modelos:
  - `Event`
  - `EventItem`

- Esquemas de respuesta:
  - `EventDetailResponse`
  - `EventDetailOut`

Estos modelos permiten retornar toda la información del evento, sus recursos y las estadísticas calculadas en una única respuesta del API.

---

# Integración de la API

Se completó la comunicación entre Frontend y Backend para el flujo de detalle del evento.

La implementación incluye:

- Integración del endpoint **GET /events/{id}**.
- Consumo del endpoint desde el Frontend utilizando el token de autenticación.
- Renderizado dinámico de la información obtenida desde la API.
- Redirección automática hacia la vista de detalle una vez el evento es creado exitosamente.

---

# Validaciones

Durante el desarrollo se implementaron diversas validaciones para garantizar la integridad y seguridad de la información.

Estas incluyen:

- Verificación de propiedad del evento antes de permitir su consulta.
- Control de acceso mediante autenticación JWT.
- Validación de eventos inexistentes o pertenecientes a otros usuarios.
- Evaluación del presupuesto estimado respecto al presupuesto máximo sin bloquear la operación.

---

# Resultado Final

Como resultado de esta historia de usuario se entregó el módulo completo de **Detalle de Evento**, integrando Frontend y Backend para ofrecer una visualización detallada y dinámica de la información de cada evento.

La solución permite que el usuario pueda:

- Consultar toda la información de un evento específico.
- Visualizar los recursos asociados al evento.
- Conocer el presupuesto estimado y el desglose de costos.
- Recibir alertas cuando el presupuesto supera el límite establecido.
- Monitorear el progreso de confirmación de los recursos.
- Visualizar el estado del flujo mediante un stepper de cuatro etapas.
- Acceder únicamente a los eventos que le pertenecen mediante validaciones de autenticación y autorización.

La funcionalidad quedó completamente integrada entre Frontend y Backend, ofreciendo una solución segura, escalable y alineada con la arquitectura del proyecto, lista para el proceso de **Code Review** y pruebas de **QA**.
