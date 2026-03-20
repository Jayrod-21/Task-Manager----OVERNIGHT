"""
Pydantic schemas for Subtask CRUD operations.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class SubtaskCreate(BaseModel):
    """
    Schema for creating a new subtask.

    Args:
        title: Subtask description text (required).
    """
    title: str = Field(..., max_length=255)


class SubtaskUpdate(BaseModel):
    """
    Schema for updating a subtask.
    """
    title: Optional[str] = Field(None, max_length=255)
    is_complete: Optional[bool] = None


class SubtaskResponse(BaseModel):
    """
    Schema for subtask data returned by the API.
    """
    id: UUID
    task_id: UUID
    title: str
    is_complete: bool
    created_at: datetime

    model_config = {"from_attributes": True}
