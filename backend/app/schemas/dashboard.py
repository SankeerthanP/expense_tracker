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
    total: Decimal


class CategoryExpenseItem(BaseModel):
    category: str
    total: Decimal
    count: int


class RecentExpenseItem(BaseModel):
    id: int
    amount: Decimal
    category: str
    reason: str
    expense_date: date
