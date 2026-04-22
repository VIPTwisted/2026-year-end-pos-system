'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Zap, GitBranch, BookOpen, History, Bell, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react'

interface WorkflowRun {
  id: string
  workflowId: string
  workflowName: string | null
  trigger: string | null
  status: string
  actionsRun: number
  duration: number | null
  errorMessage: string | null
  createdAt: string
}

interface KPIs {
  activeWorkflows: number
  runsToday: number
  successRate: number
  unreadNotifications: number
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return `${Math.floor(diff)}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'success')
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-emerald-500/15 text-emerald-400"><CheckCircle className="w-3 h-3" />Success</span>
  if (status === 'failed')
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-red-500/15 text-red-400"><XCircle className="w-3 h-3" />Failed</span>
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-zinc-500/15 text-zinc-400"><Clock className="w-3 h-3" />Skipped</span>
}

export default function AutomationHubPage() {
  const [kpis, setKpis] = useState<KPIs>({ activeWorkflows: 0, runsToday: 0, successRate: 0, unreadNotifications: 0 })
  const [runs, setRuns] = useState<WorkflowRun[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [wfRes, runsRes, notifRes] = await Promise.all([
        fetch('/api/automation/workflows'),
        fetch('/api/automation/runs?limit=50'),
        fetch('/api/automation/notifications?isRead=false&limit=1'),
      ])
      const workflows = await wfRes.json()
      const allRuns: WorkflowRun[] = await runsRes.json()
      const notifData = await notifRes.json()

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayRuns = allRuns.filter(r => new Date(r.createdAt) >= today)
      const successCount = todayRuns.filter(r => r.status === 'success').length
      const rate = todayRuns.length > 0 ? Math.round((successCount / todayRuns.length) * 100) : 100

      setKpis({
        activeWorkflows: workflows.filter((w: { isActive: boolean }) => w.isActive).length,
        runsToday: todayRuns.length,
        successRate: rate,
        unreadNotifications: Array.isArray(notifData) ? notifData.length : 0,
      })
      setRuns(allRuns.slice(0, 10))
      setLoading(false)
    }
    load()
  }, [])

  const kpiCards = [
    { label: 'Active Workflows', value: kpis.activeWorkflows, icon: Zap, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Runs Today', value: kpis.runsToday, icon: TrendingUp, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Success Rate', value: `${kpis.successRate}%`, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Unread Notifications', value: kpis.unreadNotifications, icon: Bell, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ]

  const quickLinks = [
    { href: '/automation/workflows', label: 'Workflows', icon: GitBranch, desc: 'Build and manage automation workflows' },
    { href: '/automation/rules', label: 'Business Rules', icon: BookOpen, desc: 'Validation, calculation & visibility rules' },
    { href: '/automation/runs', label: 'Run History', icon: History, desc: 'View all workflow execution logs' },
    { href: '/automation/notifications', label: 'Notifications', icon: Bell, desc: 'Manage alerts and templates' },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <Zap className="w-6 h-6 text-blue-400" /> Automation Hub
        </h1>
        <p className="text-sm text-zinc-400 mt-1">Power Automate — Business Rules Engine</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpiCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">{label}</span>
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            <div className={`text-3xl font-bold ${color}`}>{loading ? '—' : value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-4">
        {quickLinks.map(({ href, label, icon: Icon, desc }) => (
          <Link key={href} href={href} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-blue-500/50 hover:bg-zinc-800/50 transition-colors group">
            <Icon className="w-6 h-6 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
            <div className="font-semibold text-zinc-100 text-sm">{label}</div>
            <div className="text-xs text-zinc-500 mt-1">{desc}</div>
          </Link>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="font-semibold text-zinc-100">Recent Workflow Runs</h2>
          <Link href="/automation/runs" className="text-xs text-blue-400 hover:text-blue-300">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Workflow</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Trigger</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions Run</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Duration</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-zinc-600">Loading...</td></tr>
              ) : runs.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-zinc-600">No runs yet. Create a workflow and run it.</td></tr>
              ) : runs.map(run => (
                <tr key={run.id} className="hover:bg-zinc-800/30">
                  <td className="px-5 py-3 font-medium text-zinc-200">{run.workflowName ?? '—'}</td>
                  <td className="px-5 py-3 text-zinc-400 font-mono text-xs">{run.trigger}</td>
                  <td className="px-5 py-3"><StatusBadge status={run.status} /></td>
                  <td className="px-5 py-3 text-zinc-400">{run.actionsRun}</td>
                  <td className="px-5 py-3 text-zinc-400">{run.duration != null ? `${run.duration}ms` : '—'}</td>
                  <td className="px-5 py-3 text-zinc-500 text-xs">{timeAgo(run.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
