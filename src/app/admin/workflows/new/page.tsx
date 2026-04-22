'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GitBranch, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

const APPROVER_TYPES = ['Approver','Workflow User Group','Salesperson/Purchaser'] as const
const APPROVER_LIMIT_TYPES = ['Direct Approver','First Qualified Approver','Specific Approver','Approver Chain'] as const

interface StepRow {
  key: string
  stepNo: number
  event: string
  response: string
  approverType: string
  approverLimitType: string
  dueDateFormula: string
}

function emptyStep(n: number): StepRow {
  return { key: crypto.randomUUID(), stepNo: n, event: '', response: '', approverType: 'Approver', approverLimitType: 'Direct Approver', dueDateFormula: '' }
}

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

export default function NewWorkflowPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [openTabs, setOpenTabs] = useState<Set<Tab>>(new Set(['General', 'Workflow Steps']))
  const [form, setForm] = useState({ code: '', description: '', category: '', enabled: false })
  const [steps, setSteps] = useState<StepRow[]>([emptyStep(10)])

  function toggle(tab: Tab) {
    setOpenTabs(prev => { const next = new Set(prev); next.has(tab) ? next.delete(tab) : next.add(tab); return next })
  }

  function setF(k: string, v: string | boolean) { setForm(p => ({ ...p, [k]: v })) }
  function updateStep(key: string, field: string, val: string | number) {
    setSteps(prev => prev.map(s => s.key === key ? { ...s, [field]: val } : s))
  }
  function addStep() { setSteps(p => [...p, emptyStep((p.length + 1) * 10)]) }
  function removeStep(key: string) { setSteps(p => p.filter(s => s.key !== key)) }

  async function submit() {
    if (!form.code || !form.description) { setError('Code and Description are required.'); return }
    setSaving(true); setError('')
    const body = {
      ...form,
      steps: steps.filter(s => s.event).map(({ key: _k, ...rest }) => rest),
    }
    const res = await fetch('/api/admin/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) router.push('/admin/workflows')
    else { const j = await res.json(); setError(j.error ?? 'Failed to create') }
    setSaving(false)
  }

  return (
    <main className="flex-1 p-6 bg-zinc-950 overflow-auto min-h-[100dvh]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
            <GitBranch className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-100">New Workflow</h1>
            <p className="text-[11px] text-zinc-500">Define an approval workflow with steps</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.back()} className="px-3 py-1.5 text-xs border border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded transition-colors">Cancel</button>
          <button onClick={submit} disabled={saving} className="px-4 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors disabled:opacity-60">
            {saving ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>

      {error && <div className="mb-4 px-4 py-2 rounded text-xs text-red-400 border border-red-500/30 bg-red-500/10 max-w-5xl">{error}</div>}

      <div className="max-w-5xl space-y-1">
        <FastTab label="General" open={openTabs.has('General')} onToggle={() => toggle('General')} />
        {openTabs.has('General') && (
          <div className="px-4 py-4 rounded-b mb-2" style={{ background: 'rgba(15,18,48,0.8)', border: '1px solid rgba(99,102,241,0.1)' }}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Code <span className="text-red-400">*</span></label>
                <input value={form.code} onChange={e => setF('code', e.target.value)} placeholder="PURCH-APPROVAL"
                  className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Category</label>
                <input value={form.category} onChange={e => setF('category', e.target.value)} placeholder="Purchase"
                  className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-zinc-400 mb-1">Description <span className="text-red-400">*</span></label>
                <input value={form.description} onChange={e => setF('description', e.target.value)} placeholder="Approval workflow for purchase orders"
                  className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setF('enabled', !form.enabled)}
                  className={`relative w-9 h-5 rounded-full transition-colors ${form.enabled ? 'bg-indigo-600' : 'bg-zinc-700'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
                <span className="text-xs text-zinc-400">{form.enabled ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
          </div>
        )}

        <FastTab label="Workflow Steps" open={openTabs.has('Workflow Steps')} onToggle={() => toggle('Workflow Steps')} />
        {openTabs.has('Workflow Steps') && (
          <div className="rounded-b mb-2" style={{ background: 'rgba(15,18,48,0.8)', border: '1px solid rgba(99,102,241,0.1)' }}>
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800/60">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Steps</p>
              <button onClick={addStep} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add Step
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500">
                    {['Step No.','Event','Then Response','Approver Type','Approver Limit','Due Date Formula',''].map((h, i) => (
                      <th key={i} className={`px-3 py-2.5 font-medium uppercase tracking-widest ${i === 6 ? '' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {steps.map(s => (
                    <tr key={s.key} className="hover:bg-zinc-800/20">
                      <td className="px-3 py-2">
                        <input type="number" value={s.stepNo} onChange={e => updateStep(s.key, 'stepNo', parseInt(e.target.value))}
                          className="w-16 bg-zinc-800/60 border border-zinc-700/60 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500" />
                      </td>
                      <td className="px-3 py-2">
                        <input value={s.event} onChange={e => updateStep(s.key, 'event', e.target.value)} placeholder="Send Approval Request"
                          className="w-40 bg-zinc-800/60 border border-zinc-700/60 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500" />
                      </td>
                      <td className="px-3 py-2">
                        <input value={s.response} onChange={e => updateStep(s.key, 'response', e.target.value)} placeholder="Create Approval Request"
                          className="w-40 bg-zinc-800/60 border border-zinc-700/60 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500" />
                      </td>
                      <td className="px-3 py-2">
                        <select value={s.approverType} onChange={e => updateStep(s.key, 'approverType', e.target.value)}
                          className="bg-zinc-800/60 border border-zinc-700/60 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
                          {APPROVER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <select value={s.approverLimitType} onChange={e => updateStep(s.key, 'approverLimitType', e.target.value)}
                          className="bg-zinc-800/60 border border-zinc-700/60 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
                          {APPROVER_LIMIT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input value={s.dueDateFormula} onChange={e => updateStep(s.key, 'dueDateFormula', e.target.value)} placeholder="1W"
                          className="w-20 bg-zinc-800/60 border border-zinc-700/60 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500" />
                      </td>
                      <td className="px-3 py-2">
                        <button onClick={() => removeStep(s.key)} className="text-zinc-700 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
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
