"""
Workspace CRUD API endpoints.

Handles creating, reading, updating, and deleting top-level workspaces.
Each workspace is a sealed container — deleting one cascades to all
sub-workspaces and tasks within it.
"""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.sub_workspace import SubWorkspace
from models.workspace import Workspace
from schemas.workspace import WorkspaceCreate, WorkspaceResponse, WorkspaceUpdate

router = APIRouter(prefix="/workspaces", tags=["workspaces"])


@router.get("", response_model=List[WorkspaceResponse])
def list_workspaces(db: Session = Depends(get_db)):
    """
    List all workspaces with their sub-workspace counts.

    Returns:
        List of WorkspaceResponse objects.
    """
    workspaces = db.query(Workspace).order_by(Workspace.created_at).all()
    results = []
    for ws in workspaces:
        # Count sub-workspaces for each workspace
        sub_count = db.query(SubWorkspace).filter(SubWorkspace.workspace_id == ws.id).count()
        resp = WorkspaceResponse(
            id=ws.id,
            name=ws.name,
            description=ws.description,
            color=ws.color,
            created_at=ws.created_at,
            sub_workspace_count=sub_count,
        )
        results.append(resp)
    return results


@router.post("", response_model=WorkspaceResponse, status_code=201)
def create_workspace(data: WorkspaceCreate, db: Session = Depends(get_db)):
    """
    Create a new workspace.

    Args:
        data: WorkspaceCreate schema with name, optional description and color.

    Returns:
        The newly created WorkspaceResponse.
    """
    workspace = Workspace(**data.model_dump())
    db.add(workspace)
    db.commit()
    db.refresh(workspace)
    return WorkspaceResponse(
        id=workspace.id,
        name=workspace.name,
        description=workspace.description,
        color=workspace.color,
        created_at=workspace.created_at,
        sub_workspace_count=0,
    )


@router.put("/{workspace_id}", response_model=WorkspaceResponse)
def update_workspace(workspace_id: UUID, data: WorkspaceUpdate, db: Session = Depends(get_db)):
    """
    Update an existing workspace's fields.

    Args:
        workspace_id: UUID of the workspace to update.
        data: WorkspaceUpdate schema with optional fields.

    Returns:
        Updated WorkspaceResponse.

    Raises:
        HTTPException 404: If workspace not found.
    """
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(workspace, key, value)

    db.commit()
    db.refresh(workspace)

    sub_count = db.query(SubWorkspace).filter(SubWorkspace.workspace_id == workspace.id).count()
    return WorkspaceResponse(
        id=workspace.id,
        name=workspace.name,
        description=workspace.description,
        color=workspace.color,
        created_at=workspace.created_at,
        sub_workspace_count=sub_count,
    )


@router.delete("/{workspace_id}", status_code=204)
def delete_workspace(workspace_id: UUID, db: Session = Depends(get_db)):
    """
    Delete a workspace and cascade to all sub-workspaces and tasks.

    Args:
        workspace_id: UUID of the workspace to delete.

    Raises:
        HTTPException 404: If workspace not found.
    """
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    db.delete(workspace)
    db.commit()
