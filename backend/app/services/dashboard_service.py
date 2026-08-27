from datetime import date
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.expense import Expense
from app.schemas.dashboard import (
    CategoryExpenseItem,
    DashboardSummary,
    MonthlyExpenseItem,
    RecentExpenseItem,
)


def get_dashboard_summary(db: Session, user_id: int) -> DashboardSummary:
    today = date.today()
    month_start = today.replace(day=1)

    total_expenses = (
        db.query(func.coalesce(func.sum(Expense.amount), 0))
        .filter(Expense.user_id == user_id)
        .scalar()
    )
    expenses_this_month = (
        db.query(func.coalesce(func.sum(Expense.amount), 0))
        .filter(Expense.user_id == user_id, Expense.expense_date >= month_start)
        .scalar()
    )
    expenses_today = (
        db.query(func.coalesce(func.sum(Expense.amount), 0))
        .filter(Expense.user_id == user_id, Expense.expense_date == today)
        .scalar()
    )
    total_count = (
        db.query(func.count(Expense.id)).filter(Expense.user_id == user_id).scalar()
    )

    return DashboardSummary(
        total_expenses=Decimal(str(total_expenses)),
        expenses_this_month=Decimal(str(expenses_this_month)),
        expenses_today=Decimal(str(expenses_today)),
        total_count=int(total_count or 0),
    )


def get_monthly_expenses(db: Session, user_id: int) -> list[MonthlyExpenseItem]:
    month_label = func.to_char(Expense.expense_date, "YYYY-MM")
    rows = (
        db.query(
            month_label.label("month"),
            func.coalesce(func.sum(Expense.amount), 0).label("total"),
        )
        .filter(Expense.user_id == user_id)
        .group_by(month_label)
        .order_by(month_label)
        .all()
    )

    return [
        MonthlyExpenseItem(month=row.month, total=Decimal(str(row.total)))
        for row in rows
    ]


def get_category_expenses(db: Session, user_id: int) -> list[CategoryExpenseItem]:
    rows = (
        db.query(
            Expense.category,
            func.coalesce(func.sum(Expense.amount), 0).label("total"),
            func.count(Expense.id).label("count"),
        )
        .filter(Expense.user_id == user_id)
        .group_by(Expense.category)
        .order_by(func.coalesce(func.sum(Expense.amount), 0).desc())
        .all()
    )

    return [
        CategoryExpenseItem(
            category=row.category,
            total=Decimal(str(row.total)),
            count=int(row.count),
        )
        for row in rows
    ]


def get_recent_expenses(db: Session, user_id: int, limit: int = 5) -> list[RecentExpenseItem]:
    expenses = (
        db.query(Expense)
        .filter(Expense.user_id == user_id)
        .order_by(Expense.expense_date.desc(), Expense.id.desc())
        .limit(limit)
        .all()
    )

    return [
        RecentExpenseItem(
            id=expense.id,
            amount=expense.amount,
            category=expense.category,
            reason=expense.reason,
            expense_date=expense.expense_date,
        )
        for expense in expenses
    ]
