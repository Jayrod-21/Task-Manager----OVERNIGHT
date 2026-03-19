"""
Pydantic schemas for Task CRUD operations.

Handles validation of all task fields including enums,
dates, JSONB tags, and nested subtask data.
"""

from datetime import datetime, date
from uuid import UUID
from typing import Optional, List

from pydantic import BaseModel, Field

from models.task import PriorityEnum, StatusEnum
from schemas.subtask import SubtaskResponse


class TaskCreate(BaseModel):
    """
    Schema for creating a new task.

    Args:
        title: Task title (required).
        description: Optional description text.
        priority: Priority level — defaults to medium.
        status: Task status — defaults to not_started.
        due_date: Optional due date.
        tags: List of string tags — defaults to empty.
        is_urgent: Urgent flag — defaults to False.
        notes: Optional freeform notes.
    """
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    priority: PriorityEnum = PriorityEnum.medium
    status: StatusEnum = StatusEnum.not_started
    due_date: Optional[date] = None
    tags: List[str] = Field(default_factory=list)
    is_urgent: bool = False
    notes: Optional[str] = None


class TaskUpdate(BaseModel):
    """
    Schema for updating a task. All fields optional.
    """
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    priority: Optional[PriorityEnum] = None
    status: Optional[StatusEnum] = None
    due_date: Optional[date] = None
    tags: Optional[List[str]] = None
    is_urgent: Optional[bool] = None
    notes: Optional[str] = None


class TaskResponse(BaseModel):
    """
    Schema for task data returned by the API.

    Includes nested subtask list and workspace metadata
    for cross-workspace views (urgent, today, this-week).
    """
    id: UUID
    sub_workspace_id: UUID
    title: str
    description: Optional[str] = None
    priority: PriorityEnum
    status: StatusEnum
    due_date: Optional[date] = None
    tags: List[str] = Field(default_factory=list)
    is_urgent: bool
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    subtasks: List[SubtaskResponse] = Field(default_factory=list)
    workspace_name: Optional[str] = None
    sub_workspace_name: Optional[str] = None
    subtask_count: int = 0
    subtask_complete_count: int = 0

    model_config = {"from_attributes": True}
