/**
 * UrgentBadge — reusable urgent flag indicator.
 *
 * Displays a small red "URGENT" badge when the task is marked urgent.
 * Returns null if the task is not urgent.
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.isUrgent - Whether to show the badge.
 */

function UrgentBadge({ isUrgent }) {
  if (!isUrgent) return null

  return (
    <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded bg-red-100 text-vault-urgent">
      URGENT
    </span>
  )
}

export default UrgentBadge
