'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { GitBranch, Settings2, Play, Ban, CheckCircle2, Loader2, X } from 'lucide-react'

interface Run {
  id: string
  profileName: string
  status: string
  ordersIn: number
  ordersRouted: number
  ordersFailed: number
  duration: number | null
  runAt: string
}

interface Profile {
  id: string
  name: string
}

export default function DomHubPage() {
  const [runs, setRuns] = useState<Run[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [exclusionCount, setExclusionCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [showProfilePicker, setShowProfilePicker] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<string>('')
  const [runResult, setRunResult] = useState<{ run: Run; profileName: string } | null>(null)

  async function load() {
    setLoading(true)
    try {
      const [runsRes, profRes, exclRes] = await Promise.all([
        fetch('/api/dom/runs?limit=10'),
        fetch('/api/dom/profiles'),
        fetch('/api/dom/exclusions'),
      ])
      const runsData = await runsRes.json()
      const profData = await profRes.json()
      const exclData = await exclRes.json()
      setRuns(runsData.runs ?? [])
      setProfiles(Array.isArray(profData) ? profData : [])
      setExclusionCount(Array.isArray(exclData) ? exclData.filter((e: { isActive: boolean }) => e.isActive).length : 0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function runDom() {
    if (!selectedProfile) return
    setRunning(true)
    setShowProfilePicker(false)
    try {
      const res = await fetch(`/api/dom/profiles/${selectedProfile}/run`, { method: 'POST' })
      const data = await res.json()
      setRunResult(data)
      load()
    } finally {
      setRunning(false)
    }
  }

  const lastRun = runs[0]
  const lastRoutedPct = lastRun && lastRun.ordersIn > 0
    ? Math.round((lastRun.ordersRouted / lastRun.ordersIn) * 100)
    : 0

  const kpis = [
    { label: 'Active DOM Profiles', value: profiles.length, icon: Settings2, color: 'text-blue-400' },
    { label: 'Last Run Orders', value: lastRun?.ordersIn ?? 0, icon: GitBranch, color: 'text-violet-400' },
    { label: 'Last Run Success Rate', value: `${lastRoutedPct}%`, icon: CheckCircle2, color: 'text-emerald-400' },
    { label: 'Active Exclusions', value: exclusionCount, icon: Ban, color: 'text-red-400' },
  ]

  function statusBadge(status: string) {
    if (status === 'completed') return <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-900/50 text-emerald-400">Completed</span>
    if (status === 'running') return <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-900/50 text-blue-400">Running</span>
    return <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-900/50 text-red-400">Failed</span>
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-600/20 rounded-xl flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Distributed Order Management</h1>
            <p className="text-sm text-zinc-500">Intelligent order routing across fulfillment nodes</p>
          </div>
        </div>
        <button
          onClick={() => setShowProfilePicker(true)}
          disabled={running || profiles.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          Run DOM Now
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <k.icon className={`w-4 h-4 ${k.color}`} />
              <span className="text-xs text-zinc-500">{k.label}</span>
            </div>
            <div className="text-2xl font-bold text-zinc-100">{loading ? '—' : k.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Link href="/dom/profiles" className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 flex items-center gap-3 transition-colors group">
          <Settings2 className="w-5 h-5 text-blue-400" />
          <div>
            <div className="text-sm font-medium text-zinc-100 group-hover:text-white">DOM Profiles</div>
            <div className="text-xs text-zinc-500">Manage routing configurations</div>
          </div>
        </Link>
        <Link href="/dom/runs" className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 flex items-center gap-3 transition-colors group">
          <Play className="w-5 h-5 text-violet-400" />
          <div>
            <div className="text-sm font-medium text-zinc-100 group-hover:text-white">Run History</div>
            <div className="text-xs text-zinc-500">View all DOM run results</div>
          </div>
        </Link>
        <Link href="/dom/exclusions" className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 flex items-center gap-3 transition-colors group">
          <Ban className="w-5 h-5 text-red-400" />
          <div>
            <div className="text-sm font-medium text-zinc-100 group-hover:text-white">Exclusions</div>
            <div className="text-xs text-zinc-500">Location exclusion rules</div>
          </div>
        </Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-100">Recent DOM Runs</h2>
          <Link href="/dom/runs" className="text-xs text-blue-400 hover:text-blue-300">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-zinc-500 border-b border-zinc-800">
                <th className="px-4 py-2 font-medium">Run ID</th>
                <th className="px-4 py-2 font-medium">Profile</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Orders In</th>
                <th className="px-4 py-2 font-medium">Routed</th>
                <th className="px-4 py-2 font-medium">Failed</th>
                <th className="px-4 py-2 font-medium">Duration</th>
                <th className="px-4 py-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-zinc-600">Loading...</td></tr>
              ) : runs.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-zinc-600">No runs yet.</td></tr>
              ) : runs.map((run) => (
                <tr key={run.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-2.5">
                    <Link href={`/dom/runs/${run.id}`} className="text-blue-400 hover:text-blue-300 font-mono text-xs">
                      {run.id.slice(0, 12)}…
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-zinc-300">{run.profileName}</td>
                  <td className="px-4 py-2.5">{statusBadge(run.status)}</td>
                  <td className="px-4 py-2.5 text-zinc-300">{run.ordersIn}</td>
                  <td className="px-4 py-2.5 text-emerald-400">{run.ordersRouted}</td>
                  <td className="px-4 py-2.5 text-red-400">{run.ordersFailed}</td>
                  <td className="px-4 py-2.5 text-zinc-400">{run.duration != null ? `${run.duration}ms` : '—'}</td>
                  <td className="px-4 py-2.5 text-zinc-500 text-xs">{new Date(run.runAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showProfilePicker && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-96 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-zinc-100">Select DOM Profile</h3>
              <button onClick={() => setShowProfilePicker(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-4 h-4" /></button>
            </div>
            <select value={selectedProfile} onChange={(e) => setSelectedProfile(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:border-violet-500">
              <option value="">Choose profile…</option>
              {profiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setShowProfilePicker(false)} className="flex-1 px-4 py-2 border border-zinc-700 text-zinc-300 hover:text-zinc-100 rounded-lg text-sm transition-colors">Cancel</button>
              <button onClick={runDom} disabled={!selectedProfile}
                className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors">
                Run DOM
              </button>
            </div>
          </div>
        </div>
      )}

      {runResult && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col mx-4">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-zinc-100">DOM Run Complete</h3>
                <p className="text-xs text-zinc-500">Profile: {runResult.profileName} · {runResult.run.duration}ms</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center"><div className="text-lg font-bold text-emerald-400">{runResult.run.ordersRouted}</div><div className="text-xs text-zinc-500">Routed</div></div>
                <div className="text-center"><div className="text-lg font-bold text-red-400">{runResult.run.ordersFailed}</div><div className="text-xs text-zinc-500">Failed</div></div>
                <button onClick={() => setRunResult(null)} className="text-zinc-500 hover:text-zinc-300 ml-2"><X className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 p-4 text-xs text-zinc-400 text-center">
              Run complete. <Link href={`/dom/runs/${runResult.run.id}`} className="text-blue-400 hover:text-blue-300">View full results →</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
