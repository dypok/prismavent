from decimal import Decimal, InvalidOperation
from typing import List, Any
from sqlalchemy import text
from sqlalchemy.orm import Session

def calculate_total_estimated(event_items: List[Any]) -> Decimal:
    """
    Calculates the total estimated cost of all items in an event.
    total = SUM(quantity * unit_price)
    """
    total = Decimal("0.0")
    for item in event_items:
        # Gracefully handle dict objects or object-like attributes
        if isinstance(item, dict):
            q_val = item.get("quantity")
            p_val = item.get("unit_price")
        else:
            q_val = getattr(item, "quantity", 0)
            p_val = getattr(item, "unit_price", 0)

        # Treat None (or database NULLs) as 0
        if q_val is None:
            q_val = 0
        if p_val is None:
            p_val = 0

        try:
            quantity = Decimal(str(q_val))
            unit_price = Decimal(str(p_val))
            total += quantity * unit_price
        except (ValueError, TypeError, InvalidOperation):
            pass  # Skip items with invalid numeric representations
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
    except (ValueError, TypeError, InvalidOperation):
        return False

def calculate_total(event_id: str, db: Session) -> Decimal:
    """
    Calculates the total estimated cost of all items in an event by querying the database.
    total = SUM(quantity * unit_price)
    """
    query = text("""
        SELECT COALESCE(SUM(quantity * unit_price), 0) AS total
        FROM event_items
        WHERE event_id = :event_id
    """)
    result = db.execute(query, {"event_id": event_id}).fetchone()
    if result is None or result[0] is None:
        return Decimal("0.0")
    return Decimal(str(result[0]))

def get_amount_over_budget(total_estimated: Decimal, max_budget: Any) -> Decimal:
    """
    Returns the amount by which total_estimated exceeds max_budget.
    If total_estimated <= max_budget or max_budget is None/invalid, returns Decimal("0.0").
    """
    if max_budget is None:
        return Decimal("0.0")
    try:
        mb = Decimal(str(max_budget))
        if total_estimated > mb:
            return total_estimated - mb
        return Decimal("0.0")
    except (ValueError, TypeError, InvalidOperation):
        return Decimal("0.0")
