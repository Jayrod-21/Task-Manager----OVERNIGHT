"""
Vault — FastAPI application entry point.

Configures CORS, registers all API routers, and runs database
migrations and seeding on startup via the lifespan context manager.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from alembic.config import Config
from alembic import command

from database import engine, Base, SessionLocal
from seed import seed_workspaces

# Import models so SQLAlchemy registers all tables
import models  # noqa: F401

from routers.workspaces import router as workspaces_router
from routers.sub_workspaces import router as sub_workspaces_router
from routers.tasks import router as tasks_router
from routers.dashboard import router as dashboard_router
from routers.ai_helper import router as ai_helper_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler — runs on startup and shutdown.

    On startup:
        1. Creates all database tables (if they don't exist).
        2. Runs Alembic migrations to ensure schema is up to date.
        3. Seeds default workspaces if the table is empty.
    """
    # Create tables directly for initial setup
    Base.metadata.create_all(bind=engine)

    # Run Alembic migrations
    try:
        alembic_cfg = Config("alembic.ini")
        command.upgrade(alembic_cfg, "head")
    except Exception as e:
        print(f"Alembic migration note: {e}")

    # Seed default workspaces
    db = SessionLocal()
    try:
        seed_workspaces(db)
    finally:
        db.close()

    yield


app = FastAPI(
    title="Vault API",
    description="Personal task and project manager API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration — allows the frontend at localhost:3000 to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://frontend:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all API routers
app.include_router(workspaces_router)
app.include_router(sub_workspaces_router)
app.include_router(tasks_router)
app.include_router(dashboard_router)
app.include_router(ai_helper_router)


@app.get("/")
def root():
    """
    Root endpoint — health check.

    Returns:
        A simple status message confirming the API is running.
    """
    return {"message": "Vault API is running", "version": "1.0.0"}
