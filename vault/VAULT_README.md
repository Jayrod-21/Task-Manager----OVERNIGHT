# Vault — Personal Task & Project Manager

## Overview

Vault is a self-hosted, single-user personal task and project management web application. It solves the problem of managing tasks across multiple isolated workspaces — each with different privacy requirements — without any single place to view everything.

Vault is the minimal, segmented alternative to Notion: no feature bloat, just what you need.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite |
| Styling | TailwindCSS (custom neutral palette) |
| Backend | FastAPI (Python) |
| ORM | SQLAlchemy |
| Database | PostgreSQL 15 |
| Containerization | Docker + Docker Compose |

## Architecture

```
Workspace → Sub-Workspace → Task → Subtask
```

Three-level hierarchy. Workspaces are fully isolated — no data leaks between them. The unified dashboard aggregates your personal view across all workspaces without breaking isolation.

## Core Features (v1)

- Unlimited workspace + sub-workspace creation (dynamic, user-managed)
- Task fields: title, description (AI-assisted), priority, status, due date, tags, subtasks, notes
- Global urgent flag — surfaces across all workspaces in the dashboard
- Unified dashboard: task counts per workspace, today view, this week view
- List/table view per workspace
- Quick-add shortcut (Ctrl/Cmd + K)
- Edit/update tasks after creation

## Default Workspaces (seeded on first run)

1. Stats Lab
2. Startup Group
3. Consulting Firm
4. Finance Model — Partner
5. Finance Model — Partner + Buddy
6. Personal Projects
7. Stock Market Learning
8. Homework / School

## UI Design

- Background: `#FAFAF8` (warm white)
- Surface: `#F5F4F0` (cream)
- Border: `#E8E6E1` (light gray)
- Text: `#2D2C2A` (near black)
- Accent: `#6B7280` (muted slate)
- No animations, no gradients, no heavy shadows — clean and minimal

## Running Locally

```bash
# Clone repo and navigate to project root
cd vault

# Copy environment variables
cp .env.example .env
# Edit .env and set your ANTHROPIC_API_KEY (optional, for AI helper)

# Build and run
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API docs: http://localhost:8000/docs

## Project Status

- [x] v1.0 — Full implementation (Docker, backend, frontend, AI helper)

## Constraints

- Single user only — no authentication or login system
- No multi-user or collaboration features in v1
- No Kanban or calendar views in v1
- All data stored locally via PostgreSQL Docker volume (persists across restarts)
- Data isolation enforced at the database level via foreign keys
