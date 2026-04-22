'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Play, Pencil, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react'

interface AutomationAction { id: string; actionType: string }
interface Workflow {
  id: string; name: string; description: string | null; trigger: string
  conditions: string; actions: AutomationAction[]; isActive: boolean
  runCount: number; lastRunAt: string | null; createdAt: string
}

function timeAgo(iso: string | null) {
  if (!iso) return 'Never'
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return `${Math.floor(diff)}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

const TRIGGER_LABELS: Record<string, string> = {
  'order-created': 'Order Created', 'order-shipped': 'Order Shipped',
  'payment-received': 'Payment Received', 'inventory-low': 'Inventory Low',
  'customer-created': 'Customer Created', 'loyalty-tier-change': 'Loyalty Tier Changed',
  'case-created': 'Case Created', 'case-resolved': 'Case Resolved',
  'shift-started': 'Shift Started', 'shift-ended': 'Shift Ended',
  'daily-schedule': 'Daily Schedule', 'weekly-schedule': 'Weekly Schedule',
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [running, setRunning] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/automation/workflows').then(r => r.json()).then(d => { setWorkflows(d); setLoading(false) })
  }, [])

  const filtered = workflows.filter(w => filter === 'all' ? true : filter === 'active' ? w.isActive : !w.isActive)

  async function toggleActive(id: string) {
    const res = await fetch(`/api/automation/workflows/${id}/toggle`, { method: 'POST' })
    const updated = await res.json()
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, isActive: updated.isActive } : w))
  }

  async function runNow(id: string) {
    setRunning(id)
    await fetch(`/api/automation/workflows/${id}/run`, { method: 'POST' })
    const res = await fetch('/api/automation/workflows')
    setWorkflows(await res.json())
    setRunning(null)
  }

  async function deleteWorkflow(id: string) {
    if (!confirm('Delete this workflow?')) return
    await fetch(`/api/automation/workflows/${id}`, { method: 'DELETE' })
    setWorkflows(prev => prev.filter(w => w.id !== id))
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Workflows</h1>
          <p className="text-sm text-zinc-400 mt-0.5">Automate business processes with trigger-action rules</p>
        </div>
        <Link href="/automation/workflows/new" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Workflow
        </Link>
      </div>

      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
        {(['all', 'active', 'inactive'] as const).map(t => (
          <button key={t} onClick={() => setFilter(t)} className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${filter === t ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-100'}`}>{t}</button>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Workflow</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Trigger</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Conditions</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Last Run</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Runs</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {loading ? (
              <tr><td colSpan={8} className="px-5 py-10 text-center text-zinc-600">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-5 py-10 text-center text-zinc-600">No workflows found. <Link href="/automation/workflows/new" className="text-blue-400 hover:underline">Create one</Link></td></tr>
            ) : filtered.map(w => {
              let condCount = 0
              try { condCount = JSON.parse(w.conditions).length } catch {}
              return (
                <tr key={w.id} className="hover:bg-zinc-800/30">
                  <td className="px-5 py-3">
                    <Link href={`/automation/workflows/${w.id}`} className="font-medium text-zinc-100 hover:text-blue-400 transition-colors">{w.name}</Link>
                    {w.description && <div className="text-xs text-zinc-500 mt-0.5 truncate max-w-[200px]">{w.description}</div>}
                  </td>
                  <td className="px-5 py-3"><span className="px-2 py-0.5 bg-violet-500/15 text-violet-400 rounded text-xs">{TRIGGER_LABELS[w.trigger] ?? w.trigger}</span></td>
                  <td className="px-5 py-3 text-zinc-400">{condCount > 0 ? `${condCount}` : <span className="text-zinc-600 italic">None</span>}</td>
                  <td className="px-5 py-3 text-zinc-400">{w.actions.length}</td>
                  <td className="px-5 py-3 text-zinc-400 text-xs">{timeAgo(w.lastRunAt)}</td>
                  <td className="px-5 py-3 text-zinc-400">{w.runCount}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => toggleActive(w.id)} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-colors ${w.isActive ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25' : 'bg-zinc-700/40 text-zinc-500 hover:bg-zinc-700/60'}`}>
                      {w.isActive ? <><CheckCircle className="w-3 h-3" />Active</> : <><XCircle className="w-3 h-3" />Inactive</>}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => runNow(w.id)} disabled={running === w.id} title="Run Now" className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-40">
                        {running === w.id ? <Clock className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                      </button>
                      <Link href={`/automation/workflows/${w.id}`} title="Edit" className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"><Pencil className="w-4 h-4" /></Link>
                      <button onClick={() => deleteWorkflow(w.id)} title="Delete" className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
