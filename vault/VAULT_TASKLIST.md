# Vault — Build Task List

## Phase 0 — Scaffold & Docker
- [x] 0.1 Create root project directory structure
- [x] 0.2 Write `docker-compose.yml`
- [x] 0.3 Write `backend/Dockerfile`
- [x] 0.4 Write `frontend/Dockerfile`
- [x] 0.5 Write `.env.example` with all required variables documented
- [ ] 0.6 Confirm `docker-compose up --build` runs without errors

## Phase 1 — Database & Migrations
- [x] 1.1 Write `backend/database.py`
- [x] 1.2 Write `backend/models/workspace.py`
- [x] 1.3 Write `backend/models/sub_workspace.py`
- [x] 1.4 Write `backend/models/task.py`
- [x] 1.5 Write `backend/models/subtask.py`
- [x] 1.6 Configure Alembic
- [x] 1.7 Generate initial migration
- [ ] 1.8 Run migration successfully inside Docker container
- [x] 1.9 Write `backend/seed.py`
- [ ] 1.10 Run seed script and verify data in PostgreSQL

## Phase 2 — Backend API
- [x] 2.1 Write `backend/main.py`
- [x] 2.2 Write `backend/config.py`
- [x] 2.3 Write `backend/schemas/workspace.py`
- [x] 2.4 Write `backend/schemas/sub_workspace.py`
- [x] 2.5 Write `backend/schemas/task.py`
- [x] 2.6 Write `backend/schemas/subtask.py`
- [x] 2.7 Write `backend/routers/workspaces.py`
- [x] 2.8 Write `backend/routers/sub_workspaces.py`
- [x] 2.9 Write `backend/routers/tasks.py`
- [x] 2.10 Write `backend/routers/dashboard.py`
- [x] 2.11 Write `backend/routers/ai_helper.py`
- [ ] 2.12 Verify all endpoints via FastAPI docs
- [ ] 2.13 Confirm cascade deletes work

## Phase 3 — Frontend Scaffold
- [x] 3.1 Initialize React + Vite project
- [x] 3.2 Install dependencies
- [x] 3.3 Configure `tailwind.config.js`
- [x] 3.4 Write `constants/colors.js`
- [x] 3.5 Write `api/client.js`
- [x] 3.6 Set up React Router in `App.jsx`
- [ ] 3.7 Confirm frontend builds and serves

## Phase 4 — Sidebar
- [x] 4.1 Write `Sidebar.jsx`
- [x] 4.2 Implement collapsible workspace sections
- [x] 4.3 Show sub-workspaces under each workspace
- [x] 4.4 Highlight active sub-workspace
- [x] 4.5 "+ New Workspace" button
- [x] 4.6 "+ Sub-workspace" button on hover
- [x] 4.7 Create forms submit to API

## Phase 5 — Dashboard
- [x] 5.1 Write `Dashboard.jsx`
- [x] 5.2 Render stat cards
- [x] 5.3 Render Urgent Tasks section
- [x] 5.4 Render Due Today section
- [x] 5.5 Render Due This Week section
- [x] 5.6 Clicking task opens TaskModal
- [x] 5.7 Write `Home.jsx` page

## Phase 6 — Workspace & Task Views
- [x] 6.1 Write `WorkspaceView.jsx`
- [x] 6.2 Write `TaskList.jsx`
- [x] 6.3 Write `TaskRow.jsx`
- [x] 6.4 Write `UrgentBadge.jsx`
- [x] 6.5 Implement status badge
- [x] 6.6 Implement priority badge
- [x] 6.7 Write `Workspace.jsx` page

## Phase 7 — Task Modal
- [x] 7.1 Write `TaskModal.jsx` — slide-in panel
- [x] 7.2 Implement all input fields
- [x] 7.3 Implement tag input
- [x] 7.4 Implement subtask list
- [x] 7.5 Implement Save button
- [x] 7.6 Implement Delete button with confirm
- [x] 7.7 Implement Cancel / close
- [x] 7.8 Modal opens in create mode
- [x] 7.9 Modal opens in edit mode
- [x] 7.10 Urgent toggle functional

## Phase 8 — Quick Add
- [x] 8.1 Write `QuickAdd.jsx`
- [x] 8.2 Implement Ctrl+K / Cmd+K listener
- [x] 8.3 Implement Escape to close
- [x] 8.4 Workspace + sub-workspace selector
- [x] 8.5 Press Enter to save
- [x] 8.6 Task appears in correct workspace

## Phase 9 — AI Description Helper
- [x] 9.1 Anthropic SDK in requirements.txt
- [x] 9.2 Write `/ai/describe-task` endpoint
- [x] 9.3 Add ANTHROPIC_API_KEY to .env.example
- [x] 9.4 Wire up "Help me write this" button
- [x] 9.5 Display suggestion in yellow box
- [x] 9.6 Implement Accept button
- [x] 9.7 Implement Dismiss button
- [x] 9.8 Handle API errors gracefully

## Phase 10 — Polish & Hardening
- [ ] 10.1 Verify data isolation
- [ ] 10.2 Verify cascade deletes
- [ ] 10.3 Test Docker volume persistence
- [ ] 10.4 Final UI pass
- [x] 10.5 Audit Python functions for docstrings
- [x] 10.6 Audit React components for JSDoc comments
- [x] 10.7 Audit inline comments
- [ ] 10.8 Check for console errors
- [ ] 10.9 Verify FastAPI /docs
- [x] 10.10 Update VAULT_PROJECT_HISTORY.md
- [x] 10.11 Update version in VAULT_CONTEXT.md
