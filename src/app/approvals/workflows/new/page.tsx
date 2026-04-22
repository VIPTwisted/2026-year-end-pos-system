'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'

interface Step {
  stepOrder: number
  approverRole: string
  approverName: string
  isRequired: boolean
}

const ENTITY_TYPES = [
  'PURCHASE_ORDER',
  'VENDOR_INVOICE',
  'SALES_ORDER',
  'JOURNAL_ENTRY',
  'BUDGET',
  'CUSTOMER',
]

export default function NewWorkflowPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    entityType: 'PURCHASE_ORDER',
    description: '',
    isActive: true,
  })

  const [steps, setSteps] = useState<Step[]>([
    { stepOrder: 1, approverRole: 'manager', approverName: '', isRequired: true },
  ])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const val = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    setForm(prev => ({ ...prev, [k]: val }))
  }

  const addStep = () => {
    setSteps(prev => [
      ...prev,
      { stepOrder: prev.length + 1, approverRole: 'manager', approverName: '', isRequired: true },
    ])
  }

  const removeStep = (idx: number) => {
    setSteps(prev =>
      prev
        .filter((_, i) => i !== idx)
        .map((s, i) => ({ ...s, stepOrder: i + 1 }))
    )
  }

  const updateStep = (idx: number, key: keyof Step, value: string | boolean | number) => {
    setSteps(prev => prev.map((s, i) => i === idx ? { ...s, [key]: value } : s))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Workflow name is required'); return }
    if (steps.length === 0) { setError('At least one approval step is required'); return }

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/approvals/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          entityType: form.entityType,
          description: form.description.trim() || undefined,
          isActive: form.isActive,
          steps: steps.map(s => ({
            stepOrder: s.stepOrder,
            approverRole: s.approverRole,
            approverName: s.approverName.trim() || undefined,
            isRequired: s.isRequired,
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push('/approvals/workflows')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-colors'
  const labelCls = 'block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide'

  return (
    <>
      <TopBar title="New Approval Workflow" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/approvals/workflows"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Workflows
          </Link>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Create Approval Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Name */}
                <div>
                  <label className={labelCls}>Workflow Name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={set('name')}
                    placeholder="e.g. Purchase Order Approval"
                    className={inputCls}
                    required
                  />
                </div>

                {/* Entity Type */}
                <div>
                  <label className={labelCls}>Applies To <span className="text-red-400">*</span></label>
                  <select value={form.entityType} onChange={set('entityType')} className={inputCls}>
                    {ENTITY_TYPES.map(t => (
                      <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea
                    value={form.description}
                    onChange={set('description')}
                    placeholder="Optional description of this workflow…"
                    rows={2}
                    className={inputCls + ' resize-none'}
                  />
                </div>

                {/* Active toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={e => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <label htmlFor="isActive" className="text-sm text-zinc-300 cursor-pointer">
                    Active (workflow is available for use)
                  </label>
                </div>

                {/* Approval Steps */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className={labelCls + ' mb-0'}>Approval Steps</label>
                    <button
                      type="button"
                      onClick={addStep}
                      className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Step
                    </button>
                  </div>
                  <div className="space-y-3">
                    {steps.map((step, idx) => (
                      <div key={idx} className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Step {step.stepOrder}</span>
                          {steps.length > 1 && (
                            <button type="button" onClick={() => removeStep(idx)} className="text-zinc-600 hover:text-red-400 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={labelCls}>Role</label>
                            <select
                              value={step.approverRole}
                              onChange={e => updateStep(idx, 'approverRole', e.target.value)}
                              className={inputCls}
                            >
                              <option value="admin">Admin</option>
                              <option value="manager">Manager</option>
                              <option value="accountant">Accountant</option>
                            </select>
                          </div>
                          <div>
                            <label className={labelCls}>Approver Name (optional)</label>
                            <input
                              type="text"
                              value={step.approverName}
                              onChange={e => updateStep(idx, 'approverName', e.target.value)}
                              placeholder="e.g. John Smith"
                              className={inputCls}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`req-${idx}`}
                            checked={step.isRequired}
                            onChange={e => updateStep(idx, 'isRequired', e.target.checked)}
                            className="w-3.5 h-3.5 accent-blue-600"
                          />
                          <label htmlFor={`req-${idx}`} className="text-xs text-zinc-400 cursor-pointer">Required step</label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-1">
                  <Link href="/approvals/workflows">
                    <Button type="button" variant="outline" size="sm">Cancel</Button>
                  </Link>
                  <Button type="submit" size="sm" disabled={loading}>
                    {loading ? 'Creating…' : 'Create Workflow'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
