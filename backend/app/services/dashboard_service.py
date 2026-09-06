from datetime import date, datetime, timedelta
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.expense import Expense
from app.schemas.dashboard import (
    CategoryExpenseItem,
    DashboardSummary,
    ExpenseTrendItem,
    ExpenseTrendsResponse,
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
        MonthlyExpenseItem(month=row.month, total=float(row.total))
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
            total=float(row.total),
            count=int(row.count),
        )
        for row in rows
    ]


def get_expense_trends(
    db: Session,
    user_id: int,
    period: str = "week",
    week_offset: int = 0,
) -> ExpenseTrendsResponse:
    today = date.today()

    if period == "week":
        # Monday is 0, Sunday is 6
        start_of_week = today - timedelta(days=today.weekday()) + timedelta(weeks=week_offset)
        end_of_week = start_of_week + timedelta(days=6)

        rows = (
            db.query(
                Expense.expense_date,
                func.coalesce(func.sum(Expense.amount), 0).label("total"),
                func.count(Expense.id).label("count"),
            )
            .filter(
                Expense.user_id == user_id,
                Expense.expense_date >= start_of_week,
                Expense.expense_date <= end_of_week,
            )
            .group_by(Expense.expense_date)
            .all()
        )

        data_by_date = {
            row.expense_date: {"total": float(row.total), "count": int(row.count)}
            for row in rows
        }

        items: list[ExpenseTrendItem] = []
        for i in range(7):
            current_day = start_of_week + timedelta(days=i)
            day_data = data_by_date.get(current_day, {"total": 0.0, "count": 0})
            items.append(
                ExpenseTrendItem(
                    label=current_day.strftime("%a"),
                    full_label=current_day.strftime("%A, %d %b %Y"),
                    date=current_day.isoformat(),
                    total=round(day_data["total"], 2),
                    count=day_data["count"],
                )
            )

        total_amount = round(sum(item.total for item in items), 2)
        average_daily = round(total_amount / 7, 2)
        peak_item = max(items, key=lambda x: x.total) if items else None
        peak_day = peak_item.full_label if peak_item and peak_item.total > 0 else None
        peak_amount = peak_item.total if peak_item and peak_item.total > 0 else 0.0

        if week_offset == 0:
            title = f"This Week ({start_of_week.strftime('%d %b')} – {end_of_week.strftime('%d %b %Y')})"
        else:
            title = f"Week of {start_of_week.strftime('%d %b')} – {end_of_week.strftime('%d %b %Y')}"

        return ExpenseTrendsResponse(
            period="week",
            title=title,
            start_date=start_of_week.isoformat(),
            end_date=end_of_week.isoformat(),
            total_amount=total_amount,
            average_daily=average_daily,
            peak_day=peak_day,
            peak_amount=peak_amount,
            items=items,
        )

    elif period == "days":
        # Last 14 days
        start_date = today - timedelta(days=13)
        end_date = today

        rows = (
            db.query(
                Expense.expense_date,
                func.coalesce(func.sum(Expense.amount), 0).label("total"),
                func.count(Expense.id).label("count"),
            )
            .filter(
                Expense.user_id == user_id,
                Expense.expense_date >= start_date,
                Expense.expense_date <= end_date,
            )
            .group_by(Expense.expense_date)
            .all()
        )

        data_by_date = {
            row.expense_date: {"total": float(row.total), "count": int(row.count)}
            for row in rows
        }

        items: list[ExpenseTrendItem] = []
        for i in range(14):
            current_day = start_date + timedelta(days=i)
            day_data = data_by_date.get(current_day, {"total": 0.0, "count": 0})
            items.append(
                ExpenseTrendItem(
                    label=current_day.strftime("%d %b"),
                    full_label=current_day.strftime("%A, %d %b %Y"),
                    date=current_day.isoformat(),
                    total=round(day_data["total"], 2),
                    count=day_data["count"],
                )
            )

        total_amount = round(sum(item.total for item in items), 2)
        average_daily = round(total_amount / 14, 2)
        peak_item = max(items, key=lambda x: x.total) if items else None
        peak_day = peak_item.full_label if peak_item and peak_item.total > 0 else None
        peak_amount = peak_item.total if peak_item and peak_item.total > 0 else 0.0

        title = f"Last 14 Days ({start_date.strftime('%d %b')} – {end_date.strftime('%d %b %Y')})"

        return ExpenseTrendsResponse(
            period="days",
            title=title,
            start_date=start_date.isoformat(),
            end_date=end_date.isoformat(),
            total_amount=total_amount,
            average_daily=average_daily,
            peak_day=peak_day,
            peak_amount=peak_amount,
            items=items,
        )

    else:  # "month"
        month_label = func.to_char(Expense.expense_date, "YYYY-MM")
        rows = (
            db.query(
                month_label.label("month"),
                func.coalesce(func.sum(Expense.amount), 0).label("total"),
                func.count(Expense.id).label("count"),
            )
            .filter(Expense.user_id == user_id)
            .group_by(month_label)
            .order_by(month_label)
            .all()
        )

        items: list[ExpenseTrendItem] = []
        for row in rows:
            try:
                dt = datetime.strptime(row.month, "%Y-%m")
                fmt_label = dt.strftime("%b %Y")
                full_label = dt.strftime("%B %Y")
            except Exception:
                fmt_label = row.month
                full_label = row.month

            items.append(
                ExpenseTrendItem(
                    label=fmt_label,
                    full_label=full_label,
                    date=f"{row.month}-01",
                    total=round(float(row.total), 2),
                    count=int(row.count),
                )
            )

        total_amount = round(sum(item.total for item in items), 2)
        average_daily = round(total_amount / max(len(items), 1), 2)
        peak_item = max(items, key=lambda x: x.total) if items else None
        peak_day = peak_item.full_label if peak_item and peak_item.total > 0 else None
        peak_amount = peak_item.total if peak_item and peak_item.total > 0 else 0.0

        return ExpenseTrendsResponse(
            period="month",
            title="Monthly Overview",
            start_date=items[0].date if items else today.isoformat(),
            end_date=items[-1].date if items else today.isoformat(),
            total_amount=total_amount,
            average_daily=average_daily,
            peak_day=peak_day,
            peak_amount=peak_amount,
            items=items,
        )


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
