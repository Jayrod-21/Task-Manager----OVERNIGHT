# Vault — Project Context & Reference

> This file is the single source of truth for any Claude Code session working on Vault.
> Read this file FIRST before writing any code or making any architectural decisions.

---

## What Is Vault?

Vault is a self-hosted, single-user personal task and project manager. It is a local web application (served via Docker) with a React frontend, FastAPI Python backend, and PostgreSQL database. It replaces scattered task management tools with one clean, segmented system.

---

## Why It Exists — The Problem

The user manages 8+ distinct groups and projects simultaneously:
- Academic research (Stats Lab — multiple projects)
- Startup ventures (Startup Group — 5+ projects)
- Client consulting (Consulting Firm — private/confidential)
- Finance models (two separate partnerships with different members)
- Personal learning (Stock Market)
- School (Homework — multiple classes)
- Personal projects

**Critical constraint:** These groups CANNOT share data with each other. Consulting client information cannot be visible in the Stats Lab workspace. Finance model details cannot appear in startup projects. Each workspace is a sealed vault.

Notion was too complex to maintain. Tasks became buried in nested pages. Vault is the antidote: minimal, fast, and segmented.

---

## Core Design Principles (Non-Negotiable)

1. **Isolation first** — workspaces NEVER share or contaminate each other's data
2. **Unified personal view** — the user sees everything in one dashboard, but data stays siloed underneath
3. **Minimal UI** — no feature bloat; only what's in the spec gets built
4. **Extensible** — new workspaces and sub-workspaces can be added at any time by the user
5. **Python backend** — all backend code defaults to Python

---

## Data Model

```
Workspace (top-level, e.g. "Stats Lab")
  └── SubWorkspace (e.g. "Project Alpha")
        └── Task
              ├── title: str
              ├── description: str (optional, AI-assisted)
              ├── priority: enum [low, medium, high]
              ├── status: enum [not_started, in_progress, done, blocked]
              ├── due_date: date (optional)
              ├── tags: JSONB array
              ├── is_urgent: bool (surfaces on global dashboard)
              ├── notes: text (optional)
              ├── created_at: timestamp
              ├── updated_at: timestamp
              └── Subtask[]
                    ├── title: str
                    └── is_complete: bool
```

---

## Tech Stack (Locked)

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React + Vite | Latest stable |
| Styling | TailwindCSS | v3 |
| Backend | FastAPI | Latest stable |
| ORM | SQLAlchemy | v2 |
| Migrations | Alembic | Latest stable |
| Database | PostgreSQL | 15 |
| Containerization | Docker + Docker Compose | Latest stable |
| AI Helper | Claude API (`claude-sonnet-4-5`) | Via Anthropic SDK |

---

## UI Color Palette (Locked)

```css
--bg-primary:   #FAFAF8;  /* warm white — page background */
--bg-surface:   #F5F4F0;  /* cream — cards, panels */
--border:       #E8E6E1;  /* light gray — dividers, borders */
--text-primary: #2D2C2A;  /* near black — main text */
--text-muted:   #9CA3AF;  /* muted gray — secondary text */
--accent:       #6B7280;  /* muted slate — icons, active states */
--urgent:       #DC2626;  /* red — urgent flag only */
--success:      #16A34A;  /* green — done status only */
```

No gradients. No heavy shadows. Max shadow: `shadow-sm`.

---

## Ports (Docker)

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Backend API docs: `http://localhost:8000/docs`
- PostgreSQL: internal Docker network only (port 5432, not exposed)

---

## Default Workspaces (Seeded on First Run)

These must be seeded via `backend/seed.py` on first container start:

1. Stats Lab
2. Startup Group
3. Consulting Firm
4. Finance Model — Partner
5. Finance Model — Partner + Buddy
6. Personal Projects
7. Stock Market Learning
8. Homework / School

Sub-workspaces are NOT seeded — the user creates them manually.

---

## API Route Map

```
GET    /workspaces                          — list all workspaces
POST   /workspaces                          — create workspace
PUT    /workspaces/{id}                     — update workspace
DELETE /workspaces/{id}                     — delete workspace

GET    /workspaces/{id}/sub-workspaces      — list sub-workspaces
POST   /workspaces/{id}/sub-workspaces      — create sub-workspace
PUT    /sub-workspaces/{id}                 — update sub-workspace
DELETE /sub-workspaces/{id}                 — delete sub-workspace

GET    /sub-workspaces/{id}/tasks           — list tasks in sub-workspace
POST   /sub-workspaces/{id}/tasks           — create task
PUT    /tasks/{id}                          — update task
DELETE /tasks/{id}                          — delete task

GET    /tasks/urgent                        — all urgent tasks (cross-workspace)
GET    /tasks/today                         — tasks due today (cross-workspace)
GET    /tasks/this-week                     — tasks due this week (cross-workspace)

GET    /dashboard/summary                   — counts per workspace + urgent count

POST   /ai/describe-task                    — AI description helper (title + workspace → description)
```

---

## Frontend Component Map

```
App.jsx
├── Sidebar.jsx              — workspace tree, collapsible, create new workspace/sub-workspace
├── pages/
│   ├── Home.jsx             — renders Dashboard.jsx
│   └── Workspace.jsx        — renders WorkspaceView.jsx for selected sub-workspace
├── components/
│   ├── Dashboard.jsx        — unified view: counts, urgent list, today/this week
│   ├── WorkspaceView.jsx    — container for task list within a sub-workspace
│   ├── TaskList.jsx         — table/list of tasks
│   ├── TaskRow.jsx          — single task row (title, priority, status, due, tags, urgent, subtask count)
│   ├── TaskModal.jsx        — create/edit modal with all fields + AI description button + subtasks
│   ├── QuickAdd.jsx         — Ctrl/Cmd+K quick-add overlay
│   └── UrgentBadge.jsx      — reusable urgent flag indicator
└── api/
    └── client.js            — axios/fetch wrapper for all API calls
```

---

## Code Quality Standards

- All Python functions: docstrings with purpose, params, and return values
- All React components: JSDoc-style block comment at the top
- Inline comments on non-obvious logic
- `.env.example` documents every required environment variable
- No magic strings — use constants files

---

## What Has Been Built

As of Session 002, the full v1.0 application has been implemented:
- Complete backend with FastAPI, SQLAlchemy models, Alembic migrations, and seed script
- Complete frontend with React + Vite, TailwindCSS, all components
- Docker Compose setup for all services
- AI description helper integration

---

## Version History

| Version | Description | Date |
|---------|-------------|------|
| v0.0 | Planning complete | 2026-03-19 |
| v1.0 | Full implementation complete | 2026-03-19 |
