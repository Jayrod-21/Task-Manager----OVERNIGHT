"""
Pydantic schemas for SubWorkspace CRUD operations.
"""

from datetime import datetime
from uuid import UUID
from typing import Optional

from pydantic import BaseModel, Field


class SubWorkspaceCreate(BaseModel):
    """
    Schema for creating a new sub-workspace.

    Args:
        name: Display name (required).
        description: Optional description.
    """
    name: str = Field(..., max_length=100)
    description: Optional[str] = None


class SubWorkspaceUpdate(BaseModel):
    """
    Schema for updating a sub-workspace. All fields optional.
    """
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None


class SubWorkspaceResponse(BaseModel):
    """
    Schema for sub-workspace data returned by the API.
    """
    id: UUID
    workspace_id: UUID
    name: str
    description: Optional[str] = None
    created_at: datetime
    task_count: int = 0

    model_config = {"from_attributes": True}
