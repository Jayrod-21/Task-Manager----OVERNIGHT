/**
 * Root application component.
 *
 * Sets up routing between the Home (dashboard) and Workspace pages,
 * renders the persistent Sidebar, and manages the QuickAdd overlay.
 *
 * @component
 */

import { useState, useEffect, useCallback } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import QuickAdd from './components/QuickAdd'
import Home from './pages/Home'
import Workspace from './pages/Workspace'

function App() {
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0)

  /** Trigger a sidebar data refresh after mutations */
  const refreshSidebar = useCallback(() => {
    setSidebarRefreshKey(k => k + 1)
  }, [])

  // Global keyboard listener for Ctrl/Cmd+K to open QuickAdd
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setQuickAddOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="flex h-screen bg-vault-bg">
      <Sidebar refreshKey={sidebarRefreshKey} onRefresh={refreshSidebar} />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/workspace/:subWorkspaceId"
            element={<Workspace onRefresh={refreshSidebar} />}
          />
        </Routes>
      </main>
      {quickAddOpen && (
        <QuickAdd
          onClose={() => setQuickAddOpen(false)}
          onSave={() => {
            setQuickAddOpen(false)
            refreshSidebar()
          }}
        />
      )}
    </div>
  )
}

export default App
