from datetime import date
from decimal import Decimal

from pydantic import BaseModel


class DashboardSummary(BaseModel):
    total_expenses: Decimal
    expenses_this_month: Decimal
    expenses_today: Decimal
    total_count: int


class MonthlyExpenseItem(BaseModel):
    month: str
    total: float


class CategoryExpenseItem(BaseModel):
    category: str
    total: float
    count: int


class ExpenseTrendItem(BaseModel):
    label: str
    full_label: str
    date: str | None = None
    total: float
    count: int = 0


class ExpenseTrendsResponse(BaseModel):
    period: str
    title: str
    start_date: str
    end_date: str
    total_amount: float
    average_daily: float
    peak_day: str | None = None
    peak_amount: float = 0.0
    items: list[ExpenseTrendItem]


class RecentExpenseItem(BaseModel):
    id: int
    amount: Decimal
    category: str
    reason: str
    expense_date: date
