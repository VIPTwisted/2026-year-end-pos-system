'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquarePlus, RefreshCw } from 'lucide-react'

interface CaseActionsProps {
  caseId: string
  currentStatus: string
}

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

const STATUS_VARIANT: Record<string, 'warning' | 'default' | 'success' | 'secondary'> = {
  open: 'warning',
  in_progress: 'default',
  resolved: 'success',
  closed: 'secondary',
}

export function CaseActions({ caseId, currentStatus }: CaseActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedStatus, setSelectedStatus] = useState(currentStatus)

  // Note form state
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [noteContent, setNoteContent] = useState('')
  const [noteAuthor, setNoteAuthor] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [noteLoading, setNoteLoading] = useState(false)
  const [noteError, setNoteError] = useState('')

  async function handleStatusUpdate() {
    if (selectedStatus === currentStatus) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/service/cases/${caseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selectedStatus }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to update status.')
      } else {
        router.refresh()
      }
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault()
    if (!noteContent.trim()) {
      setNoteError('Note content is required.')
      return
    }
    setNoteLoading(true)
    setNoteError('')
    try {
      const res = await fetch(`/api/service/cases/${caseId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: noteContent.trim(),
          authorId: noteAuthor.trim() || undefined,
          isPublic,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setNoteError(data.error ?? 'Failed to add note.')
      } else {
        setNoteContent('')
        setNoteAuthor('')
        setIsPublic(false)
        setShowNoteForm(false)
        router.refresh()
      }
    } catch {
      setNoteError('Network error.')
    } finally {
      setNoteLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Status Update */}
      <Card>
        <CardContent className="pt-5 pb-5 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">Update Status</h3>

          {error && (
            <div className="rounded-lg border border-red-800 bg-red-950/40 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3">
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <Button
              onClick={handleStatusUpdate}
              disabled={loading || selectedStatus === currentStatus}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              {loading ? 'Updating…' : 'Apply'}
            </Button>

            <Badge variant={STATUS_VARIANT[currentStatus] ?? 'secondary'}>
              Current: {currentStatus.replace('_', ' ')}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Add Note */}
      <Card>
        <CardContent className="pt-5 pb-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">Add Note</h3>
            {!showNoteForm && (
              <Button variant="outline" onClick={() => setShowNoteForm(true)}>
                <MessageSquarePlus className="w-4 h-4 mr-1" />
                New Note
              </Button>
            )}
          </div>

          {showNoteForm && (
            <form onSubmit={handleAddNote} className="border border-zinc-800 rounded-lg p-4 space-y-4 bg-zinc-900/50">
              {noteError && (
                <div className="rounded-lg border border-red-800 bg-red-950/40 p-3 text-sm text-red-400">
                  {noteError}
                </div>
              )}

              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">
                  Note Content *
                </label>
                <textarea
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  rows={4}
                  placeholder="Describe what was done, customer communication, next steps…"
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">
                    Author
                  </label>
                  <input
                    type="text"
                    value={noteAuthor}
                    onChange={e => setNoteAuthor(e.target.value)}
                    placeholder="Your name or ID"
                    className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={e => setIsPublic(e.target.checked)}
                      className="rounded border-zinc-700 bg-zinc-900 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-zinc-400">Visible to customer</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={noteLoading}>
                  <MessageSquarePlus className="w-4 h-4 mr-1" />
                  {noteLoading ? 'Saving…' : 'Add Note'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowNoteForm(false); setNoteError('') }}
                  disabled={noteLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
