from decimal import Decimal
from typing import List, Any

def calculate_total_estimated(event_items: List[Any]) -> Decimal:
    """
    Calculates the total estimated cost of all items in an event.
    total = SUM(quantity * unit_price)
    """
    total = Decimal("0.0")
    for item in event_items:
        # Gracefully handle dict objects or object-like attributes
        if isinstance(item, dict):
            quantity = Decimal(str(item.get("quantity", 0)))
            unit_price = Decimal(str(item.get("unit_price", 0)))
        else:
            quantity = Decimal(str(getattr(item, "quantity", 0)))
            unit_price = Decimal(str(getattr(item, "unit_price", 0)))
        total += quantity * unit_price
    return total

def check_budget_alert(total_estimated: Decimal, max_budget: Any) -> bool:
    """
    Returns True if total_estimated exceeds max_budget.
    If max_budget is None or invalid, returns False.
    """
    if max_budget is None:
        return False
    try:
        return total_estimated > Decimal(str(max_budget))
    except (ValueError, TypeError):
        return False
