'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'

type Project = { id: string; projectNo: string; description: string }
type Vendor  = { id: string; vendorCode: string; name: string }

export default function NewSubcontractPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [vendors,  setVendors]  = useState<Vendor[]>([])
  const [saving,   setSaving]   = useState(false)

  const [form, setForm] = useState({
    projectId:   '',
    vendorId:    '',
    description: '',
    value:       0,
    retentionPct: 0,
    startDate:   '',
    endDate:     '',
  })

  useEffect(() => {
    fetch('/api/projects').then(r => r.json()).then(setProjects).catch(() => {})
    fetch('/api/vendors').then(r => r.json()).then((d: any) => setVendors(Array.isArray(d) ? d : d.vendors ?? [])).catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const subcontractNo = `SUB-${Date.now()}`
      const res = await fetch('/api/projects/subcontracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subcontractNo,
          projectId:   form.projectId,
          vendorId:    form.vendorId || null,
          description: form.description || null,
          value:       form.value,
          retentionPct: form.retentionPct,
          startDate:   form.startDate ? new Date(form.startDate).toISOString() : null,
          endDate:     form.endDate   ? new Date(form.endDate).toISOString()   : null,
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      router.push('/projects/subcontracts')
    } catch {
      alert('Failed to save subcontract.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Subcontract" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-5 max-w-2xl">

          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Projects / Subcontracts</p>
            <h2 className="text-[18px] font-semibold text-zinc-100">New Subcontract</h2>
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
                <label className="block text-xs text-zinc-500 mb-1">Vendor</label>
                <select
                  value={form.vendorId}
                  onChange={e => setForm(f => ({ ...f, vendorId: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="">None</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.vendorCode} — {v.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-zinc-500 mb-1">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Contract Value</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.value}
                  onChange={e => setForm(f => ({ ...f, value: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Retention %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={form.retentionPct}
                  onChange={e => setForm(f => ({ ...f, retentionPct: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Start Date</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">End Date</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
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
              {saving ? 'Saving…' : 'Create Subcontract'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/projects/subcontracts')}
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
