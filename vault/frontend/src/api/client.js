/**
 * API client module for all Vault backend calls.
 *
 * Wraps axios with the configured base URL and provides
 * named functions for every API endpoint.
 */

import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// --- Workspaces ---

/** Fetch all workspaces with sub-workspace counts. */
export const getWorkspaces = () => api.get('/workspaces').then(r => r.data)

/** Create a new workspace. */
export const createWorkspace = (data) => api.post('/workspaces', data).then(r => r.data)

/** Update a workspace by ID. */
export const updateWorkspace = (id, data) => api.put(`/workspaces/${id}`, data).then(r => r.data)

/** Delete a workspace by ID (cascades). */
export const deleteWorkspace = (id) => api.delete(`/workspaces/${id}`)

// --- Sub-Workspaces ---

/** Fetch sub-workspaces for a given workspace. */
export const getSubWorkspaces = (workspaceId) =>
  api.get(`/workspaces/${workspaceId}/sub-workspaces`).then(r => r.data)

/** Create a sub-workspace under a workspace. */
export const createSubWorkspace = (workspaceId, data) =>
  api.post(`/workspaces/${workspaceId}/sub-workspaces`, data).then(r => r.data)

/** Update a sub-workspace by ID. */
export const updateSubWorkspace = (id, data) =>
  api.put(`/sub-workspaces/${id}`, data).then(r => r.data)

/** Delete a sub-workspace by ID (cascades). */
export const deleteSubWorkspace = (id) => api.delete(`/sub-workspaces/${id}`)

// --- Tasks ---

/** Fetch tasks for a sub-workspace with optional filters. */
export const getTasks = (subWorkspaceId, params = {}) =>
  api.get(`/sub-workspaces/${subWorkspaceId}/tasks`, { params }).then(r => r.data)

/** Create a task in a sub-workspace. */
export const createTask = (subWorkspaceId, data) =>
  api.post(`/sub-workspaces/${subWorkspaceId}/tasks`, data).then(r => r.data)

/** Update a task by ID. */
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data).then(r => r.data)

/** Delete a task by ID. */
export const deleteTask = (id) => api.delete(`/tasks/${id}`)

/** Fetch all urgent tasks across workspaces. */
export const getUrgentTasks = () => api.get('/tasks/urgent').then(r => r.data)

/** Fetch tasks due today across workspaces. */
export const getTodayTasks = () => api.get('/tasks/today').then(r => r.data)

/** Fetch tasks due this week across workspaces. */
export const getThisWeekTasks = () => api.get('/tasks/this-week').then(r => r.data)

// --- Subtasks ---

/** Create a subtask under a task. */
export const createSubtask = (taskId, data) =>
  api.post(`/tasks/${taskId}/subtasks`, data).then(r => r.data)

/** Update a subtask by ID. */
export const updateSubtask = (id, data) => api.put(`/subtasks/${id}`, data).then(r => r.data)

/** Delete a subtask by ID. */
export const deleteSubtask = (id) => api.delete(`/subtasks/${id}`)

// --- Dashboard ---

/** Fetch dashboard summary with counts per workspace. */
export const getDashboardSummary = () => api.get('/dashboard/summary').then(r => r.data)

// --- AI Helper ---

/** Generate an AI task description from title and workspace name. */
export const describeTask = (title, workspaceName) =>
  api.post('/ai/describe-task', { title, workspace_name: workspaceName }).then(r => r.data)

export default api
