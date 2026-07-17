# Guía General de Pruebas de Prismavent (Road Map & Index)

Este archivo sirve como el punto de acceso general y mapa de ruta para todo el conjunto de pruebas del backend de **Prismavent**. Si buscas detalles técnicos específicos, implementaciones de código, o resultados detallados de ejecución, dirígete al documento específico [TESTING_DOC.md](file:///C:/Users/LENOVO/Documents/DANI%20DOCS/RIWI/PROYECTO%20INTEGRADOR/prismavent/backend/docs/TESTING_DOC.md).

---

## Índice de Rutas a TESTING_DOC.md
A continuación se presentan los accesos rápidos a las distintas secciones detalladas de las pruebas en [TESTING_DOC.md](file:///C:/Users/LENOVO/Documents/DANI%20DOCS/RIWI/PROYECTO%20INTEGRADOR/prismavent/backend/docs/TESTING_DOC.md):

* **[Estrategia General de Pruebas](file:///C:/Users/LENOVO/Documents/DANI%20DOCS/RIWI/PROYECTO%20INTEGRADOR/prismavent/backend/docs/TESTING_DOC.md#1-estrategia-de-pruebas)**: Resumen y arquitectura de pruebas unitarias e integración.
  * **[Pruebas Unitarias](file:///C:/Users/LENOVO/Documents/DANI%20DOCS/RIWI/PROYECTO%20INTEGRADOR/prismavent/backend/docs/TESTING_DOC.md#11-pruebas-unitarias-aislamiento-completo)**: Lógica de negocio en aislamiento.
  * **[Pruebas de Integración](file:///C:/Users/LENOVO/Documents/DANI%20DOCS/RIWI/PROYECTO%20INTEGRADOR/prismavent/backend/docs/TESTING_DOC.md#12-pruebas-de-integracion-end-to-end-controlado)**: Pruebas con base de datos e inyección de token Supabase.
* **[Configuración y Limpieza (Setup / Teardown)](file:///C:/Users/LENOVO/Documents/DANI%20DOCS/RIWI/PROYECTO%20INTEGRADOR/prismavent/backend/docs/TESTING_DOC.md#2-configuracion-y-limpieza-de-datos-setup--teardown)**: Ciclo de vida relacional e inserción inicial de pruebas.
* **[Matriz Completa de Casos de Prueba (TC-01 a TC-26)](file:///C:/Users/LENOVO/Documents/DANI%20DOCS/RIWI/PROYECTO%20INTEGRADOR/prismavent/backend/docs/TESTING_DOC.md#3-matriz-de-casos-de-prueba)**: Tabla detallada con los casos de prueba ejecutados y sus resultados esperados.
* **[Código Fuente de Scripts de Pruebas](file:///C:/Users/LENOVO/Documents/DANI%20DOCS/RIWI/PROYECTO%20INTEGRADOR/prismavent/backend/docs/TESTING_DOC.md#4-codigo-de-los-scripts-de-pruebas)**:
  * **[4.1 Unitarias de Presupuestos](file:///C:/Users/LENOVO/Documents/DANI%20DOCS/RIWI/PROYECTO%20INTEGRADOR/prismavent/backend/docs/TESTING_DOC.md#41-pruebas-unitarias-de-presupuesto-tests_test_budget_servicepy)**
  * **[4.2 Unitarias de Validación de Eventos](file:///C:/Users/LENOVO/Documents/DANI%20DOCS/RIWI/PROYECTO%20INTEGRADOR/prismavent/backend/docs/TESTING_DOC.md#42-pruebas-unitarias-de-validacion-tests_test_event_servicepy)**
  * **[4.3 Integración de Eventos](file:///C:/Users/LENOVO/Documents/DANI%20DOCS/RIWI/PROYECTO%20INTEGRADOR/prismavent/backend/docs/TESTING_DOC.md#43-pruebas-de-integracion-tests_test_integration_eventspy)**
  * **[4.4 Integración de Proveedores](file:///C:/Users/LENOVO/Documents/DANI%20DOCS/RIWI/PROYECTO%20INTEGRADOR/prismavent/backend/docs/TESTING_DOC.md#44-pruebas-de-integracion-de-proveedores-tests_test_integration_providerspy)**
* **[Registros de Ejecución (Logs de unittest)](file:///C:/Users/LENOVO/Documents/DANI%20DOCS/RIWI/PROYECTO%20INTEGRADOR/prismavent/backend/docs/TESTING_DOC.md#5-registros-de-ejecucion-de-pruebas-logs)**: Consola de ejecución mostrando las 71 pruebas exitosas.
* **[Guía para el Desarrollador](file:///C:/Users/LENOVO/Documents/DANI%20DOCS/RIWI/PROYECTO%20INTEGRADOR/prismavent/backend/docs/TESTING_DOC.md#6-guia-para-desarrolladores-como-escribir-pruebas-unitarias)**: Nomenclatura, buenas prácticas y comandos de ejecución.

---

# Documentación de Pruebas: PATCH /events, CRUD Guests y Validaciones

Este documento contiene la especificación, diseño y resultados del plan de pruebas ejecutado para asegurar el correcto funcionamiento del endpoint de actualización de eventos, el módulo de invitados y sus reglas de negocio. Actúa como extensión a la documentación principal en [TESTING_DOC.md](file:///C:/Users/LENOVO/Documents/DANI%20DOCS/RIWI/PROYECTO%20INTEGRADOR/prismavent/backend/docs/TESTING_DOC.md).

---

## 1. Estrategia de Pruebas

Para validar el endpoint de actualización y la gestión de invitados sin comprometer la limpieza de las pruebas, complementamos la estrategia general descrita en la **Sección 1** de [TESTING_DOC.md](file:///C:/Users/LENOVO/Documents/DANI%20DOCS/RIWI/PROYECTO%20INTEGRADOR/prismavent/backend/docs/TESTING_DOC.md):

* **Aislamiento en Unitarias:** Evaluamos en aislamiento completo (`tests/test_event_service.py`) las validaciones de inmutabilidad en eventos finalizados y bloqueo de fechas en el pasado.
* **Mocking Dinámico en Integración:** En lugar de parches globales persistentes, utilizamos `unittest.mock.patch` dentro del ciclo `setUp` y `tearDown` de cada clase de prueba. Esto garantiza que la simulación de la sesión de Supabase Auth se restaure después de cada prueba individual, previniendo sangrado de estado entre suites.

---

## 2. Configuración y Limpieza de Datos (Setup / Teardown)

De manera homóloga a la **Sección 2** de [TESTING_DOC.md](file:///C:/Users/LENOVO/Documents/DANI%20DOCS/RIWI/PROYECTO%20INTEGRADOR/prismavent/backend/docs/TESTING_DOC.md), se insertan eventos y registros específicos en el setup relacional:
* Al eliminar un evento de prueba en la etapa de desmontaje (`tearDownClass`), la clave foránea con propiedad `ON DELETE CASCADE` elimina automáticamente todos los invitados (`guests`) asociados en cascada en la base de datos de desarrollo.

---

## 3. Matriz de Casos de Prueba (Adicionales)

| ID | Nombre del Caso | Entrada | Comportamiento Esperado | Tipo de Test | Resultado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-07** | Edición parcial exitosa (PATCH) | PATCH `/events/{id}` con nuevo `name` y `max_budget` | HTTP 200, datos cambiados, `updated_at` actualizado, otros campos intactos | Integración | **PASSED** |
| **TC-08** | Fecha en el pasado (PATCH) | PATCH `/events/{id}` con `event_date` anterior a hoy | HTTP 400 Bad Request, fecha rechazada | Integración | **PASSED** |
| **TC-09** | Modificar evento finalizado | PATCH `/events/{id}` en evento con `status = "finalizado"` | HTTP 400 Bad Request, inmutable | Integración | **PASSED** |
| **TC-10** | Ignorar campos no editables | PATCH `/events/{id}` enviando `status` o `template_id` | HTTP 200, campos ignorados silenciosamente en base de datos | Integración | **PASSED** |
| **TC-11** | Control de propiedad PATCH (403) | Usuario B intenta modificar el evento de Usuario A | HTTP 403 Forbidden | Integración | **PASSED** |
| **TC-12** | Validaciones unitarias del servicio | Validaciones de fecha y estado en aislamiento | Comportamiento correcto de excepciones HTTPException (400) | Unitario | **PASSED** |
| **TC-13** | CRUD de invitados y contadores | Flujo completo de agregar, listar, editar y eliminar invitados | HTTP 200, contadores `registered`, `confirmed` y `unconfirmed` cambian en vivo | Integración | **PASSED** |
| **TC-14** | CRUD en evento finalizado | Intentar operar sobre invitados cuando el evento está `"finalizado"` | HTTP 400 Bad Request, inmutabilidad de invitados | Integración | **PASSED** |
| **TC-15** | Propiedad de invitados (403) | Usuario B intenta leer o crear invitados en evento del Usuario A | HTTP 403 Forbidden (Bloqueo de acceso) | Integración | **PASSED** |
| **TC-16** | Sincronización automática cupo | Registrar invitados superando el cupo `guest_count` original | El backend actualiza `guest_count` del evento dinámicamente | Integración | **PASSED** |
| **TC-17** | Compatibilidad PATCH con cupo | PATCH `/events/{id}` editando `guest_count` manually | HTTP 200, permite editar libremente el cupo previsto | Integración | **PASSED** |

---

## 4. Código de los Scripts de Pruebas

Los nuevos scripts se ubican bajo el directorio `/tests`:
* **Validación pura:** [tests/test_event_service.py](file:///C:/Users/LENOVO/Documents/DANI%20DOCS/RIWI/PROYECTO%20INTEGRADOR/prismavent/backend/tests/test_event_service.py) (Pruebas unitarias para `event_service.py`).
* **Integración de Invitados:** [tests/test_integration_guests.py](file:///C:/Users/LENOVO/Documents/DANI%20DOCS/RIWI/PROYECTO%20INTEGRADOR/prismavent/backend/tests/test_integration_guests.py) (Pruebas integradas de API de invitados con SQLAlchemy y Supabase).

---

## 5. Registro de Ejecución de Pruebas (Logs de Consola)

El runner unificado de unittest descubre y ejecuta con éxito las 71 pruebas totales en el proyecto:

```text
.\venv\Scripts\python -m unittest discover -s tests
C:\Users\LENOVO\Documents\DANI DOCS\RIWI\PROYECTO INTEGRADOR\prismavent\backend\venv\Lib\site-packages\fastapi\testclient.py:1: StarletteDeprecationWarning: Using `httpx` with `starlette.testclient` is deprecated; install `httpx2` instead.
  from starlette.testclient import TestClient as TestClient  # noqa
.......................................................................
----------------------------------------------------------------------
Ran 71 tests in 63.984s

OK
```
