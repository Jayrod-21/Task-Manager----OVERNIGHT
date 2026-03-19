"""
Pydantic schemas for Workspace CRUD operations.

Defines the shape of data for creating, updating, and
returning workspace records via the API.
"""

from datetime import datetime
from uuid import UUID
from typing import Optional

from pydantic import BaseModel, Field


class WorkspaceCreate(BaseModel):
    """
    Schema for creating a new workspace.

    Args:
        name: Display name for the workspace (required).
        description: Optional longer description.
        color: Optional hex color string for sidebar label.
    """
    name: str = Field(..., max_length=100)
    description: Optional[str] = None
    color: Optional[str] = Field(None, max_length=7)


class WorkspaceUpdate(BaseModel):
    """
    Schema for updating an existing workspace.

    All fields are optional — only provided fields are updated.
    """
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    color: Optional[str] = Field(None, max_length=7)


class WorkspaceResponse(BaseModel):
    """
    Schema for workspace data returned by the API.

    Includes computed sub_workspace_count for list views.
    """
    id: UUID
    name: str
    description: Optional[str] = None
    color: Optional[str] = None
    created_at: datetime
    sub_workspace_count: int = 0

    model_config = {"from_attributes": True}
