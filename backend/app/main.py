from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, dashboard, expenses
from app.core.config import settings
from app.database import Base, engine
from app.models import expense, user  # noqa: F401

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Personal Expense Tracker API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=r"^https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(expenses.router)
app.include_router(dashboard.router)


@app.get("/dashboard")
def dashboard_api_info():
    return {
        "message": "Expense Tracker API is running. The web dashboard is available at http://localhost:5173/dashboard",
        "endpoints": {
            "summary": "/dashboard/summary",
            "expense_trends": "/dashboard/expense-trends",
            "category_expenses": "/dashboard/category-expenses",
            "recent_expenses": "/dashboard/recent-expenses",
        },
    }


@app.get("/health")
def health_check():
    return {"status": "ok"}
