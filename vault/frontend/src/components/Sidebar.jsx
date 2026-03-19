/**
 * Sidebar component — workspace navigation tree.
 *
 * Displays all workspaces as collapsible sections with their
 * sub-workspaces nested underneath. Clicking a workspace name
 * navigates to its landing page. Provides inline forms for
 * creating new workspaces and sub-workspaces.
 *
 * @component
 * @param {Object} props
 * @param {number} props.refreshKey - Triggers data reload when changed.
 * @param {Function} props.onRefresh - Callback to refresh sidebar data.
 */

import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getWorkspaces, getSubWorkspaces, createWorkspace, createSubWorkspace } from '../api/client'

function Sidebar({ refreshKey, onRefresh }) {
  const [workspaces, setWorkspaces] = useState([])
  const [expanded, setExpanded] = useState({})
  const [subWorkspaces, setSubWorkspaces] = useState({})
  const [showNewWorkspace, setShowNewWorkspace] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [addingSubTo, setAddingSubTo] = useState(null)
  const [newSubName, setNewSubName] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  // Load workspaces on mount and when refreshKey changes
  useEffect(() => {
    loadWorkspaces()
  }, [refreshKey])

  const loadWorkspaces = async () => {
    try {
      const data = await getWorkspaces()
      setWorkspaces(data)

      // Auto-expand all workspaces and load their sub-workspaces
      const expandState = {}
      const subState = {}
      for (const ws of data) {
        expandState[ws.id] = true
        try {
          const subs = await getSubWorkspaces(ws.id)
          subState[ws.id] = subs
        } catch {
          subState[ws.id] = []
        }
      }
      setExpanded(prev => {
        // Only auto-expand on first load, preserve user toggles after
        const hasAny = Object.keys(prev).length > 0
        return hasAny ? prev : expandState
      })
      setSubWorkspaces(prev => ({ ...prev, ...subState }))
    } catch (err) {
      console.error('Failed to load workspaces:', err)
    }
  }

  /** Toggle workspace expansion and load sub-workspaces if needed */
  const toggleExpand = async (wsId) => {
    const isExpanding = !expanded[wsId]
    setExpanded(prev => ({ ...prev, [wsId]: isExpanding }))

    if (isExpanding && !subWorkspaces[wsId]) {
      try {
        const subs = await getSubWorkspaces(wsId)
        setSubWorkspaces(prev => ({ ...prev, [wsId]: subs }))
      } catch (err) {
        console.error('Failed to load sub-workspaces:', err)
      }
    }
  }

  /** Create a new workspace via the inline form */
  const handleCreateWorkspace = async (e) => {
    e.preventDefault()
    if (!newWorkspaceName.trim()) return
    try {
      await createWorkspace({ name: newWorkspaceName.trim(), color: '#6B7280' })
      setNewWorkspaceName('')
      setShowNewWorkspace(false)
      loadWorkspaces()
    } catch (err) {
      console.error('Failed to create workspace:', err)
    }
  }

  /** Create a new sub-workspace via the inline form */
  const handleCreateSubWorkspace = async (e, wsId) => {
    e.preventDefault()
    if (!newSubName.trim()) return
    try {
      const newSub = await createSubWorkspace(wsId, { name: newSubName.trim() })
      setNewSubName('')
      setAddingSubTo(null)
      // Reload sub-workspaces for this workspace
      const subs = await getSubWorkspaces(wsId)
      setSubWorkspaces(prev => ({ ...prev, [wsId]: subs }))
      if (onRefresh) onRefresh()
      // Navigate into the new sub-workspace
      navigate(`/workspace/${newSub.id}`)
    } catch (err) {
      console.error('Failed to create sub-workspace:', err)
    }
  }

  /** Check if a sub-workspace is currently active based on the URL */
  const isActiveSub = (subId) => location.pathname === `/workspace/${subId}`

  /** Check if a workspace landing page is active */
  const isActiveWorkspace = (wsId) => location.pathname === `/workspace-overview/${wsId}`

  return (
    <aside className="w-60 h-screen bg-vault-surface border-r border-vault-border flex flex-col overflow-y-auto shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-vault-border">
        <h1
          className="text-lg font-semibold text-vault-text cursor-pointer"
          onClick={() => navigate('/')}
        >
          Vault
        </h1>
        <p className="text-xs text-vault-muted mt-0.5">Ctrl+K to quick-add</p>
      </div>

      {/* Workspace list */}
      <nav className="flex-1 py-2">
        {workspaces.map(ws => (
          <div key={ws.id}>
            {/* Workspace header row */}
            <div
              className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-vault-border/50 ${
                isActiveWorkspace(ws.id) ? 'bg-vault-border/50' : ''
              }`}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {/* Expand/collapse arrow */}
                <span
                  className="text-xs text-vault-muted cursor-pointer hover:text-vault-text"
                  onClick={(e) => { e.stopPropagation(); toggleExpand(ws.id) }}
                >
                  {expanded[ws.id] ? '▼' : '▶'}
                </span>
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: ws.color || '#6B7280' }}
                />
                {/* Clicking workspace name goes to landing page */}
                <span
                  className="text-sm text-vault-text truncate hover:text-vault-accent"
                  onClick={() => navigate(`/workspace-overview/${ws.id}`)}
                >
                  {ws.name}
                </span>
              </div>
              {/* Always-visible add sub-workspace button */}
              <button
                className="text-vault-muted hover:text-vault-text text-xs px-1 shrink-0"
                onClick={(e) => {
                  e.stopPropagation()
                  if (!expanded[ws.id]) toggleExpand(ws.id)
                  setAddingSubTo(ws.id)
                  setNewSubName('')
                }}
                title="Add sub-workspace"
              >
                +
              </button>
            </div>

            {/* Sub-workspaces */}
            {expanded[ws.id] && (
              <div className="ml-4">
                {(subWorkspaces[ws.id] || []).length === 0 && addingSubTo !== ws.id && (
                  <div
                    className="px-3 py-1.5 text-xs text-vault-muted italic cursor-pointer hover:text-vault-accent"
                    onClick={() => {
                      setAddingSubTo(ws.id)
                      setNewSubName('')
                    }}
                  >
                    + Add a sub-workspace to get started
                  </div>
                )}

                {(subWorkspaces[ws.id] || []).map(sub => (
                  <div
                    key={sub.id}
                    className={`px-3 py-1.5 text-sm cursor-pointer truncate ${
                      isActiveSub(sub.id)
                        ? 'text-vault-text bg-vault-border/50 font-medium'
                        : 'text-vault-muted hover:text-vault-text hover:bg-vault-border/30'
                    }`}
                    onClick={() => navigate(`/workspace/${sub.id}`)}
                  >
                    {sub.name}
                  </div>
                ))}

                {/* Inline form: add sub-workspace */}
                {addingSubTo === ws.id && (
                  <form
                    onSubmit={(e) => handleCreateSubWorkspace(e, ws.id)}
                    className="px-3 py-1"
                  >
                    <input
                      type="text"
                      value={newSubName}
                      onChange={(e) => setNewSubName(e.target.value)}
                      placeholder="Sub-workspace name"
                      className="w-full text-sm px-2 py-1 border border-vault-border rounded bg-white focus:outline-none focus:border-vault-accent"
                      autoFocus
                      onBlur={() => {
                        if (!newSubName.trim()) setAddingSubTo(null)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') setAddingSubTo(null)
                      }}
                    />
                  </form>
                )}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* New Workspace button / form */}
      <div className="p-3 border-t border-vault-border">
        {showNewWorkspace ? (
          <form onSubmit={handleCreateWorkspace}>
            <input
              type="text"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              placeholder="Workspace name"
              className="w-full text-sm px-2 py-1.5 border border-vault-border rounded bg-white focus:outline-none focus:border-vault-accent"
              autoFocus
              onBlur={() => {
                if (!newWorkspaceName.trim()) setShowNewWorkspace(false)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setShowNewWorkspace(false)
              }}
            />
          </form>
        ) : (
          <button
            className="text-sm text-vault-muted hover:text-vault-text w-full text-left"
            onClick={() => setShowNewWorkspace(true)}
          >
            + New Workspace
          </button>
        )}
      </div>
    </aside>
  )
}

export default Sidebar
