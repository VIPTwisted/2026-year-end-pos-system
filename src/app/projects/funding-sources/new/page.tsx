'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'

type Project = { id: string; projectNo: string; description: string }

const BILLING_RULES = [
  { value: 'percentage',    label: 'Percentage' },
  { value: 'milestone',     label: 'Milestone' },
  { value: 'time_material', label: 'Time & Material' },
]

const SOURCE_TYPES = [
  { value: 'customer', label: 'Customer' },
  { value: 'grant',    label: 'Grant' },
  { value: 'internal', label: 'Internal' },
  { value: 'investor', label: 'Investor' },
  { value: 'loan',     label: 'Loan' },
]

export default function NewFundingSourcePage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [saving,   setSaving]   = useState(false)

  const [form, setForm] = useState({
    projectId:     '',
    name:          '',
    sourceType:    'customer',
    fundingAmount: 0,
    billingRule:   'percentage',
    limitAmount:   '',
    priority:      1,
  })

  useEffect(() => {
    fetch('/api/projects').then(r => r.json()).then(setProjects).catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/projects/funding-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId:     form.projectId,
          name:          form.name,
          sourceType:    form.sourceType,
          fundingAmount: form.fundingAmount,
          billingRule:   form.billingRule,
          limitAmount:   form.limitAmount ? parseFloat(form.limitAmount) : null,
          priority:      form.priority,
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      router.push('/projects/funding-sources')
    } catch {
      alert('Failed to save funding source.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="Add Funding Source" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-5 max-w-2xl">

          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Projects / Funding Sources</p>
            <h2 className="text-[18px] font-semibold text-zinc-100">Add Funding Source</h2>
          </div>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Project *</label>
                <select
                  required
                  value={form.projectId}
                  onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select project…</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.projectNo} — {p.description}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Source Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Source Type</label>
                <select
                  value={form.sourceType}
                  onChange={e => setForm(f => ({ ...f, sourceType: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                >
                  {SOURCE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Funding Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.fundingAmount}
                  onChange={e => setForm(f => ({ ...f, fundingAmount: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Billing Rule</label>
                <select
                  value={form.billingRule}
                  onChange={e => setForm(f => ({ ...f, billingRule: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                >
                  {BILLING_RULES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Limit Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.limitAmount}
                  onChange={e => setForm(f => ({ ...f, limitAmount: e.target.value }))}
                  placeholder="Optional…"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Priority</label>
                <input
                  type="number"
                  min="1"
                  value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: parseInt(e.target.value) || 1 }))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors"
            >
              {saving ? 'Saving…' : 'Add Funding Source'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/projects/funding-sources')}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </>
  )
}
