# Fase 3 — Tests Unitarios (SCRUM-340/341)

## Objetivo
Agregar tests unitarios para funciones puras (sin dependencia de base de datos) creadas durante el refactor de código.

## Criterio
Los tests siguen el patrón de `test_event_task_service.py`: `unittest.TestCase`, import directo de la función, sin mocks ni DB.

---

## Tests creados

### `test_weather_helpers.py` (5 tests)

| # | Test | Función | Input | Esperado |
|---|---|---|---|---|
| 1 | `test_forecast_unavailable_returns_message` | `_forecast_unavailable()` | `"Custom message"` | `result["message"] == "Custom message"` |
| 2 | `test_forecast_unavailable_all_none` | `_forecast_unavailable()` | `"any"` | `temp=None, condition=None, description=None, icon=None` |
| 3 | `test_parse_forecast_full` | `_parse_forecast_response()` | `{main: {temp: 25.5}, weather: [{main: "Clear", ...}]}` | `temp=25.5, condition="Clear", description="cielo claro", icon="01d"` |
| 4 | `test_parse_forecast_no_weather_array` | `_parse_forecast_response()` | `{main: {temp: 30.0}, weather: []}` | `temp=30.0, condition=None, description=None, icon=None` |
| 5 | `test_parse_forecast_empty` | `_parse_forecast_response()` | `{}` | `temp=None, condition=None` (caso borde) |

### `test_provider_helpers.py` (3 tests)

| # | Test | Función | Input | Esperado |
|---|---|---|---|---|
| 1 | `test_apply_field_with_value` | `_apply_field()` | `([], {}, "name", "Test")` | `updates=["name = :name"], params["name"]="Test"` |
| 2 | `test_apply_field_none_value` | `_apply_field()` | `([], {}, "phone", None)` | `updates=[], params={}` |
| 3 | `test_apply_field_appends_to_existing` | `_apply_field()` | `(["cat = :cat"], {cat: "x"}, "name", "Y")` | 2 updates, ambos params preservados |

---

## Suite completa

```
test_weather_helpers      → 5/5 OK
test_provider_helpers     → 3/3 OK
test_event_service        → 9/9 OK
test_event_task_service   → 4/4 OK
test_budget_service       → 10/10 OK
test_weather_service      → 1/1 (DB required - preexisting)
                        ─────────
Total: 32 tests OK        (8 nuevos, 24 existentes)
```

---

## Ejecución

```bash
cd backend
python -m unittest discover -s tests -p "test_*.py"
```

Los 6 archivos de test que no requieren DB se ejecutan en 0.003s.

---

## Archivos

| Archivo | Tests |
|---|---|
| `tests/test_weather_helpers.py` | 5 |
| `tests/test_provider_helpers.py` | 3 |
