/**
 * Dashboard component — unified personal view across all workspaces.
 *
 * Displays stat cards (total tasks, urgent, due today, due this week)
 * and lists of urgent, today, and this-week tasks. Clicking a task
 * opens the TaskModal for editing.
 *
 * @component
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboardSummary, getUrgentTasks, getTodayTasks, getThisWeekTasks, getWorkspaces } from '../api/client'
import UrgentBadge from './UrgentBadge'
import TaskModal from './TaskModal'
import { STATUS_COLORS, PRIORITY_COLORS } from '../constants/colors'

function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [urgentTasks, setUrgentTasks] = useState([])
  const [todayTasks, setTodayTasks] = useState([])
  const [weekTasks, setWeekTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [workspaces, setWorkspaces] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const [summaryData, urgent, today, week] = await Promise.all([
        getDashboardSummary(),
        getUrgentTasks(),
        getTodayTasks(),
        getThisWeekTasks(),
      ])
      setSummary(summaryData)
      setUrgentTasks(urgent)
      setTodayTasks(today)
      setWeekTasks(week)
      // Load workspaces for the getting-started section
      const ws = await getWorkspaces()
      setWorkspaces(ws)
    } catch (err) {
      console.error('Failed to load dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  /** Render a task row used in the urgent/today/week sections */
  const renderTaskRow = (task) => {
    const statusInfo = STATUS_COLORS[task.status] || STATUS_COLORS.not_started
    return (
      <div
        key={task.id}
        className="flex items-center gap-3 px-4 py-3 hover:bg-vault-border/30 cursor-pointer border-b border-vault-border last:border-b-0"
        onClick={() => setSelectedTask(task)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-vault-text truncate">{task.title}</span>
            <UrgentBadge isUrgent={task.is_urgent} />
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {task.workspace_name && (
              <span className="text-xs text-vault-muted">{task.workspace_name}</span>
            )}
            {task.sub_workspace_name && (
              <span className="text-xs text-vault-muted">/ {task.sub_workspace_name}</span>
            )}
          </div>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded ${statusInfo.bg} ${statusInfo.text}`}>
          {statusInfo.label}
        </span>
        {task.due_date && (
          <span className="text-xs text-vault-muted whitespace-nowrap">{task.due_date}</span>
        )}
      </div>
    )
  }

  if (loading) {
    return <div className="p-8 text-vault-muted">Loading dashboard...</div>
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold text-vault-text mb-6">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Tasks" value={summary?.total_tasks || 0} />
        <StatCard label="Urgent" value={summary?.total_urgent || 0} urgent />
        <StatCard label="Due Today" value={summary?.total_today || 0} />
        <StatCard label="Due This Week" value={summary?.total_this_week || 0} />
      </div>

      {/* Getting started guidance when no tasks exist */}
      {summary?.total_tasks === 0 && (
        <div className="bg-vault-surface border border-vault-border rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-vault-text mb-2">Getting Started</h2>
          <p className="text-sm text-vault-muted mb-4">
            Welcome to Vault! To start managing tasks:
          </p>
          <ol className="text-sm text-vault-muted space-y-2 mb-4 list-decimal list-inside">
            <li>Click a <strong className="text-vault-text">workspace name</strong> in the sidebar to open it</li>
            <li>Create a <strong className="text-vault-text">sub-workspace</strong> (e.g. "Project Alpha" inside "Stats Lab")</li>
            <li>Click into the sub-workspace and use <strong className="text-vault-text">+ Add Task</strong> to create tasks</li>
            <li>Or press <strong className="text-vault-text">Ctrl+K</strong> to quick-add a task from anywhere</li>
          </ol>
          <div className="flex flex-wrap gap-2">
            {workspaces.slice(0, 4).map(ws => (
              <button
                key={ws.id}
                className="px-3 py-1.5 text-sm bg-vault-border text-vault-text rounded hover:bg-vault-accent hover:text-white"
                onClick={() => navigate(`/workspace-overview/${ws.id}`)}
              >
                {ws.name}
              </button>
            ))}
            {workspaces.length > 4 && (
              <span className="px-3 py-1.5 text-sm text-vault-muted">+{workspaces.length - 4} more in sidebar</span>
            )}
          </div>
        </div>
      )}

      {/* Urgent Tasks */}
      <Section title="Urgent Tasks" count={urgentTasks.length}>
        {urgentTasks.length === 0 ? (
          <p className="px-4 py-3 text-sm text-vault-muted">No urgent tasks</p>
        ) : (
          urgentTasks.map(renderTaskRow)
        )}
      </Section>

      {/* Due Today */}
      <Section title="Due Today" count={todayTasks.length}>
        {todayTasks.length === 0 ? (
          <p className="px-4 py-3 text-sm text-vault-muted">No tasks due today</p>
        ) : (
          todayTasks.map(renderTaskRow)
        )}
      </Section>

      {/* Due This Week */}
      <Section title="Due This Week" count={weekTasks.length}>
        {weekTasks.length === 0 ? (
          <p className="px-4 py-3 text-sm text-vault-muted">No tasks due this week</p>
        ) : (
          weekTasks.map(renderTaskRow)
        )}
      </Section>

      {/* Task Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          subWorkspaceId={selectedTask.sub_workspace_id}
          onClose={() => setSelectedTask(null)}
          onSave={() => {
            setSelectedTask(null)
            loadDashboard()
          }}
          onDelete={() => {
            setSelectedTask(null)
            loadDashboard()
          }}
        />
      )}
    </div>
  )
}

/**
 * StatCard — displays a single dashboard metric.
 *
 * @param {Object} props
 * @param {string} props.label - Metric label.
 * @param {number} props.value - Metric value.
 * @param {boolean} [props.urgent] - If true, uses urgent color for the value.
 */
function StatCard({ label, value, urgent }) {
  return (
    <div className="bg-vault-surface border border-vault-border rounded-lg p-4">
      <p className="text-sm text-vault-muted">{label}</p>
      <p className={`text-2xl font-semibold mt-1 ${urgent && value > 0 ? 'text-vault-urgent' : 'text-vault-text'}`}>
        {value}
      </p>
    </div>
  )
}

/**
 * Section — collapsible dashboard section with title and item count.
 *
 * @param {Object} props
 * @param {string} props.title - Section heading.
 * @param {number} props.count - Number of items.
 * @param {React.ReactNode} props.children - Section content.
 */
function Section({ title, count, children }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium text-vault-text mb-2">
        {title}
        <span className="text-sm text-vault-muted ml-2">({count})</span>
      </h2>
      <div className="bg-vault-surface border border-vault-border rounded-lg overflow-hidden">
        {children}
      </div>
    </div>
  )
}

export default Dashboard
