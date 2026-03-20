"""
Dashboard API endpoint.

Provides an aggregated summary view across all workspaces,
including task counts, urgent counts, and time-based filters.
"""

from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models.sub_workspace import SubWorkspace
from models.task import Task
from models.workspace import Workspace

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    """
    Get aggregated dashboard summary across all workspaces.

    Returns a dictionary containing:
        - workspaces: List of workspace summaries with task and urgent counts.
        - total_urgent: Total number of urgent tasks across all workspaces.
        - total_today: Number of tasks due today.
        - total_this_week: Number of tasks due within the next 7 days.
    """
    today = date.today()
    week_end = today + timedelta(days=7)

    workspaces = db.query(Workspace).order_by(Workspace.created_at).all()

    workspace_summaries = []
    for ws in workspaces:
        # Get all sub-workspace IDs for this workspace
        sub_ids = [
            row[0]
            for row in db.query(SubWorkspace.id)
            .filter(SubWorkspace.workspace_id == ws.id)
            .all()
        ]

        if sub_ids:
            # Count total tasks across all sub-workspaces in this workspace
            task_count = (
                db.query(func.count(Task.id))
                .filter(Task.sub_workspace_id.in_(sub_ids))
                .scalar()
            )
            # Count urgent tasks
            urgent_count = (
                db.query(func.count(Task.id))
                .filter(Task.sub_workspace_id.in_(sub_ids), Task.is_urgent == True)
                .scalar()
            )
        else:
            task_count = 0
            urgent_count = 0

        workspace_summaries.append(
            {
                "id": str(ws.id),
                "name": ws.name,
                "color": ws.color,
                "task_count": task_count,
                "urgent_count": urgent_count,
            }
        )

    # Cross-workspace totals
    total_urgent = (
        db.query(func.count(Task.id)).filter(Task.is_urgent == True).scalar()
    )
    total_today = (
        db.query(func.count(Task.id)).filter(Task.due_date == today).scalar()
    )
    total_this_week = (
        db.query(func.count(Task.id))
        .filter(Task.due_date >= today, Task.due_date <= week_end)
        .scalar()
    )
    total_tasks = db.query(func.count(Task.id)).scalar()

    return {
        "workspaces": workspace_summaries,
        "total_tasks": total_tasks,
        "total_urgent": total_urgent,
        "total_today": total_today,
        "total_this_week": total_this_week,
    }
