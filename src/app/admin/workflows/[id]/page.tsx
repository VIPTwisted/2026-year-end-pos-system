'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { GitBranch, Save, Trash2, ArrowLeft, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WorkflowStep {
  id: string
  stepNo: number
  event: string
  response?: string | null
  approverType?: string | null
  approverLimitType?: string | null
  dueDateFormula?: string | null
}

interface Workflow {
  id: string
  code: string
  description: string
  category?: string | null
  enabled: boolean
  steps: WorkflowStep[]
  createdAt: string
}

const APPROVER_TYPES = ['Approver','Workflow User Group','Salesperson/Purchaser'] as const
const APPROVER_LIMIT_TYPES = ['Direct Approver','First Qualified Approver','Specific Approver','Approver Chain'] as const

const TABS = ['General', 'Workflow Steps'] as const
type Tab = typeof TABS[number]

function FastTab({ label, open, onToggle }: { label: string; open: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle}
      className="flex items-center justify-between w-full px-4 py-2.5 text-xs font-semibold uppercase tracking-widest rounded mb-0.5 transition-colors"
      style={open ? { background: 'rgba(79,70,229,0.2)', color: '#a5b4fc' } : { background: 'rgba(255,255,255,0.03)', color: 'rgba(165,180,252,0.5)' }}>
      {label}
      {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
    </button>
  )
}

export default function WorkflowDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [wf, setWf] = useState<Workflow | null>(null)
  const [form, setForm] = useState<Partial<Workflow>>({})
  const [openTabs, setOpenTabs] = useState<Set<Tab>>(new Set(['General', 'Workflow Steps']))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/workflows/${params.id}`)
      .then(r => r.json())
      .then(d => { setWf(d); setForm(d) })
  }, [params.id])

  function toggle(tab: Tab) {
    setOpenTabs(prev => { const next = new Set(prev); next.has(tab) ? next.delete(tab) : next.add(tab); return next })
  }

  function setF(k: string, v: string | boolean) { setForm(p => ({ ...p, [k]: v })) }

  async function save() {
    setSaving(true)
    const { steps: _s, ...data } = form as Workflow
    const res = await fetch(`/api/admin/workflows/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2500) }
    setSaving(false)
  }

  async function deleteWf() {
    if (!confirm('Delete this workflow?')) return
    setDeleting(true)
    await fetch(`/api/admin/workflows/${params.id}`, { method: 'DELETE' })
    router.push('/admin/workflows')
  }

  if (!wf) return (
    <main className="flex-1 p-6 bg-zinc-950 min-h-[100dvh]">
      <div className="text-xs text-zinc-500 animate-pulse">Loading…</div>
    </main>
  )

  return (
    <main className="flex-1 p-6 bg-zinc-950 overflow-auto min-h-[100dvh]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 rounded hover:bg-zinc-800 transition-colors text-zinc-400">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
            <GitBranch className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-100">{wf.code}</h1>
            <p className="text-[11px] text-zinc-500">{wf.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={deleteWf} disabled={deleting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded transition-colors disabled:opacity-60">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
          <button onClick={save} disabled={saving}
            className={cn('flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded transition-all',
              saved ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-indigo-600 hover:bg-indigo-500 text-white',
              saving && 'opacity-60 cursor-not-allowed')}>
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving…' : saved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      <div className="max-w-5xl space-y-1">
        <FastTab label="General" open={openTabs.has('General')} onToggle={() => toggle('General')} />
        {openTabs.has('General') && (
          <div className="px-4 py-4 rounded-b mb-2" style={{ background: 'rgba(15,18,48,0.8)', border: '1px solid rgba(99,102,241,0.1)' }}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Code</label>
                <input value={(form as Workflow).code ?? ''} onChange={e => setF('code', e.target.value)}
                  className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Category</label>
                <input value={(form as Workflow).category ?? ''} onChange={e => setF('category', e.target.value)}
                  className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-zinc-400 mb-1">Description</label>
                <input value={(form as Workflow).description ?? ''} onChange={e => setF('description', e.target.value)}
                  className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setF('enabled', !(form as Workflow).enabled)}
                  className={`relative w-9 h-5 rounded-full transition-colors ${(form as Workflow).enabled ? 'bg-indigo-600' : 'bg-zinc-700'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${(form as Workflow).enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
                <span className="text-xs text-zinc-400">{(form as Workflow).enabled ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
          </div>
        )}

        <FastTab label="Workflow Steps" open={openTabs.has('Workflow Steps')} onToggle={() => toggle('Workflow Steps')} />
        {openTabs.has('Workflow Steps') && (
          <div className="rounded-b mb-2" style={{ background: 'rgba(15,18,48,0.8)', border: '1px solid rgba(99,102,241,0.1)' }}>
            <div className="px-4 py-2.5 border-b border-zinc-800/60 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Steps ({wf.steps.length})</p>
              <span className="text-[11px] text-zinc-600">Read-only — re-create workflow to modify steps</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500">
                    {['Step No.','Event','Then Response','Approver Type','Approver Limit','Due Date'].map((h, i) => (
                      <th key={i} className="px-3 py-2.5 font-medium uppercase tracking-widest text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {wf.steps.length === 0 && (
                    <tr><td colSpan={6} className="px-3 py-4 text-zinc-600">No steps defined.</td></tr>
                  )}
                  {wf.steps.map(s => (
                    <tr key={s.id} className="hover:bg-zinc-800/20">
                      <td className="px-3 py-2.5 text-zinc-400">{s.stepNo}</td>
                      <td className="px-3 py-2.5 text-zinc-300">{s.event}</td>
                      <td className="px-3 py-2.5 text-zinc-400">{s.response ?? '—'}</td>
                      <td className="px-3 py-2.5 text-zinc-400">{s.approverType ?? '—'}</td>
                      <td className="px-3 py-2.5 text-zinc-400">{s.approverLimitType ?? '—'}</td>
                      <td className="px-3 py-2.5 text-zinc-400">{s.dueDateFormula ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
