'use client'
import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Clock, Play, Zap, ArrowLeft, Pencil, Trash2, ChevronRight } from 'lucide-react'

interface AutomationAction { id: string; actionType: string; config: string; position: number }
interface WorkflowRun { id: string; status: string; triggerData: string | null; actionsRun: number; duration: number | null; errorMessage: string | null; createdAt: string }
interface Workflow {
  id: string; name: string; description: string | null; trigger: string; conditions: string
  isActive: boolean; runCount: number; lastRunAt: string | null
  actions: AutomationAction[]; runs: WorkflowRun[]
}

const TRIGGER_LABELS: Record<string, string> = {
  'order-created': 'Order Created', 'order-shipped': 'Order Shipped', 'payment-received': 'Payment Received',
  'inventory-low': 'Inventory Low', 'customer-created': 'Customer Created', 'loyalty-tier-change': 'Loyalty Tier Changed',
  'case-created': 'Case Created', 'case-resolved': 'Case Resolved', 'shift-started': 'Shift Started',
  'shift-ended': 'Shift Ended', 'daily-schedule': 'Daily Schedule', 'weekly-schedule': 'Weekly Schedule',
}

const OPERATOR_TEXT: Record<string, string> = {
  'equals': '=', 'not-equals': '≠', 'greater-than': '>', 'less-than': '<',
  'contains': 'contains', 'is-empty': 'is empty', 'is-not-empty': 'is not empty',
}

function conditionToText(c: { field: string; operator: string; value: string }) {
  const op = OPERATOR_TEXT[c.operator] ?? c.operator
  const val = ['is-empty', 'is-not-empty'].includes(c.operator) ? '' : ` "${c.value}"`
  return `${c.field} ${op}${val}`
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'success') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-emerald-500/15 text-emerald-400"><CheckCircle className="w-3 h-3" />Success</span>
  if (status === 'failed') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-red-500/15 text-red-400"><XCircle className="w-3 h-3" />Failed</span>
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-zinc-700/40 text-zinc-400"><Clock className="w-3 h-3" />Skipped</span>
}

function timeAgo(iso: string | null) {
  if (!iso) return 'Never'
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return `${Math.floor(diff)}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

type Tab = 'overview' | 'runs'

export default function WorkflowDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [tab, setTab] = useState<Tab>('overview')
  const [running, setRunning] = useState(false)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    fetch(`/api/automation/workflows/${id}`).then(r => r.json()).then(setWorkflow)
  }, [id])

  async function runNow() {
    setRunning(true)
    await fetch(`/api/automation/workflows/${id}/run`, { method: 'POST' })
    const res = await fetch(`/api/automation/workflows/${id}`)
    setWorkflow(await res.json())
    setRunning(false)
  }

  async function toggle() {
    setToggling(true)
    await fetch(`/api/automation/workflows/${id}/toggle`, { method: 'POST' })
    const res = await fetch(`/api/automation/workflows/${id}`)
    setWorkflow(await res.json())
    setToggling(false)
  }

  async function deleteWorkflow() {
    if (!confirm('Delete this workflow?')) return
    await fetch(`/api/automation/workflows/${id}`, { method: 'DELETE' })
    router.push('/automation/workflows')
  }

  if (!workflow) return <div className="p-6 text-zinc-500">Loading...</div>

  let conditions: Array<{ field: string; operator: string; value: string }> = []
  try { conditions = JSON.parse(workflow.conditions) } catch {}

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Link href="/automation/workflows" className="mt-1 p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"><ArrowLeft className="w-4 h-4" /></Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">{workflow.name}</h1>
            {workflow.description && <p className="text-sm text-zinc-400 mt-0.5">{workflow.description}</p>}
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 bg-violet-500/15 text-violet-400 rounded text-xs font-medium">{TRIGGER_LABELS[workflow.trigger] ?? workflow.trigger}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${workflow.isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-zinc-700/40 text-zinc-500'}`}>{workflow.isActive ? 'Active' : 'Inactive'}</span>
              <span className="text-xs text-zinc-500">{workflow.runCount} runs total</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={runNow} disabled={running} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors">
            {running ? <Clock className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} Run Now
          </button>
          <button onClick={toggle} disabled={toggling} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${workflow.isActive ? 'border-zinc-700 text-zinc-400 hover:text-zinc-100' : 'border-emerald-700 text-emerald-400 hover:bg-emerald-500/10'}`}>
            {workflow.isActive ? 'Deactivate' : 'Activate'}
          </button>
          <Link href={`/automation/workflows/${id}/edit`} className="p-2 rounded-lg text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 border border-zinc-800 transition-colors"><Pencil className="w-4 h-4" /></Link>
          <button onClick={deleteWorkflow} className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 border border-zinc-800 transition-colors"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
        {(['overview', 'runs'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-100'}`}>
            {t === 'runs' ? `Run History (${workflow.runs.length})` : 'Overview'}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h2 className="font-semibold text-zinc-100 mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-violet-400" /> Conditions</h2>
            {conditions.length === 0 ? (
              <p className="text-sm text-zinc-500 italic">No conditions — workflow always runs on trigger</p>
            ) : (
              <div className="space-y-2">
                {conditions.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {i > 0 && <span className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500 font-mono">AND</span>}
                    <code className="text-sm text-zinc-300 bg-zinc-800/50 px-2 py-1 rounded">{conditionToText(c)}</code>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h2 className="font-semibold text-zinc-100 mb-4 flex items-center gap-2"><ChevronRight className="w-4 h-4 text-blue-400" /> Actions ({workflow.actions.length})</h2>
            {workflow.actions.length === 0 ? (
              <p className="text-sm text-zinc-500 italic">No actions configured</p>
            ) : (
              <div className="space-y-2">
                {workflow.actions.map((action, i) => {
                  let cfg: Record<string, string> = {}
                  try { cfg = JSON.parse(action.config) } catch {}
                  const summary = Object.entries(cfg).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(' · ')
                  return (
                    <div key={action.id} className="flex items-start gap-3 bg-zinc-800/40 rounded-lg p-3">
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0 mt-0.5">{i + 1}</div>
                      <div>
                        <div className="text-sm font-medium text-zinc-200">{action.actionType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                        {summary && <div className="text-xs text-zinc-500 mt-0.5 font-mono">{summary}</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'runs' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Trigger Data</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions Run</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Duration</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {workflow.runs.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-zinc-600">No runs yet</td></tr>
              ) : workflow.runs.map(run => {
                let tData: Record<string, unknown> = {}
                try { tData = JSON.parse(run.triggerData ?? '{}') } catch {}
                const summary = Object.entries(tData).slice(0, 2).map(([k, v]) => `${k}=${v}`).join(', ')
                return (
                  <tr key={run.id} className="hover:bg-zinc-800/30">
                    <td className="px-5 py-3"><StatusBadge status={run.status} /></td>
                    <td className="px-5 py-3 text-zinc-500 text-xs font-mono truncate max-w-[300px]">{summary || '—'}</td>
                    <td className="px-5 py-3 text-zinc-400">{run.actionsRun}</td>
                    <td className="px-5 py-3 text-zinc-400">{run.duration != null ? `${run.duration}ms` : '—'}</td>
                    <td className="px-5 py-3 text-zinc-500 text-xs">{timeAgo(run.createdAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
