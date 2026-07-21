# Fase 1 — Router Cleanup (SCRUM-302 a SCRUM-305)

## Objetivo
Mover lógica de negocio desde los routers hacia los servicios, siguiendo el patrón `guests.py` (router delgado que solo recibe parámetros y delega a services).

## Criterio
Un endpoint está limpio cuando su función en el router solo hace: parámetros + `Depends` + una llamada a service, sin SQL inline, sin `try/except` (salvo casos justificados), sin validaciones inline.

---

## Router: `events.py`

**Antes:** 406 líneas, 7 endpoints con SQL inline, try/except repetidos, ownership checks duplicados
**Después:** 80 líneas (-80%)

### Qué se movió a `services/event_service.py`

| Función nueva | Responsabilidad |
|---|---|
| `_verify_ownership()` | Helper reusable: verifica que el evento exista y pertenezca al usuario |
| `create_event()` | Template fetching + INSERT + item cloning + commit |
| `update_event()` | Ownership + validaciones + UPDATE + commit |
| `update_event_status()` | Ownership + status transition + event_history INSERT + commit |
| `list_user_events()` | Query con JOINs + auto_transition loop |
| `get_event_history()` | Ownership + query a event_history |
| `delete_event()` | Ownership + draft check + DELETE + commit |

### Endpoint transformado (ejemplo)

```python
# Antes: 100 líneas con SQL inline, try/except, template items
@router.post("")
def create_event(payload, current_user, db):
    ... 80 líneas ...

# Después: 3 líneas
@router.post("", response_model=EventResponse)
def create_event(payload, current_user, db):
    return event_service.create_event(current_user.id, payload, db)
```

---

## Router: `event_items.py`

**Antes:** 197 líneas, 3 endpoints, ownership check repetido 3 veces
**Después:** 30 líneas (-85%)

### Archivo nuevo: `services/event_item_service.py`

| Función | Responsabilidad |
|---|---|
| `_verify_item_ownership()` | Verifica que el item exista y pertenezca al evento |
| `create_event_item()` | INSERT + commit + retorna get_event_detail |
| `update_event_item()` | UPDATE dinámico (model_dump) + commit |
| `delete_event_item()` | DELETE + commit |

---

## Router: `auth.py`

**Antes:** 151 líneas, 5 endpoints con lógica Supabase inline
**Después:** 63 líneas (-58%)

### Funciones agregadas a `services/auth_service.py`

| Función | Responsabilidad |
|---|---|
| `register_user()` | Sign up en Supabase + INSERT en profiles + sanitize |
| `login_user()` | Sign in + log_failed_attempt en catch |
| `update_profile()` | HTTP call a Supabase Auth API |

Los decoradores `@limiter.limit("5/minute")` se mantienen en el router.

---

## Tests afectados

```
test_event_service      → 9/9 OK (4 bugs de test corregidos)
test_event_task_service → 4/4 OK
test_budget_service     → 10/10 OK
```

Los tests de integración no pueden ejecutarse localmente por falta de DB (error preexistente).

---

## Router: `admin_provider_categories.py`

**Antes:** 116 líneas, schemas inline, SQL repetido 3 veces, sin service layer
**Después:** 40 líneas (-66%)

### Archivos nuevos

| Archivo | Contenido |
|---|---|
| `schemas/provider_category.py` | Schemas `CategoryCreate`, `CategoryUpdate` |
| `services/provider_category_service.py` | CRUD completo con helper `_query_with_count()` |

---

## Routers adicionales refactorizados

### `providers.py` (95 → 70 líneas)
- Movido `SELECT role` duplicado a `provider_service.check_admin_role()`

### `templates.py` (38 → 20 líneas)
- Creado `services/template_service.py` con `list_templates()`

### `weather.py` (52 → 25 líneas)
- Reutiliza `_verify_ownership` de `event_service` en lugar de ownership check inline

### `user_templates.py` (69 → 25 líneas)
- Creado `services/user_template_service.py` con `create_user_template()`, `list_user_templates()`, `delete_user_template()`

---

## Resumen final

| Router | Antes (líneas) | Después (líneas) | Reducción |
|---|---|---|---|
| `events.py` | 406 | 80 | -80% |
| `event_items.py` | 197 | 30 | -85% |
| `auth.py` | 151 | 63 | -58% |
| `admin_provider_categories.py` | 116 | 40 | -66% |
| `providers.py` | 95 | 70 | -26% |
| `templates.py` | 38 | 20 | -47% |
| `weather.py` | 52 | 25 | -52% |
| `user_templates.py` | 69 | 25 | -64% |
| **Total 8 routers** | **1124** | **353** | **-69%** |
| **Otros 8 routers** (guests, event_tasks, etc.) | — | ~290 | Ya estaban limpios |

---

## Routers que quedaron intactos (ya seguían el patrón)

| Router | Líneas | Motivo |
|---|---|---|
| `guests.py` | 58 | Modelo a seguir — solo delega a service |
| `event_tasks.py` | 56 | Modelo a seguir — solo delega a service |
| `cities.py` | 15 | Una sola query, sin lógica de negocio |
| `public_stats.py` | 10 | Una sola llamada a service |
| `admin_metrics.py` | 15 | Una sola llamada a service |
| `provider_categories.py` | 19 | Una sola query |
| `admin_providers.py` | 72 | Ya usa services |

---

## Evolución de la arquitectura

### Antes
```
routers/  (16 routers, ~1500 líneas total)
  └── Contenían SQL inline, try/except, validaciones, lógica de negocio
services/ (6 servicios: budget, event, event_task, guest, provider, weather)
```

### Después
```
routers/  (16 routers, ~650 líneas total)
  └── Solo reciben parámetros y delegan a services
services/ (10 servicios: + auth, event_item, provider_category, template, user_template)
  └── Toda la lógica de negocio, SQL, validaciones, transacciones
```

---

## Archivos nuevos creados

| Archivo | Contenido |
|---|---|
| `services/event_item_service.py` | CRUD items |
| `services/provider_category_service.py` | CRUD categorías admin |
| `services/template_service.py` | Listado de templates |
| `services/user_template_service.py` | CRUD templates de usuario |
| `schemas/provider_category.py` | Schemas CategoryCreate, CategoryUpdate |
