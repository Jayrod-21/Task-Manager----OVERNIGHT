/**
 * QuickAdd — full-screen overlay for rapid task creation.
 *
 * Activated with Ctrl/Cmd+K. Provides a centered input field with
 * workspace/sub-workspace selector. Press Enter to save, Escape to close.
 * Creates tasks with default priority (medium) and status (not_started).
 *
 * @component
 * @param {Object} props
 * @param {Function} props.onClose - Callback to close the overlay.
 * @param {Function} props.onSave - Callback after successful save.
 */

import { useState, useEffect } from 'react'
import { getWorkspaces, getSubWorkspaces, createTask } from '../api/client'

function QuickAdd({ onClose, onSave }) {
  const [title, setTitle] = useState('')
  const [workspaces, setWorkspaces] = useState([])
  const [subWorkspaces, setSubWorkspaces] = useState([])
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState('')
  const [selectedSubWorkspaceId, setSelectedSubWorkspaceId] = useState('')
  const [saving, setSaving] = useState(false)

  // Load workspaces on mount
  useEffect(() => {
    loadWorkspaces()
  }, [])

  // Load sub-workspaces when workspace selection changes
  useEffect(() => {
    if (selectedWorkspaceId) {
      loadSubWorkspaces(selectedWorkspaceId)
    } else {
      setSubWorkspaces([])
      setSelectedSubWorkspaceId('')
    }
  }, [selectedWorkspaceId])

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const loadWorkspaces = async () => {
    try {
      const data = await getWorkspaces()
      setWorkspaces(data)
      if (data.length > 0) {
        setSelectedWorkspaceId(data[0].id)
      }
    } catch (err) {
      console.error('Failed to load workspaces:', err)
    }
  }

  const loadSubWorkspaces = async (wsId) => {
    try {
      const data = await getSubWorkspaces(wsId)
      setSubWorkspaces(data)
      if (data.length > 0) {
        setSelectedSubWorkspaceId(data[0].id)
      } else {
        setSelectedSubWorkspaceId('')
      }
    } catch (err) {
      console.error('Failed to load sub-workspaces:', err)
    }
  }

  /** Save the quick-add task with default values */
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !selectedSubWorkspaceId) return

    setSaving(true)
    try {
      await createTask(selectedSubWorkspaceId, {
        title: title.trim(),
        priority: 'medium',
        status: 'not_started',
        tags: [],
        is_urgent: false,
      })
      onSave()
    } catch (err) {
      console.error('Failed to quick-add task:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-32">
      <div className="bg-white rounded-lg shadow-sm border border-vault-border w-full max-w-lg p-6">
        <form onSubmit={handleSubmit}>
          {/* Task title input */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a task... (e.g. 'Send invoice to client by Friday')"
            className="w-full text-lg px-0 py-2 border-0 border-b border-vault-border focus:outline-none focus:border-vault-accent text-vault-text placeholder-vault-muted"
            autoFocus
          />

          {/* Workspace / Sub-workspace selectors */}
          <div className="flex gap-3 mt-4">
            <select
              value={selectedWorkspaceId}
              onChange={(e) => setSelectedWorkspaceId(e.target.value)}
              className="flex-1 px-3 py-2 border border-vault-border rounded text-sm focus:outline-none focus:border-vault-accent"
            >
              <option value="">Select workspace</option>
              {workspaces.map(ws => (
                <option key={ws.id} value={ws.id}>{ws.name}</option>
              ))}
            </select>
            <select
              value={selectedSubWorkspaceId}
              onChange={(e) => setSelectedSubWorkspaceId(e.target.value)}
              className="flex-1 px-3 py-2 border border-vault-border rounded text-sm focus:outline-none focus:border-vault-accent"
              disabled={subWorkspaces.length === 0}
            >
              {subWorkspaces.length === 0 ? (
                <option value="">No sub-workspaces</option>
              ) : (
                subWorkspaces.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))
              )}
            </select>
          </div>

          {/* Hints */}
          <div className="flex items-center justify-between mt-4 text-xs text-vault-muted">
            <span>Press Enter to save, Escape to close</span>
            <button
              type="submit"
              disabled={saving || !title.trim() || !selectedSubWorkspaceId}
              className="px-3 py-1.5 bg-vault-accent text-white rounded text-sm hover:bg-vault-text disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default QuickAdd
