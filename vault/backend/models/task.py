"""
Task model — the core unit of work in Vault.

Tasks belong to a sub-workspace and contain all trackable fields:
priority, status, due date, tags, urgency flag, notes, and subtasks.
"""

import uuid
import enum
from datetime import datetime

from sqlalchemy import Column, String, Text, DateTime, Date, Boolean, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from database import Base


class PriorityEnum(str, enum.Enum):
    """Task priority levels."""
    low = "low"
    medium = "medium"
    high = "high"


class StatusEnum(str, enum.Enum):
    """Task status values."""
    not_started = "not_started"
    in_progress = "in_progress"
    done = "done"
    blocked = "blocked"


class Task(Base):
    """
    ORM model for the tasks table.

    Attributes:
        id: Unique identifier (UUID).
        sub_workspace_id: FK to parent sub-workspace.
        title: Task title (max 255 chars).
        description: Optional longer description.
        priority: Enum — low, medium, or high.
        status: Enum — not_started, in_progress, done, or blocked.
        due_date: Optional due date.
        tags: JSONB array of string tags.
        is_urgent: Boolean flag surfaced on the global dashboard.
        notes: Optional freeform notes.
        created_at: Creation timestamp.
        updated_at: Last-modified timestamp (auto-updates).
        sub_workspace: Relationship to parent sub-workspace.
        subtasks: Relationship to child subtasks.
    """

    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sub_workspace_id = Column(
        UUID(as_uuid=True), ForeignKey("sub_workspaces.id", ondelete="CASCADE"), nullable=False
    )
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(Enum(PriorityEnum), default=PriorityEnum.medium, nullable=False)
    status = Column(Enum(StatusEnum), default=StatusEnum.not_started, nullable=False)
    due_date = Column(Date, nullable=True)
    tags = Column(JSONB, default=list)
    is_urgent = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    sub_workspace = relationship("SubWorkspace", back_populates="tasks")
    subtasks = relationship("Subtask", back_populates="task", cascade="all, delete-orphan")
