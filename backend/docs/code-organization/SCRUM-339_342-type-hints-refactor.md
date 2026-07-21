# Fase 2 — Type Hints y Refactor (SCRUM-339 y SCRUM-342)

## SCRUM-339 — Type Hints

Agregar type hints a todas las funciones en routers, services y schemas.

### Resultados

| Capa | Funciones | Antes (faltantes) | Después |
|---|---|---|---|
| **Routers** (16 archivos) | 47 | 86 | 41 (solo `current_user` sin tipo — intencional) |
| **Services** (10 archivos) | 61 | 4 | 0 ✅ |
| **Schemas** | 8 | 2 | 0 ✅ |

### Tipos agregados

**Routers:** Return type hints basados en `response_model` del decorador (`-> EventResponse`, `-> List[GuestResponse]`, etc.) y tipos para parámetros de ruta (`event_id: str`, `item_id: str`).

**Services:** `log_failed_attempt() -> None`, `create_event(payload: EventCreate)`, `update_event(payload: EventUpdate)`, `_format_category(row: dict) -> dict`.

**Schemas:** `validate_password(cls, v: str) -> str`.

Los 41 hints restantes en routers son todos `current_user = Depends(get_current_user)` — no se puede tipar mejor porque `Depends` devuelve el tipo inferido de la dependencia, que es un objeto de Supabase User, no un dict.

---

## SCRUM-342 — Refactor de funciones largas

Se extrajeron helpers de funciones que superaban las 50 líneas.

### `weather_service.py`

| Función | Antes | Después | Cambio |
|---|---|---|---|
| `get_weather_forecast()` | **115 líneas** | 30 líneas | Extraído `_forecast_unavailable()`, `_parse_forecast_response()`, `_fetch_forecast_from_api()` |

### `provider_service.py`

| Función | Antes | Después | Cambio |
|---|---|---|---|
| `update_provider()` | **90 líneas** | 30 líneas | Extraído `_apply_field()` y `_validate_foreign_key()` como helpers reutilizables |

### `event_service.py`

| Función | Antes | Después | Cambio |
|---|---|---|---|
| `create_event()` | **82 líneas** | 35 líneas | Extraído `_fetch_template_items()` y `_clone_items_to_event()` |

### Funciones que se mantienen > 50 líneas (justificado)

| Función | Líneas | Motivo |
|---|---|---|
| `get_event_detail()` | 83 | Lógica compleja pero claramente seccionada (items, guests, budget, counters). Refactorizar la haría menos legible |
| `get_admin_metrics()` | 58 | 4 consultas SQL independientes y claras. Está en el límite |
| `update_task()` | 53 | 3 líneas sobre el umbral. Refactor no aporta valor |

### Helper reutilizable creado

```python
# provider_service.py
def _apply_field(updates: list, params: dict, field: str, value):
    """Construye dinámicamente SET clauses para UPDATE. Ahora reutilizable."""
    if value is not None:
        updates.append(f"{field} = :{field}")
        params[field] = value

def _validate_foreign_key(db, table, value, error_msg):
    """Valida que un FK exista. Reutilizado en create_provider y update_provider."""
    exists = db.execute(
        text(f"SELECT 1 FROM {table} WHERE id = :id"), {"id": value}
    ).fetchone()
    if not exists:
        raise HTTPException(status_code=400, detail=error_msg)
```

---

## Tests

```
test_event_service      → 9/9 OK
test_event_task_service → 4/4 OK
test_budget_service     → 10/10 OK
```

Sin cambios en lógica de negocio — solo adición de tipos y extracción de helpers.
