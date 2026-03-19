"""
Subtask model — checklist items within a task.

Subtasks are simple title + completion status pairs that belong
to a parent task. Deleting a task cascades to its subtasks.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database import Base


class Subtask(Base):
    """
    ORM model for the subtasks table.

    Attributes:
        id: Unique identifier (UUID).
        task_id: FK to parent task.
        title: Subtask description (max 255 chars).
        is_complete: Whether the subtask is done.
        created_at: Creation timestamp.
        task: Relationship to parent task.
    """

    __tablename__ = "subtasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    task_id = Column(
        UUID(as_uuid=True), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False
    )
    title = Column(String(255), nullable=False)
    is_complete = Column(Boolean, default=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    task = relationship("Task", back_populates="subtasks")
