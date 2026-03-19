"""
Database engine and session factory for SQLAlchemy.

Creates the async-compatible engine and provides a dependency
for FastAPI route handlers to obtain database sessions.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from config import settings

# SQLAlchemy engine connected to PostgreSQL
engine = create_engine(settings.database_url, echo=False)

# Session factory — each call creates a new database session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all ORM models
Base = declarative_base()


def get_db():
    """
    FastAPI dependency that yields a database session.

    Ensures the session is properly closed after each request.

    Yields:
        Session: A SQLAlchemy database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
