'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Plus, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  workOrderId:   string
  currentStatus: string
  showAddLine?:  boolean
}

const STATUS_TRANSITIONS: Record<string, { label: string; next: string; colorCls: string }[]> = {
  new:         [{ label: 'Assign',      next: 'assigned',    colorCls: 'bg-blue-600 hover:bg-blue-500'    }],
  assigned:    [{ label: 'Start Work',  next: 'in_progress', colorCls: 'bg-amber-600 hover:bg-amber-500'  }],
  in_progress: [
    { label: 'Complete', next: 'completed', colorCls: 'bg-emerald-600 hover:bg-emerald-500' },
    { label: 'Hold',     next: 'on_hold',   colorCls: 'bg-zinc-600 hover:bg-zinc-500'       },
  ],
  on_hold:     [{ label: 'Resume',      next: 'in_progress', colorCls: 'bg-amber-600 hover:bg-amber-500'  }],
  completed:   [],
  cancelled:   [],
}

const STATUS_LABELS: Record<string, string> = {
  new:         'New',
  assigned:    'Assigned',
  in_progress: 'In Progress',
  on_hold:     'On Hold',
  completed:   'Completed',
  cancelled:   'Cancelled',
}

export default function WorkOrderActions({ workOrderId, currentStatus, showAddLine }: Props) {
  const router = useRouter()

  const [statusLoading, setStatusLoading] = useState<string | null>(null)
  const [statusError,   setStatusError]   = useState('')

  const [showForm,    setShowForm]    = useState(false)
  const [lineLoading, setLineLoading] = useState(false)
  const [lineError,   setLineError]   = useState('')

  const [lineForm, setLineForm] = useState({
    lineType:    'labor',
    description: '',
    quantity:    '1',
    unitCost:    '0',
  })

  const transitions = STATUS_TRANSITIONS[currentStatus] ?? []

  const updateStatus = async (nextStatus: string, label: string) => {
    setStatusLoading(label)
    setStatusError('')
    try {
      const res  = await fetch(`/api/field-service/work-orders/${workOrderId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status: nextStatus }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Status update failed')
      router.refresh()
    } catch (err: unknown) {
      setStatusError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setStatusLoading(null)
    }
  }

  const setLine = (k: keyof typeof lineForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setLineForm(prev => ({ ...prev, [k]: e.target.value }))

  const submitLine = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lineForm.description.trim()) { setLineError('Description is required'); return }
    setLineLoading(true)
    setLineError('')
    try {
      const res  = await fetch(`/api/field-service/work-orders/${workOrderId}/lines`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          lineType:    lineForm.lineType,
          description: lineForm.description.trim(),
          quantity:    parseFloat(lineForm.quantity) || 1,
          unitCost:    parseFloat(lineForm.unitCost)  || 0,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to add line')
      setLineForm({ lineType: 'labor', description: '', quantity: '1', unitCost: '0' })
      setShowForm(false)
      router.refresh()
    } catch (err: unknown) {
      setLineError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLineLoading(false)
    }
  }

  const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-colors'

  return (
    <div className="space-y-4">
      {/* Status buttons — shown inline in header when !showAddLine */}
      {!showAddLine && transitions.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {transitions.map(t => (
            <button
              key={t.next}
              onClick={() => updateStatus(t.next, t.label)}
              disabled={!!statusLoading}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${t.colorCls}`}
            >
              <ChevronDown className="w-3.5 h-3.5" />
              {statusLoading === t.label ? `${t.label}…` : t.label}
            </button>
          ))}
          {statusError && (
            <span className="text-xs text-red-400">{statusError}</span>
          )}
        </div>
      )}

      {/* Add Line section — shown at bottom of detail page */}
      {showAddLine && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-sm">Actions</CardTitle>
                {transitions.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    {transitions.map(t => (
                      <button
                        key={t.next}
                        onClick={() => updateStatus(t.next, t.label)}
                        disabled={!!statusLoading}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${t.colorCls}`}
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                        {statusLoading === t.label ? `${t.label}…` : `Move to ${STATUS_LABELS[t.next]}`}
                      </button>
                    ))}
                    {statusError && (
                      <span className="text-xs text-red-400">{statusError}</span>
                    )}
                  </div>
                )}
              </div>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 text-xs font-medium rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Line
                </button>
              )}
            </div>
          </CardHeader>

          {showForm && (
            <CardContent className="border-t border-zinc-800 pt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">New Line Item</p>
                <button onClick={() => { setShowForm(false); setLineError('') }} className="text-zinc-600 hover:text-zinc-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={submitLine} className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Type</label>
                    <select value={lineForm.lineType} onChange={setLine('lineType')} className={inputCls}>
                      <option value="labor">Labor</option>
                      <option value="part">Part</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Qty</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={lineForm.quantity}
                      onChange={setLine('quantity')}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Unit Cost ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={lineForm.unitCost}
                      onChange={setLine('unitCost')}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Description</label>
                  <input
                    type="text"
                    value={lineForm.description}
                    onChange={setLine('description')}
                    placeholder="e.g. Technician labor — 2 hrs, or Replacement filter"
                    className={inputCls}
                    required
                  />
                </div>

                {lineError && (
                  <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-2 py-1.5">
                    {lineError}
                  </div>
                )}

                <div className="flex items-center gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setLineError('') }}
                    className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={lineLoading}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    {lineLoading ? 'Adding…' : 'Add Line'}
                  </button>
                </div>
              </form>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  )
}
