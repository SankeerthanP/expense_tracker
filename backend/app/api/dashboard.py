from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.dashboard import (
    CategoryExpenseItem,
    DashboardSummary,
    MonthlyExpenseItem,
    RecentExpenseItem,
)
from app.services import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return dashboard_service.get_dashboard_summary(db, current_user.id)


@router.get("/monthly-expenses", response_model=list[MonthlyExpenseItem])
def get_monthly_expenses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return dashboard_service.get_monthly_expenses(db, current_user.id)


@router.get("/category-expenses", response_model=list[CategoryExpenseItem])
def get_category_expenses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return dashboard_service.get_category_expenses(db, current_user.id)


@router.get("/recent-expenses", response_model=list[RecentExpenseItem])
def get_recent_expenses(
    limit: int = Query(default=5, ge=1, le=20),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return dashboard_service.get_recent_expenses(db, current_user.id, limit=limit)
