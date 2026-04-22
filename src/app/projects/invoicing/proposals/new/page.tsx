'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'

type Project = { id: string; projectNo: string; description: string }

export default function NewProposalPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [saving,   setSaving]   = useState(false)

  const [form, setForm] = useState({
    projectId:      '',
    fundingSourceId: '',
    periodStart:    '',
    periodEnd:      '',
    totalAmount:    0,
    linesJson:      '',
  })

  useEffect(() => {
    fetch('/api/projects').then(r => r.json()).then(setProjects).catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const proposalNumber = `PROP-${Date.now()}`
      const res = await fetch('/api/projects/invoicing/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalNumber,
          projectId:      form.projectId,
          fundingSourceId: form.fundingSourceId || null,
          periodStart:    new Date(form.periodStart).toISOString(),
          periodEnd:      new Date(form.periodEnd).toISOString(),
          totalAmount:    form.totalAmount,
          linesJson:      form.linesJson || null,
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      router.push('/projects/invoicing/proposals')
    } catch {
      alert('Failed to save proposal.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Invoice Proposal" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-5 max-w-2xl">

          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Projects / Invoicing / Proposals</p>
            <h2 className="text-[18px] font-semibold text-zinc-100">New Invoice Proposal</h2>
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
                <label className="block text-xs text-zinc-500 mb-1">Funding Source ID</label>
                <input
                  type="text"
                  value={form.fundingSourceId}
                  onChange={e => setForm(f => ({ ...f, fundingSourceId: e.target.value }))}
                  placeholder="Optional…"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Period Start *</label>
                <input
                  type="date"
                  required
                  value={form.periodStart}
                  onChange={e => setForm(f => ({ ...f, periodStart: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Period End *</label>
                <input
                  type="date"
                  required
                  value={form.periodEnd}
                  onChange={e => setForm(f => ({ ...f, periodEnd: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Total Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.totalAmount}
                  onChange={e => setForm(f => ({ ...f, totalAmount: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Transaction Lines (JSON)</label>
              <textarea
                rows={4}
                value={form.linesJson}
                onChange={e => setForm(f => ({ ...f, linesJson: e.target.value }))}
                placeholder='[{"description":"Labor","amount":1000}]'
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-400 font-mono focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors"
            >
              {saving ? 'Saving…' : 'Create Proposal'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/projects/invoicing/proposals')}
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
