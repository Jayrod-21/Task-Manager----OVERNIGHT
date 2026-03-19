/**
 * TaskModal — slide-in panel for creating and editing tasks.
 *
 * Slides in from the right side of the screen. Supports all task fields:
 * title, description (with AI helper), priority, status, due date, tags,
 * notes, urgent toggle, and inline subtask management.
 *
 * @component
 * @param {Object} props
 * @param {Object|null} props.task - Existing task for edit mode, or null for create mode.
 * @param {string} props.subWorkspaceId - UUID of the sub-workspace to create tasks in.
 * @param {Function} props.onClose - Callback to close the modal.
 * @param {Function} props.onSave - Callback after successful save.
 * @param {Function} props.onDelete - Callback after successful delete.
 */

import { useState, useEffect } from 'react'
import {
  createTask,
  updateTask,
  deleteTask,
  createSubtask,
  updateSubtask,
  deleteSubtask,
  describeTask,
} from '../api/client'
import { PRIORITY_OPTIONS, STATUS_OPTIONS, PRIORITY_COLORS, STATUS_COLORS } from '../constants/colors'

function TaskModal({ task, subWorkspaceId, onClose, onSave, onDelete }) {
  const isEditing = !!task

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [status, setStatus] = useState('not_started')
  const [dueDate, setDueDate] = useState('')
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [notes, setNotes] = useState('')
  const [isUrgent, setIsUrgent] = useState(false)
  const [subtasks, setSubtasks] = useState([])
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [saving, setSaving] = useState(false)

  // AI helper state
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  // Populate form fields when editing an existing task
  useEffect(() => {
    if (task) {
      setTitle(task.title || '')
      setDescription(task.description || '')
      setPriority(task.priority || 'medium')
      setStatus(task.status || 'not_started')
      setDueDate(task.due_date || '')
      setTags(task.tags || [])
      setNotes(task.notes || '')
      setIsUrgent(task.is_urgent || false)
      setSubtasks(task.subtasks || [])
    }
  }, [task])

  /** Save handler — creates or updates the task via the API */
  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)

    const data = {
      title: title.trim(),
      description: description.trim() || null,
      priority,
      status,
      due_date: dueDate || null,
      tags,
      is_urgent: isUrgent,
      notes: notes.trim() || null,
    }

    try {
      if (isEditing) {
        await updateTask(task.id, data)
      } else {
        await createTask(subWorkspaceId, data)
      }
      onSave()
    } catch (err) {
      console.error('Failed to save task:', err)
    } finally {
      setSaving(false)
    }
  }

  /** Delete handler — removes the task after confirmation */
  const handleDelete = async () => {
    try {
      await deleteTask(task.id)
      onDelete()
    } catch (err) {
      console.error('Failed to delete task:', err)
    }
  }

  /** Add a tag from the tag input field */
  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()])
      }
      setTagInput('')
    }
  }

  /** Remove a tag by index */
  const handleRemoveTag = (index) => {
    setTags(tags.filter((_, i) => i !== index))
  }

  /** Add a new subtask to the task */
  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return
    if (isEditing && task?.id) {
      try {
        const newSub = await createSubtask(task.id, { title: newSubtaskTitle.trim() })
        setSubtasks([...subtasks, newSub])
        setNewSubtaskTitle('')
      } catch (err) {
        console.error('Failed to add subtask:', err)
      }
    } else {
      // For new tasks, just add to local state (subtasks created after task is saved)
      setSubtasks([...subtasks, { id: Date.now(), title: newSubtaskTitle.trim(), is_complete: false }])
      setNewSubtaskTitle('')
    }
  }

  /** Toggle subtask completion status */
  const handleToggleSubtask = async (subtask) => {
    if (isEditing && subtask.task_id) {
      try {
        const updated = await updateSubtask(subtask.id, { is_complete: !subtask.is_complete })
        setSubtasks(subtasks.map(s => s.id === subtask.id ? updated : s))
      } catch (err) {
        console.error('Failed to toggle subtask:', err)
      }
    } else {
      setSubtasks(subtasks.map(s =>
        s.id === subtask.id ? { ...s, is_complete: !s.is_complete } : s
      ))
    }
  }

  /** Delete a subtask */
  const handleDeleteSubtask = async (subtask) => {
    if (isEditing && subtask.task_id) {
      try {
        await deleteSubtask(subtask.id)
        setSubtasks(subtasks.filter(s => s.id !== subtask.id))
      } catch (err) {
        console.error('Failed to delete subtask:', err)
      }
    } else {
      setSubtasks(subtasks.filter(s => s.id !== subtask.id))
    }
  }

  /** Call the AI helper to generate a task description */
  const handleAiDescribe = async () => {
    if (!title.trim()) return
    setAiLoading(true)
    setAiError('')
    setAiSuggestion('')

    try {
      const result = await describeTask(title, task?.workspace_name || 'General')
      setAiSuggestion(result.description)
    } catch (err) {
      setAiError(err.response?.data?.detail || 'Failed to generate description')
    } finally {
      setAiLoading(false)
    }
  }

  /** Accept the AI suggestion into the description field */
  const handleAcceptAi = () => {
    setDescription(aiSuggestion)
    setAiSuggestion('')
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* Slide-in panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white border-l border-vault-border z-50 overflow-y-auto shadow-sm">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-vault-text">
              {isEditing ? 'Edit Task' : 'New Task'}
            </h2>
            <button
              className="text-vault-muted hover:text-vault-text text-lg"
              onClick={onClose}
            >
              ✕
            </button>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-vault-text mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-vault-border rounded text-sm focus:outline-none focus:border-vault-accent"
              placeholder="Task title"
              autoFocus
            />
          </div>

          {/* Description + AI helper */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-vault-text">Description</label>
              <button
                className="text-xs text-vault-accent hover:text-vault-text disabled:opacity-50"
                onClick={handleAiDescribe}
                disabled={aiLoading || !title.trim()}
              >
                {aiLoading ? 'Generating...' : 'Help me write this'}
              </button>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-vault-border rounded text-sm focus:outline-none focus:border-vault-accent resize-none"
              rows={3}
              placeholder="Task description"
            />

            {/* AI suggestion box */}
            {aiSuggestion && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                <p className="text-vault-text mb-2">{aiSuggestion}</p>
                <div className="flex gap-2">
                  <button
                    className="px-2 py-1 text-xs bg-vault-accent text-white rounded hover:bg-vault-text"
                    onClick={handleAcceptAi}
                  >
                    Accept
                  </button>
                  <button
                    className="px-2 py-1 text-xs bg-vault-border text-vault-text rounded hover:bg-vault-muted"
                    onClick={() => setAiSuggestion('')}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* AI error */}
            {aiError && (
              <p className="mt-1 text-xs text-vault-urgent">{aiError}</p>
            )}
          </div>

          {/* Priority & Status row */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-vault-text mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-vault-border rounded text-sm focus:outline-none focus:border-vault-accent"
              >
                {PRIORITY_OPTIONS.map(p => (
                  <option key={p} value={p}>{PRIORITY_COLORS[p].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-vault-text mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-vault-border rounded text-sm focus:outline-none focus:border-vault-accent"
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{STATUS_COLORS[s].label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-vault-text mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-vault-border rounded text-sm focus:outline-none focus:border-vault-accent"
            />
          </div>

          {/* Tags */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-vault-text mb-1">Tags</label>
            <div className="flex flex-wrap gap-1 mb-1">
              {tags.map((tag, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-vault-border rounded text-xs text-vault-text">
                  {tag}
                  <button
                    className="text-vault-muted hover:text-vault-urgent text-xs"
                    onClick={() => handleRemoveTag(i)}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="w-full px-3 py-2 border border-vault-border rounded text-sm focus:outline-none focus:border-vault-accent"
              placeholder="Type a tag and press Enter"
            />
          </div>

          {/* Urgent toggle */}
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="rounded border-vault-border"
              />
              <span className="text-sm text-vault-text">Mark as urgent</span>
            </label>
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-vault-text mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-vault-border rounded text-sm focus:outline-none focus:border-vault-accent resize-none"
              rows={3}
              placeholder="Additional notes"
            />
          </div>

          {/* Subtasks */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-vault-text mb-2">Subtasks</label>
            <div className="space-y-1 mb-2">
              {subtasks.map(st => (
                <div key={st.id} className="flex items-center gap-2 group">
                  <input
                    type="checkbox"
                    checked={st.is_complete}
                    onChange={() => handleToggleSubtask(st)}
                    className="rounded border-vault-border"
                  />
                  <span className={`text-sm flex-1 ${st.is_complete ? 'line-through text-vault-muted' : 'text-vault-text'}`}>
                    {st.title}
                  </span>
                  <button
                    className="text-vault-muted hover:text-vault-urgent text-xs opacity-0 group-hover:opacity-100"
                    onClick={() => handleDeleteSubtask(st)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddSubtask()
                  }
                }}
                className="flex-1 px-3 py-1.5 border border-vault-border rounded text-sm focus:outline-none focus:border-vault-accent"
                placeholder="Add a subtask"
              />
              <button
                className="px-3 py-1.5 text-sm bg-vault-surface border border-vault-border rounded text-vault-text hover:bg-vault-border"
                onClick={handleAddSubtask}
              >
                Add
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-vault-border">
            {/* Delete button (edit mode only) */}
            {isEditing ? (
              <div>
                {showDeleteConfirm ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-vault-urgent">Delete this task?</span>
                    <button
                      className="px-2 py-1 text-xs bg-vault-urgent text-white rounded"
                      onClick={handleDelete}
                    >
                      Yes, delete
                    </button>
                    <button
                      className="px-2 py-1 text-xs bg-vault-border text-vault-text rounded"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    className="text-sm text-vault-urgent hover:underline"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Delete
                  </button>
                )}
              </div>
            ) : (
              <div />
            )}

            {/* Save / Cancel */}
            <div className="flex gap-2">
              <button
                className="px-4 py-2 text-sm bg-vault-border text-vault-text rounded hover:bg-vault-muted"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm bg-vault-accent text-white rounded hover:bg-vault-text disabled:opacity-50"
                onClick={handleSave}
                disabled={saving || !title.trim()}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default TaskModal
