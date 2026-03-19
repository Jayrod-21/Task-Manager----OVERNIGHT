/**
 * TaskRow — single row in the task list table.
 *
 * Displays task title, priority badge, status badge, due date,
 * tags, urgent indicator, and subtask progress count.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.task - Task object with all fields.
 * @param {Function} props.onClick - Callback when the row is clicked.
 */

import { PRIORITY_COLORS, STATUS_COLORS } from '../constants/colors'
import UrgentBadge from './UrgentBadge'

function TaskRow({ task, onClick }) {
  const priorityInfo = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium
  const statusInfo = STATUS_COLORS[task.status] || STATUS_COLORS.not_started

  return (
    <tr
      className="border-b border-vault-border last:border-b-0 hover:bg-vault-border/30 cursor-pointer"
      onClick={onClick}
    >
      <td className="px-4 py-2.5">
        <span className="text-vault-text font-medium">{task.title}</span>
      </td>
      <td className="px-4 py-2.5">
        <span className={`text-xs px-2 py-0.5 rounded ${priorityInfo.bg} ${priorityInfo.text}`}>
          {priorityInfo.label}
        </span>
      </td>
      <td className="px-4 py-2.5">
        <span className={`text-xs px-2 py-0.5 rounded ${statusInfo.bg} ${statusInfo.text}`}>
          {statusInfo.label}
        </span>
      </td>
      <td className="px-4 py-2.5 text-vault-muted text-xs">
        {task.due_date || '—'}
      </td>
      <td className="px-4 py-2.5">
        <div className="flex gap-1 flex-wrap">
          {(task.tags || []).slice(0, 3).map((tag, i) => (
            <span key={i} className="text-xs px-1.5 py-0.5 bg-vault-border rounded text-vault-muted">
              {tag}
            </span>
          ))}
          {(task.tags || []).length > 3 && (
            <span className="text-xs text-vault-muted">+{task.tags.length - 3}</span>
          )}
        </div>
      </td>
      <td className="px-4 py-2.5">
        <UrgentBadge isUrgent={task.is_urgent} />
      </td>
      <td className="px-4 py-2.5 text-xs text-vault-muted">
        {task.subtask_count > 0
          ? `${task.subtask_complete_count}/${task.subtask_count}`
          : '—'}
      </td>
    </tr>
  )
}

export default TaskRow
