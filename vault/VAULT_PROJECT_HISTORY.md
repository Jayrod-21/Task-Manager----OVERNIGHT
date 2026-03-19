# Vault — Project History

---

## Session 001 — Planning & Ideation

**Date:** 2026-03-19
**Status:** Planning complete — build not started
**Phase:** Pre-development

### Completed
- Identified core pain points
- Defined project concept
- Confirmed tech stack, UI style, feature set
- Named project: **Vault**
- Generated 5 project files

### Decisions Made
| Decision | Choice | Rationale |
|----------|--------|-----------|
| App type | Local web app (Docker) | Cleaner than Electron, Docker-native |
| Database | PostgreSQL | Robust, Docker-native, handles JSONB |
| Backend | FastAPI (Python) | Python default, async, OpenAPI docs |
| Frontend | React + Vite | Handles dynamic workspace tree, fast HMR |
| CSS | TailwindCSS | Utility-first, pairs well with custom palette |
| Views | List/table only | Kanban/calendar adds complexity |
| AI scope | Description writing only | Minimal and useful |
| Auth | None (v1) | Single user, local app |

---

## Session 002 — Full Build

**Date:** 2026-03-19
**Status:** v1.0 implementation complete
**Phase:** Implementation

### Completed
- Phase 0: Project scaffold — docker-compose.yml, Dockerfiles, .env.example
- Phase 1: Database models (Workspace, SubWorkspace, Task, Subtask), Alembic migration, seed script
- Phase 2: Full backend API — all CRUD endpoints, dashboard, AI helper
- Phase 3: Frontend scaffold — React + Vite, Tailwind config, API client
- Phase 4: Sidebar with collapsible workspaces, inline create forms
- Phase 5: Dashboard with stat cards, urgent/today/this-week sections
- Phase 6: WorkspaceView with task table, breadcrumb navigation
- Phase 7: TaskModal with all fields, AI description helper, subtask management
- Phase 8: QuickAdd (Ctrl/Cmd+K) overlay with workspace/sub-workspace selector
- Phase 9: AI description helper wired end-to-end

### Decisions Made
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Tags | Per-task JSONB array | Simple, flexible, no separate tags table needed |
| AI calls | Backend → Anthropic API | Keeps API key on server, not exposed to frontend |
| Sub-workspace resolution | Fetched on sidebar expand | Lazy loading, avoids loading all data upfront |
| Subtask management | Inline in TaskModal | Consistent UX, no separate page needed |

### Problems Encountered
- None

### Open Questions
- Sub-workspace tags: currently per-task only (as designed)
- Completed task archival: not implemented in v1 (future feature)

### Next Session Goals
- [ ] Run docker-compose up --build and verify all services start
- [ ] End-to-end testing of all CRUD operations
- [ ] Verify data isolation between workspaces
- [ ] UI polish pass
