/**
 * WorkspaceView — container for viewing tasks within a sub-workspace.
 *
 * Displays a breadcrumb header (workspace > sub-workspace), an "+ Add Task"
 * button, and the TaskList table. Handles opening TaskModal for create/edit.
 *
 * @component
 * @param {Object} props
 * @param {string} props.subWorkspaceId - UUID of the active sub-workspace.
 * @param {Function} props.onRefresh - Callback to refresh parent data.
 */

import { useState, useEffect } from 'react'
import { getTasks, getSubWorkspaces, getWorkspaces } from '../api/client'
import TaskList from './TaskList'
import TaskModal from './TaskModal'

function WorkspaceView({ subWorkspaceId, onRefresh }) {
  const [tasks, setTasks] = useState([])
  const [workspaceName, setWorkspaceName] = useState('')
  const [subWorkspaceName, setSubWorkspaceName] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [subWorkspaceId])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load tasks for this sub-workspace
      const taskData = await getTasks(subWorkspaceId)
      setTasks(taskData)

      // Resolve workspace and sub-workspace names for the breadcrumb
      const allWorkspaces = await getWorkspaces()
      for (const ws of allWorkspaces) {
        const subs = await getSubWorkspaces(ws.id)
        const found = subs.find(s => s.id === subWorkspaceId)
        if (found) {
          setWorkspaceName(ws.name)
          setSubWorkspaceName(found.name)
          break
        }
      }
    } catch (err) {
      console.error('Failed to load workspace data:', err)
    } finally {
      setLoading(false)
    }
  }

  /** Open the TaskModal in create mode */
  const handleAddTask = () => {
    setEditingTask(null)
    setModalOpen(true)
  }

  /** Open the TaskModal in edit mode for a specific task */
  const handleEditTask = (task) => {
    setEditingTask(task)
    setModalOpen(true)
  }

  /** After saving or deleting, reload task list */
  const handleModalSave = () => {
    setModalOpen(false)
    setEditingTask(null)
    loadData()
    if (onRefresh) onRefresh()
  }

  if (loading) {
    return <div className="p-8 text-vault-muted">Loading...</div>
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm text-vault-muted">{workspaceName}</span>
        <span className="text-sm text-vault-muted">/</span>
        <span className="text-sm font-medium text-vault-text">{subWorkspaceName}</span>
      </div>

      {/* Header with add button */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-vault-text">{subWorkspaceName}</h1>
        <button
          className="px-3 py-1.5 text-sm bg-vault-accent text-white rounded hover:bg-vault-text transition-colors"
          onClick={handleAddTask}
        >
          + Add Task
        </button>
      </div>

      {/* Task list table */}
      <TaskList tasks={tasks} onTaskClick={handleEditTask} />

      {/* Task Modal */}
      {modalOpen && (
        <TaskModal
          task={editingTask}
          subWorkspaceId={subWorkspaceId}
          onClose={() => {
            setModalOpen(false)
            setEditingTask(null)
          }}
          onSave={handleModalSave}
          onDelete={handleModalSave}
        />
      )}
    </div>
  )
}

export default WorkspaceView
