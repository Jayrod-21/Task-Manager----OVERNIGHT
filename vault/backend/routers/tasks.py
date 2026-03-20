"""
Task CRUD API endpoints plus cross-workspace query endpoints.

Handles full task lifecycle (create, read, update, delete) within
a sub-workspace, plus global views for urgent, today, and this-week tasks.
Subtask management is also handled here.
"""

from datetime import date, timedelta
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from database import get_db
from models.sub_workspace import SubWorkspace
from models.subtask import Subtask
from models.task import PriorityEnum, StatusEnum, Task
from schemas.subtask import SubtaskCreate, SubtaskResponse, SubtaskUpdate
from schemas.task import TaskCreate, TaskResponse, TaskUpdate

router = APIRouter(tags=["tasks"])


def _task_to_response(task: Task, db: Session) -> TaskResponse:
    """
    Convert a Task ORM object to a TaskResponse schema.

    Includes workspace/sub-workspace names for cross-workspace views
    and subtask counts for list displays.

    Args:
        task: SQLAlchemy Task instance.
        db: Active database session for loading relationships.

    Returns:
        TaskResponse with all computed fields populated.
    """
    sub_ws = task.sub_workspace
    ws_name = sub_ws.workspace.name if sub_ws and sub_ws.workspace else None
    sub_ws_name = sub_ws.name if sub_ws else None

    subtasks = [
        SubtaskResponse(
            id=st.id,
            task_id=st.task_id,
            title=st.title,
            is_complete=st.is_complete,
            created_at=st.created_at,
        )
        for st in task.subtasks
    ]

    return TaskResponse(
        id=task.id,
        sub_workspace_id=task.sub_workspace_id,
        title=task.title,
        description=task.description,
        priority=task.priority,
        status=task.status,
        due_date=task.due_date,
        tags=task.tags or [],
        is_urgent=task.is_urgent,
        notes=task.notes,
        created_at=task.created_at,
        updated_at=task.updated_at,
        subtasks=subtasks,
        workspace_name=ws_name,
        sub_workspace_name=sub_ws_name,
        subtask_count=len(subtasks),
        subtask_complete_count=sum(1 for st in subtasks if st.is_complete),
    )


# --- Cross-workspace endpoints (must be registered before /{id} routes) ---


@router.get("/tasks/urgent", response_model=List[TaskResponse])
def get_urgent_tasks(db: Session = Depends(get_db)):
    """
    Get all urgent tasks across all workspaces.

    Returns:
        List of TaskResponse for tasks where is_urgent is True.
    """
    tasks = (
        db.query(Task)
        .options(joinedload(Task.subtasks), joinedload(Task.sub_workspace))
        .filter(Task.is_urgent == True)
        .order_by(Task.due_date.asc().nullslast(), Task.created_at.desc())
        .all()
    )
    return [_task_to_response(t, db) for t in tasks]


@router.get("/tasks/today", response_model=List[TaskResponse])
def get_today_tasks(db: Session = Depends(get_db)):
    """
    Get all tasks due today across all workspaces.

    Returns:
        List of TaskResponse for tasks due on today's date.
    """
    today = date.today()
    tasks = (
        db.query(Task)
        .options(joinedload(Task.subtasks), joinedload(Task.sub_workspace))
        .filter(Task.due_date == today)
        .order_by(Task.priority.desc(), Task.created_at.desc())
        .all()
    )
    return [_task_to_response(t, db) for t in tasks]


@router.get("/tasks/this-week", response_model=List[TaskResponse])
def get_this_week_tasks(db: Session = Depends(get_db)):
    """
    Get all tasks due within the next 7 days across all workspaces.

    Returns:
        List of TaskResponse for tasks due between today and 7 days from now.
    """
    today = date.today()
    week_end = today + timedelta(days=7)
    tasks = (
        db.query(Task)
        .options(joinedload(Task.subtasks), joinedload(Task.sub_workspace))
        .filter(Task.due_date >= today, Task.due_date <= week_end)
        .order_by(Task.due_date.asc(), Task.priority.desc())
        .all()
    )
    return [_task_to_response(t, db) for t in tasks]


# --- Sub-workspace scoped endpoints ---


