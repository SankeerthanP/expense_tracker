from datetime import date

from fastapi import HTTPException, status
from sqlalchemy import asc, desc
from sqlalchemy.orm import Session

from app.models.expense import Expense
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, SortOption


def create_expense(db: Session, user_id: int, expense_data: ExpenseCreate) -> Expense:
    expense = Expense(
        user_id=user_id,
        amount=expense_data.amount,
        category=expense_data.category,
        reason=expense_data.reason.strip(),
        expense_date=expense_data.expense_date,
        expense_time=expense_data.expense_time,
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


def get_user_expense(db: Session, user_id: int, expense_id: int) -> Expense:
    expense = (
        db.query(Expense)
        .filter(Expense.id == expense_id, Expense.user_id == user_id)
        .first()
    )
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found.",
        )
    return expense


def list_expenses(
    db: Session,
    user_id: int,
    category: str | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    search: str | None = None,
    sort: SortOption = "newest",
) -> list[Expense]:
    query = db.query(Expense).filter(Expense.user_id == user_id)

    if category:
        query = query.filter(Expense.category == category)
    if start_date:
        query = query.filter(Expense.expense_date >= start_date)
    if end_date:
        query = query.filter(Expense.expense_date <= end_date)
    if search:
        query = query.filter(Expense.reason.ilike(f"%{search.strip()}%"))

    sort_map = {
        "newest": desc(Expense.expense_date),
        "oldest": asc(Expense.expense_date),
        "highest": desc(Expense.amount),
        "lowest": asc(Expense.amount),
    }
    query = query.order_by(sort_map.get(sort, desc(Expense.expense_date)), desc(Expense.id))

    return query.all()


def update_expense(
    db: Session, user_id: int, expense_id: int, expense_data: ExpenseUpdate
) -> Expense:
    expense = get_user_expense(db, user_id, expense_id)
    update_data = expense_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        if field == "reason" and isinstance(value, str):
            value = value.strip()
        setattr(expense, field, value)

    db.commit()
    db.refresh(expense)
    return expense


def delete_expense(db: Session, user_id: int, expense_id: int) -> None:
    expense = get_user_expense(db, user_id, expense_id)
    db.delete(expense)
    db.commit()
