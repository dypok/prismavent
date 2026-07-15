# Documentación de Pruebas: PATCH /events, CRUD Guests y Validaciones

Este documento contiene la especificación, diseño y resultados del plan de pruebas ejecutado para asegurar el correcto funcionamiento del endpoint de actualización de eventos, el módulo de invitados y sus reglas de negocio. Actúa como extensión a la documentación principal en [TESTING_DOC.md](./TESTING_DOC.md).

---

## 1. Estrategia de Pruebas

Para validar el endpoint de actualización y la gestión de invitados sin comprometer la limpieza de las pruebas, complementamos la estrategia general descrita en la **Sección 1** de [TESTING_DOC.md](./TESTING_DOC.md):

* **Aislamiento en Unitarias:** Evaluamos en aislamiento completo (`tests/test_event_service.py`) las validaciones de inmutabilidad en eventos finalizados y bloqueo de fechas en el pasado.
* **Mocking Dinámico en Integración:** En lugar de parches globales persistentes, utilizamos `unittest.mock.patch` dentro del ciclo `setUp` y `tearDown` de cada clase de prueba. Esto garantiza que la simulación de la sesión de Supabase Auth se restaure después de cada prueba individual, previniendo sangrado de estado entre suites.

---

## 2. Configuración y Limpieza de Datos (Setup / Teardown)

De manera homóloga a la **Sección 2** de [TESTING_DOC.md](./TESTING_DOC.md), se insertan eventos y registros específicos en el setup relacional:
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
| **TC-17** | Compatibilidad PATCH con cupo | PATCH `/events/{id}` editando `guest_count` manualmente | HTTP 200, permite editar libremente el cupo previsto | Integración | **PASSED** |

---

## 4. Código de los Scripts de Pruebas

Los nuevos scripts se ubican bajo el directorio `/tests`:
* **Validación pura:** [tests/test_event_service.py](../tests/test_event_service.py) (Pruebas unitarias para `event_service.py`).
* **Integración de Invitados:** [tests/test_integration_guests.py](../tests/test_integration_guests.py) (Pruebas integradas de API de invitados con SQLAlchemy y Supabase).

---

## 5. Registro de Ejecución de Pruebas (Logs de Consola)

El runner unificado de unittest descubre y ejecuta con éxito las 30 pruebas totales en el proyecto:

```text
.\venv\Scripts\python -m unittest discover -s tests
C:\Users\LENOVO\Documents\DANI DOCS\RIWI\PROYECTO INTEGRADOR\prismavent\backend\venv\Lib\site-packages\fastapi\testclient.py:1: StarletteDeprecationWarning: Using `httpx` with `starlette.testclient` is deprecated; install `httpx2` instead.
  from starlette.testclient import TestClient as TestClient  # noqa
..............................
----------------------------------------------------------------------
Ran 30 tests in 26.202s

OK
```
