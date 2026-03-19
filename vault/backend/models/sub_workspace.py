"""
SubWorkspace model — second-level container within a workspace.

Sub-workspaces group tasks under a workspace (e.g., "Project Alpha"
under "Stats Lab"). Deleting a sub-workspace cascades to its tasks.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database import Base


class SubWorkspace(Base):
    """
    ORM model for the sub_workspaces table.

    Attributes:
        id: Unique identifier (UUID).
        workspace_id: FK to parent workspace.
        name: Sub-workspace display name.
        description: Optional description.
        created_at: Timestamp of creation.
        workspace: Relationship to parent workspace.
        tasks: Relationship to child tasks.
    """

    __tablename__ = "sub_workspaces"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(
        UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False
    )
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    workspace = relationship("Workspace", back_populates="sub_workspaces")
    tasks = relationship("Task", back_populates="sub_workspace", cascade="all, delete-orphan")
