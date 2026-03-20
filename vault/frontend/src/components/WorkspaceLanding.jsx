/**
 * WorkspaceLanding — overview page for a workspace.
 *
 * Shows all sub-workspaces within a workspace with their task counts,
 * and provides easy creation of new sub-workspaces. This is the page
 * users see when they click a workspace name in the sidebar.
 *
 * @component
 * @param {Object} props
 * @param {string} props.workspaceId - UUID of the workspace.
 * @param {Function} props.onRefresh - Callback to refresh sidebar data.
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getWorkspaces, getSubWorkspaces, createSubWorkspace, getTasks } from '../api/client'
import TaskModal from './TaskModal'

function WorkspaceLanding({ workspaceId, onRefresh }) {
  const [workspace, setWorkspace] = useState(null)
  const [subWorkspaces, setSubWorkspaces] = useState([])
  const [subTaskCounts, setSubTaskCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [newSubName, setNewSubName] = useState('')
  const [showNewSub, setShowNewSub] = useState(false)
  const [creating, setCreating] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [workspaceId])

  const loadData = async () => {
    setLoading(true)
    try {
      const allWorkspaces = await getWorkspaces()
      const ws = allWorkspaces.find(w => w.id === workspaceId)
      setWorkspace(ws)

      const subs = await getSubWorkspaces(workspaceId)
      setSubWorkspaces(subs)

      // Load task counts for each sub-workspace
      const counts = {}
      for (const sub of subs) {
        try {
          const tasks = await getTasks(sub.id)
          counts[sub.id] = {
            total: tasks.length,
            urgent: tasks.filter(t => t.is_urgent).length,
            done: tasks.filter(t => t.status === 'done').length,
          }
        } catch {
          counts[sub.id] = { total: 0, urgent: 0, done: 0 }
        }
      }
      setSubTaskCounts(counts)
    } catch (err) {
      console.error('Failed to load workspace:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSub = async (e) => {
    e.preventDefault()
    if (!newSubName.trim()) return
    setCreating(true)
    try {
      const newSub = await createSubWorkspace(workspaceId, { name: newSubName.trim() })
      setNewSubName('')
      setShowNewSub(false)
      await loadData()
      if (onRefresh) onRefresh()
      // Navigate directly into the new sub-workspace
      navigate(`/workspace/${newSub.id}`)
    } catch (err) {
      console.error('Failed to create sub-workspace:', err)
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-vault-muted">Loading...</div>
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Workspace header */}
      <div className="flex items-center gap-3 mb-2">
        <span
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: workspace?.color || '#6B7280' }}
        />
        <h1 className="text-2xl font-semibold text-vault-text">{workspace?.name}</h1>
      </div>
      {workspace?.description && (
        <p className="text-sm text-vault-muted mb-6 ml-6">{workspace.description}</p>
      )}

      {/* Sub-workspaces grid */}
      {subWorkspaces.length === 0 && !showNewSub ? (
        <div className="bg-vault-surface border border-vault-border rounded-lg p-8 text-center">
          <p className="text-vault-muted mb-1">No sub-workspaces yet</p>
          <p className="text-sm text-vault-muted mb-4">
            Create a sub-workspace to start organizing tasks in "{workspace?.name}".
          </p>
          <button
            className="px-4 py-2 text-sm bg-vault-accent text-white rounded hover:bg-vault-text"
            onClick={() => setShowNewSub(true)}
          >
            + Create Sub-workspace
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {subWorkspaces.map(sub => {
              const counts = subTaskCounts[sub.id] || { total: 0, urgent: 0, done: 0 }
              return (
                <div
                  key={sub.id}
                  className="bg-vault-surface border border-vault-border rounded-lg p-4 cursor-pointer hover:border-vault-accent group"
                  onClick={() => navigate(`/workspace/${sub.id}`)}
                >
                  <h3 className="text-sm font-medium text-vault-text group-hover:text-vault-accent mb-2">
                    {sub.name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-vault-muted">
                    <span>{counts.total} task{counts.total !== 1 ? 's' : ''}</span>
                    {counts.urgent > 0 && (
                      <span className="text-vault-urgent">{counts.urgent} urgent</span>
                    )}
                    {counts.done > 0 && (
                      <span className="text-vault-success">{counts.done} done</span>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Add sub-workspace card */}
            {!showNewSub && (
              <div
                className="border border-dashed border-vault-border rounded-lg p-4 cursor-pointer hover:border-vault-accent flex items-center justify-center"
                onClick={() => setShowNewSub(true)}
              >
                <span className="text-sm text-vault-muted hover:text-vault-accent">+ New Sub-workspace</span>
              </div>
            )}
          </div>

          {/* Inline create form */}
          {showNewSub && (
            <form onSubmit={handleCreateSub} className="flex items-center gap-2 mb-6">
              <input
                type="text"
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                placeholder="Sub-workspace name"
                className="flex-1 px-3 py-2 border border-vault-border rounded text-sm focus:outline-none focus:border-vault-accent"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setShowNewSub(false)
                }}
              />
              <button
                type="submit"
                disabled={creating || !newSubName.trim()}
                className="px-4 py-2 text-sm bg-vault-accent text-white rounded hover:bg-vault-text disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm bg-vault-border text-vault-text rounded hover:bg-vault-muted"
                onClick={() => { setShowNewSub(false); setNewSubName('') }}
              >
                Cancel
              </button>
            </form>
          )}
        </>
      )}
    </div>
  )
}

export default WorkspaceLanding
