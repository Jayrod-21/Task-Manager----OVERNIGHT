/**
 * TaskList — table view of tasks within a sub-workspace.
 *
 * Renders a table with columns for title, priority, status,
 * due date, tags, urgent flag, and subtask count. Each row
 * is clickable to open the edit modal.
 *
 * @component
 * @param {Object} props
 * @param {Array} props.tasks - Array of task objects to display.
 * @param {Function} props.onTaskClick - Callback when a task row is clicked.
 */

import TaskRow from './TaskRow'

function TaskList({ tasks, onTaskClick }) {
  if (tasks.length === 0) {
    return (
      <div className="bg-vault-surface border border-vault-border rounded-lg p-8 text-center text-vault-muted text-sm">
        No tasks yet. Click "+ Add Task" to create one.
      </div>
    )
  }

  return (
    <div className="bg-vault-surface border border-vault-border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-vault-border text-left text-vault-muted">
            <th className="px-4 py-2 font-medium">Title</th>
            <th className="px-4 py-2 font-medium w-24">Priority</th>
            <th className="px-4 py-2 font-medium w-28">Status</th>
            <th className="px-4 py-2 font-medium w-28">Due Date</th>
            <th className="px-4 py-2 font-medium w-32">Tags</th>
            <th className="px-4 py-2 font-medium w-20">Urgent</th>
            <th className="px-4 py-2 font-medium w-24">Subtasks</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <TaskRow key={task.id} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TaskList
