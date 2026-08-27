from datetime import date, datetime, time
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.expense import EXPENSE_CATEGORIES


class ExpenseCreate(BaseModel):
    amount: Decimal = Field(gt=0, decimal_places=2)
    category: str
    reason: str = Field(min_length=1, max_length=500)
    expense_date: date
    expense_time: time

    @field_validator("category")
    @classmethod
    def validate_category(cls, value: str) -> str:
        if value not in EXPENSE_CATEGORIES:
            raise ValueError(f"Category must be one of: {', '.join(EXPENSE_CATEGORIES)}")
        return value


class ExpenseUpdate(BaseModel):
    amount: Decimal | None = Field(default=None, gt=0, decimal_places=2)
    category: str | None = None
    reason: str | None = Field(default=None, min_length=1, max_length=500)
    expense_date: date | None = None
    expense_time: time | None = None

    @field_validator("category")
    @classmethod
    def validate_category(cls, value: str | None) -> str | None:
        if value is not None and value not in EXPENSE_CATEGORIES:
            raise ValueError(f"Category must be one of: {', '.join(EXPENSE_CATEGORIES)}")
        return value


class ExpenseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    amount: Decimal
    category: str
    reason: str
    expense_date: date
    expense_time: time
    user_id: int
    created_at: datetime
    updated_at: datetime


SortOption = Literal["newest", "oldest", "highest", "lowest"]
