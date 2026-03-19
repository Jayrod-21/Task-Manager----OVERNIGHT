"""
Seed script for populating default workspaces on first run.

Checks if the workspaces table is empty before inserting.
This prevents duplicate seeding on subsequent container starts.
"""

from sqlalchemy.orm import Session

from database import SessionLocal
from models.workspace import Workspace

# Default workspaces to seed on first run
SEED_WORKSPACES = [
    {"name": "Stats Lab", "description": "Academic research projects", "color": "#6B7280"},
    {"name": "Startup Group", "description": "Startup venture projects", "color": "#6B7280"},
    {"name": "Consulting Firm", "description": "Client consulting work", "color": "#6B7280"},
    {
        "name": "Finance Model — Partner",
        "description": "Two-person finance model",
        "color": "#6B7280",
    },
    {
        "name": "Finance Model — Partner + Buddy",
        "description": "Three-person finance model",
        "color": "#6B7280",
    },
    {"name": "Personal Projects", "description": "Personal side projects", "color": "#6B7280"},
    {
        "name": "Stock Market Learning",
        "description": "Stock market research and learning",
        "color": "#6B7280",
    },
    {
        "name": "Homework / School",
        "description": "Academic coursework and classes",
        "color": "#6B7280",
    },
]


def seed_workspaces(db: Session) -> None:
    """
    Insert default workspaces if the table is empty.

    Args:
        db: Active SQLAlchemy session.

    Returns:
        None. Commits seed data or skips if data already exists.
    """
    existing_count = db.query(Workspace).count()
    if existing_count > 0:
        print(f"Seed skipped — {existing_count} workspaces already exist.")
        return

    for ws_data in SEED_WORKSPACES:
        workspace = Workspace(**ws_data)
        db.add(workspace)

    db.commit()
    print(f"Seeded {len(SEED_WORKSPACES)} default workspaces.")


def run_seed() -> None:
    """
    Entry point for running the seed script standalone.

    Creates a database session and calls seed_workspaces.
    """
    db = SessionLocal()
    try:
        seed_workspaces(db)
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
