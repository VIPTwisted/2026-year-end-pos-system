'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle } from 'lucide-react'

interface StepDef {
  id: string
  approverRole: string
  approverName?: string | null
}

interface Props {
  requestId: string
  currentStep: number
  currentStepDef: StepDef | null
}

export function ApprovalActionPanel({ requestId, currentStep, currentStepDef }: Props) {
  const router = useRouter()
  const [actorName, setActorName] = useState('')
  const [actorRole, setActorRole] = useState(currentStepDef?.approverRole ?? 'manager')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [error, setError] = useState('')

  const submit = async (action: 'approve' | 'reject') => {
    if (!actorName.trim()) { setError('Your name is required'); return }
    setLoading(action)
    setError('')
    try {
      const res = await fetch(`/api/approvals/${requestId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          actorName: actorName.trim(),
          actorRole,
          comment: comment.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Action failed')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(null)
    }
  }

  const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-colors'
  const labelCls = 'block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide'

  return (
    <section>
      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">
        Take Action — Step {currentStep}
        {currentStepDef && (
          <span className="ml-2 text-zinc-500 normal-case font-normal capitalize">
            ({currentStepDef.approverRole}{currentStepDef.approverName ? ` · ${currentStepDef.approverName}` : ''})
          </span>
        )}
      </h3>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-zinc-300">Approve or Reject</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Your Name <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={actorName}
                onChange={e => setActorName(e.target.value)}
                placeholder="Enter your name"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Your Role</label>
              <select value={actorRole} onChange={e => setActorRole(e.target.value)} className={inputCls}>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="accountant">Accountant</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Comment (optional)</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Add a note or reason…"
              rows={3}
              className={inputCls + ' resize-none'}
            />
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <Button
              onClick={() => submit('approve')}
              disabled={loading !== null}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
              size="sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              {loading === 'approve' ? 'Approving…' : 'Approve'}
            </Button>
            <Button
              onClick={() => submit('reject')}
              disabled={loading !== null}
              variant="destructive"
              size="sm"
              className="flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              {loading === 'reject' ? 'Rejecting…' : 'Reject'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
