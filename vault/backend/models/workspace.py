"""
Workspace model — top-level organizational container.

Each workspace represents a fully isolated project group
(e.g., "Stats Lab", "Consulting Firm"). Data never leaks
between workspaces.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database import Base


class Workspace(Base):
    """
    ORM model for the workspaces table.

    Attributes:
        id: Unique identifier (UUID).
        name: Workspace display name (max 100 chars).
        description: Optional longer description.
        color: Optional hex color for sidebar label.
        created_at: Timestamp of creation.
        sub_workspaces: Relationship to child sub-workspaces.
    """

    __tablename__ = "workspaces"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    color = Column(String(7), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Cascade delete: removing a workspace removes all its sub-workspaces
    sub_workspaces = relationship(
        "SubWorkspace", back_populates="workspace", cascade="all, delete-orphan"
    )
