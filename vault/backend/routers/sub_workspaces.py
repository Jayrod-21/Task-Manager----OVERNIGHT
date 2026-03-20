"""
Sub-workspace CRUD API endpoints.

Sub-workspaces belong to a parent workspace and contain tasks.
Deleting a sub-workspace cascades to all its tasks and subtasks.
"""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.sub_workspace import SubWorkspace
from models.task import Task
from models.workspace import Workspace
from schemas.sub_workspace import (
    SubWorkspaceCreate,
    SubWorkspaceResponse,
    SubWorkspaceUpdate,
)

router = APIRouter(tags=["sub-workspaces"])


@router.get("/workspaces/{workspace_id}/sub-workspaces", response_model=List[SubWorkspaceResponse])
def list_sub_workspaces(workspace_id: UUID, db: Session = Depends(get_db)):
    """
    List all sub-workspaces for a given workspace.

    Args:
        workspace_id: UUID of the parent workspace.

    Returns:
        List of SubWorkspaceResponse objects with task counts.

    Raises:
        HTTPException 404: If parent workspace not found.
    """
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    subs = (
        db.query(SubWorkspace)
        .filter(SubWorkspace.workspace_id == workspace_id)
        .order_by(SubWorkspace.created_at)
        .all()
    )
    results = []
    for sub in subs:
        task_count = db.query(Task).filter(Task.sub_workspace_id == sub.id).count()
        results.append(
            SubWorkspaceResponse(
                id=sub.id,
                workspace_id=sub.workspace_id,
                name=sub.name,
                description=sub.description,
                created_at=sub.created_at,
                task_count=task_count,
            )
        )
    return results


@router.post(
    "/workspaces/{workspace_id}/sub-workspaces",
    response_model=SubWorkspaceResponse,
    status_code=201,
)
def create_sub_workspace(
    workspace_id: UUID, data: SubWorkspaceCreate, db: Session = Depends(get_db)
):
    """
    Create a new sub-workspace under a workspace.

    Args:
        workspace_id: UUID of the parent workspace.
        data: SubWorkspaceCreate schema with name and optional description.

    Returns:
        The newly created SubWorkspaceResponse.

    Raises:
        HTTPException 404: If parent workspace not found.
    """
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    sub = SubWorkspace(workspace_id=workspace_id, **data.model_dump())
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return SubWorkspaceResponse(
        id=sub.id,
        workspace_id=sub.workspace_id,
        name=sub.name,
        description=sub.description,
        created_at=sub.created_at,
        task_count=0,
    )


@router.put("/sub-workspaces/{sub_workspace_id}", response_model=SubWorkspaceResponse)
def update_sub_workspace(
    sub_workspace_id: UUID, data: SubWorkspaceUpdate, db: Session = Depends(get_db)
):
    """
    Update a sub-workspace's fields.

    Args:
        sub_workspace_id: UUID of the sub-workspace.
        data: SubWorkspaceUpdate schema.

    Returns:
        Updated SubWorkspaceResponse.

    Raises:
        HTTPException 404: If sub-workspace not found.
    """
    sub = db.query(SubWorkspace).filter(SubWorkspace.id == sub_workspace_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Sub-workspace not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(sub, key, value)

    db.commit()
    db.refresh(sub)

    task_count = db.query(Task).filter(Task.sub_workspace_id == sub.id).count()
    return SubWorkspaceResponse(
        id=sub.id,
        workspace_id=sub.workspace_id,
        name=sub.name,
        description=sub.description,
        created_at=sub.created_at,
        task_count=task_count,
    )


@router.delete("/sub-workspaces/{sub_workspace_id}", status_code=204)
def delete_sub_workspace(sub_workspace_id: UUID, db: Session = Depends(get_db)):
    """
    Delete a sub-workspace and cascade to all its tasks.

    Args:
        sub_workspace_id: UUID of the sub-workspace to delete.

    Raises:
        HTTPException 404: If sub-workspace not found.
    """
    sub = db.query(SubWorkspace).filter(SubWorkspace.id == sub_workspace_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Sub-workspace not found")

    db.delete(sub)
    db.commit()
