'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Template {
  id: string
  name: string
  deferralType: string
  method: string
  periodsCount: number
  isActive: boolean
}

export default function NewDeferralSchedulePage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    templateId: '',
    entityType: 'INVOICE',
    entityId: '',
    entityRef: '',
    totalAmount: '',
    startDate: '',
    endDate: '',
  })

  useEffect(() => {
    fetch('/api/finance/deferrals/templates')
      .then(r => r.json())
      .then((data: Template[]) => setTemplates(data.filter(t => t.isActive !== false)))
      .catch(() => setTemplates([]))
  }, [])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const selectedTemplate = templates.find(t => t.id === form.templateId)

  // Auto-calculate end date when template + start date are set
  const calcEndDate = () => {
    if (!selectedTemplate || !form.startDate) return
    const start = new Date(form.startDate)
    const end = new Date(start)
    end.setMonth(end.getMonth() + selectedTemplate.periodsCount)
    end.setDate(end.getDate() - 1)
    setForm(prev => ({ ...prev, endDate: end.toISOString().split('T')[0] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.templateId) { setError('Template is required'); return }
    if (!form.entityRef.trim()) { setError('Entity reference is required'); return }
    if (!form.totalAmount || parseFloat(form.totalAmount) <= 0) { setError('Total amount must be > 0'); return }
    if (!form.startDate || !form.endDate) { setError('Start and end dates are required'); return }

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/finance/deferrals/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: form.templateId,
          entityType: form.entityType,
          entityId: form.entityId.trim() || `${form.entityRef}-${Date.now()}`,
          entityRef: form.entityRef.trim(),
          totalAmount: parseFloat(form.totalAmount),
          startDate: form.startDate,
          endDate: form.endDate,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push('/finance/deferrals')
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
      <TopBar title="New Deferral Schedule" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-xl mx-auto">
          <Link
            href="/finance/deferrals"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Deferrals
          </Link>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Create Deferral Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Template */}
                <div>
                  <label className={labelCls}>Deferral Template <span className="text-red-400">*</span></label>
                  <select value={form.templateId} onChange={set('templateId')} className={inputCls} required>
                    <option value="">— Select template —</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.deferralType} · {t.periodsCount} periods)
                      </option>
                    ))}
                  </select>
                  {selectedTemplate && (
                    <p className="mt-1.5 text-xs text-zinc-500">
                      Method: {selectedTemplate.method.replace(/_/g, ' ')} · {selectedTemplate.periodsCount} monthly periods
                    </p>
                  )}
                </div>

                {/* Entity Type + Ref */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Entity Type</label>
                    <select value={form.entityType} onChange={set('entityType')} className={inputCls}>
                      <option value="INVOICE">Invoice</option>
                      <option value="JOURNAL">Journal</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Entity Reference <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      value={form.entityRef}
                      onChange={set('entityRef')}
                      placeholder="e.g. INV-2026-001"
                      className={inputCls}
                      required
                    />
                  </div>
                </div>

                {/* Total Amount */}
                <div>
                  <label className={labelCls}>Total Amount ($) <span className="text-red-400">*</span></label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.totalAmount}
                    onChange={set('totalAmount')}
                    placeholder="0.00"
                    className={inputCls}
                    required
                  />
                </div>

                {/* Start + End Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Start Date <span className="text-red-400">*</span></label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={e => {
                        set('startDate')(e)
                        setTimeout(calcEndDate, 50)
                      }}
                      className={inputCls}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelCls}>End Date <span className="text-red-400">*</span></label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={set('endDate')}
                      className={inputCls}
                      required
                    />
                  </div>
                </div>
                {selectedTemplate && (
                  <button
                    type="button"
                    onClick={calcEndDate}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Auto-calculate end date from template periods
                  </button>
                )}

                {error && (
                  <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-1">
                  <Link href="/finance/deferrals">
                    <Button type="button" variant="outline" size="sm">Cancel</Button>
                  </Link>
                  <Button type="submit" size="sm" disabled={loading}>
                    {loading ? 'Creating…' : 'Create Schedule'}
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