@router.get("/sub-workspaces/{sub_workspace_id}/tasks", response_model=List[TaskResponse])
def list_tasks(
    sub_workspace_id: UUID,
    status: Optional[StatusEnum] = Query(None),
    priority: Optional[PriorityEnum] = Query(None),
    tag: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """
    List tasks for a sub-workspace with optional filters.

    Args:
        sub_workspace_id: UUID of the sub-workspace.
        status: Optional status filter.
        priority: Optional priority filter.
        tag: Optional tag filter (checks if tag is in JSONB tags array).

    Returns:
        Filtered list of TaskResponse objects.

    Raises:
        HTTPException 404: If sub-workspace not found.
    """
    sub = db.query(SubWorkspace).filter(SubWorkspace.id == sub_workspace_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Sub-workspace not found")

    query = (
        db.query(Task)
        .options(joinedload(Task.subtasks), joinedload(Task.sub_workspace))
        .filter(Task.sub_workspace_id == sub_workspace_id)
    )

    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)
    if tag:
        # Filter tasks that contain the specified tag in their JSONB tags array
        query = query.filter(Task.tags.contains([tag]))

    tasks = query.order_by(Task.created_at.desc()).all()
    return [_task_to_response(t, db) for t in tasks]


@router.post(
    "/sub-workspaces/{sub_workspace_id}/tasks",
    response_model=TaskResponse,
    status_code=201,
)
def create_task(sub_workspace_id: UUID, data: TaskCreate, db: Session = Depends(get_db)):
    """
    Create a new task in a sub-workspace.

    Args:
        sub_workspace_id: UUID of the parent sub-workspace.
        data: TaskCreate schema with title and optional fields.

    Returns:
        The newly created TaskResponse.

    Raises:
        HTTPException 404: If sub-workspace not found.
    """
    sub = db.query(SubWorkspace).filter(SubWorkspace.id == sub_workspace_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Sub-workspace not found")

    task = Task(sub_workspace_id=sub_workspace_id, **data.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)

    # Reload with relationships
    task = (
        db.query(Task)
        .options(joinedload(Task.subtasks), joinedload(Task.sub_workspace))
        .filter(Task.id == task.id)
        .first()
    )
    return _task_to_response(task, db)


@router.put("/tasks/{task_id}", response_model=TaskResponse)
def update_task(task_id: UUID, data: TaskUpdate, db: Session = Depends(get_db)):
    """
    Update a task's fields.

    Args:
        task_id: UUID of the task to update.
        data: TaskUpdate schema with optional fields.

    Returns:
        Updated TaskResponse.

    Raises:
        HTTPException 404: If task not found.
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)

    db.commit()
    db.refresh(task)

    task = (
        db.query(Task)
        .options(joinedload(Task.subtasks), joinedload(Task.sub_workspace))
        .filter(Task.id == task.id)
        .first()
    )
    return _task_to_response(task, db)


@router.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: UUID, db: Session = Depends(get_db)):
    """
    Delete a task and all its subtasks.

    Args:
        task_id: UUID of the task to delete.

    Raises:
        HTTPException 404: If task not found.
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()


# --- Subtask endpoints ---


@router.post("/tasks/{task_id}/subtasks", response_model=SubtaskResponse, status_code=201)
def create_subtask(task_id: UUID, data: SubtaskCreate, db: Session = Depends(get_db)):
    """
    Add a subtask to an existing task.

    Args:
        task_id: UUID of the parent task.
        data: SubtaskCreate schema with title.

    Returns:
        The newly created SubtaskResponse.

    Raises:
        HTTPException 404: If parent task not found.
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    subtask = Subtask(task_id=task_id, **data.model_dump())
    db.add(subtask)
    db.commit()
    db.refresh(subtask)
    return SubtaskResponse(
        id=subtask.id,
        task_id=subtask.task_id,
        title=subtask.title,
        is_complete=subtask.is_complete,
        created_at=subtask.created_at,
    )


@router.put("/subtasks/{subtask_id}", response_model=SubtaskResponse)
def update_subtask(subtask_id: UUID, data: SubtaskUpdate, db: Session = Depends(get_db)):
    """
    Update a subtask (title or completion status).

    Args:
        subtask_id: UUID of the subtask.
        data: SubtaskUpdate schema.

    Returns:
        Updated SubtaskResponse.

    Raises:
        HTTPException 404: If subtask not found.
    """
    subtask = db.query(Subtask).filter(Subtask.id == subtask_id).first()
    if not subtask:
        raise HTTPException(status_code=404, detail="Subtask not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(subtask, key, value)

    db.commit()
    db.refresh(subtask)
    return SubtaskResponse(
        id=subtask.id,
        task_id=subtask.task_id,
        title=subtask.title,
        is_complete=subtask.is_complete,
        created_at=subtask.created_at,
    )


@router.delete("/subtasks/{subtask_id}", status_code=204)
def delete_subtask(subtask_id: UUID, db: Session = Depends(get_db)):
    """
    Delete a subtask.

    Args:
        subtask_id: UUID of the subtask to delete.

    Raises:
        HTTPException 404: If subtask not found.
    """
    subtask = db.query(Subtask).filter(Subtask.id == subtask_id).first()
    if not subtask:
        raise HTTPException(status_code=404, detail="Subtask not found")

    db.delete(subtask)
    db.commit()
