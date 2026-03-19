/**
 * Vault color palette constants.
 *
 * These match the Tailwind config custom colors and can be
 * used in inline styles or dynamic class generation.
 */

export const COLORS = {
  BG: '#FAFAF8',
  SURFACE: '#F5F4F0',
  BORDER: '#E8E6E1',
  TEXT: '#2D2C2A',
  MUTED: '#9CA3AF',
  ACCENT: '#6B7280',
  URGENT: '#DC2626',
  SUCCESS: '#16A34A',
}

/** Priority level display configuration */
export const PRIORITY_COLORS = {
  low: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Low' },
  medium: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Medium' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'High' },
}

/** Task status display configuration */
export const STATUS_COLORS = {
  not_started: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Not Started' },
  in_progress: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'In Progress' },
  done: { bg: 'bg-green-100', text: 'text-green-700', label: 'Done' },
  blocked: { bg: 'bg-red-100', text: 'text-red-700', label: 'Blocked' },
}

/** Enum values for dropdowns */
export const PRIORITY_OPTIONS = ['low', 'medium', 'high']
export const STATUS_OPTIONS = ['not_started', 'in_progress', 'done', 'blocked']
