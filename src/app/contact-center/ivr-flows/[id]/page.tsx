'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export const dynamic = 'force-dynamic'

type IvrNode = { id: string; stepNo: number; nodeType: string; configJson?: string | null }
type IvrRun = { id: string; callerNum?: string | null; startedAt: string; endedAt?: string | null; outcome?: string | null }
type FlowDetail = {
  id: string; name: string; phoneNumber?: string | null; status: string
  description?: string | null; stepsJson?: string | null; createdAt: string; updatedAt: string
  nodes: IvrNode[]; runs: IvrRun[]
}

const STATUS_COLOR: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  draft: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  inactive: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
}

const OUTCOME_COLOR: Record<string, string> = {
  completed: 'text-emerald-400',
  abandoned: 'text-red-400',
  transferred: 'text-blue-400',
  error: 'text-yellow-400',
}

export default function IvrFlowDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [flow, setFlow] = useState<FlowDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'general' | 'nodes' | 'stats'>('general')
  const [saving, setSaving] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editStatus, setEditStatus] = useState('')

  useEffect(() => {
    fetch(`/api/contact-center/ivr-flows/${id}`)
      .then(r => r.json())
      .then(d => {
        setFlow(d)
        setEditName(d.name)
        setEditPhone(d.phoneNumber ?? '')
        setEditStatus(d.status)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    await fetch(`/api/contact-center/ivr-flows/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName, phoneNumber: editPhone || null, status: editStatus }),
    })
    const updated = await fetch(`/api/contact-center/ivr-flows/${id}`).then(r => r.json())
    setFlow(updated)
    setSaving(false)
  }

  const stats = flow ? {
    total: flow.runs.length,
    handled: flow.runs.filter(r => r.outcome === 'completed').length,
    abandoned: flow.runs.filter(r => r.outcome === 'abandoned').length,
    avgHandleTime: (() => {
      const times = flow.runs.filter(r => r.endedAt).map(r =>
        (new Date(r.endedAt!).getTime() - new Date(r.startedAt).getTime()) / 1000
      )
      return times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0
    })(),
  } : null

  if (loading) return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-white flex items-center justify-center">
      <div className="text-slate-400">Loading...</div>
    </div>
  )

  if (!flow) return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-white flex items-center justify-center">
      <div className="text-red-400">IVR Flow not found.</div>
    </div>
  )

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-white">
      {/* TopBar */}
      <div className="bg-[#16213e] border-b border-slate-700/50 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Link href="/contact-center" className="hover:text-white">Contact Center</Link>
          <span>/</span>
          <Link href="/contact-center/ivr-flows" className="hover:text-white">IVR Flows</Link>
          <span>/</span>
          <span className="text-white font-medium">{flow.name}</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_COLOR[flow.status] ?? STATUS_COLOR.inactive}`}>
          {flow.status}
        </span>
      </div>

      {/* Action Ribbon */}
      <div className="bg-[#16213e] border-b border-slate-700/50 px-6 py-2 flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs px-4 py-1.5 rounded font-medium"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <Link href="/contact-center/ivr-flows">
          <button className="text-xs px-3 py-1.5 rounded border border-slate-600 text-slate-300 hover:bg-slate-700">
            Back
          </button>
        </Link>
      </div>

      <div className="p-6 flex gap-6">
        {/* Main area */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* FastTab headers */}
          <div className="flex gap-1 border-b border-slate-700/50">
            {(['general', 'nodes', 'stats'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-medium capitalize transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'nodes' ? 'Flow Nodes' : tab === 'stats' ? 'Call Statistics' : 'General'}
              </button>
            ))}
          </div>

          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="bg-[#16213e] rounded-lg border border-slate-700/50 p-5 grid grid-cols-2 gap-5">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Flow Name</label>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-[#0f0f1a] border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Phone Number</label>
                <input
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  className="w-full bg-[#0f0f1a] border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Status</label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value)}
                  className="w-full bg-[#0f0f1a] border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Created</label>
                <div className="text-sm text-slate-300">{new Date(flow.createdAt).toLocaleString()}</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Last Modified</label>
                <div className="text-sm text-slate-300">{new Date(flow.updatedAt).toLocaleString()}</div>
              </div>
            </div>
          )}

          {/* Nodes Tab */}
          {activeTab === 'nodes' && (
            <div className="bg-[#16213e] rounded-lg border border-slate-700/50 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Step</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Node Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Configuration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {flow.nodes.length === 0 ? (
                    <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-500 text-sm">No nodes configured.</td></tr>
                  ) : flow.nodes.map(node => (
                    <tr key={node.id} className="hover:bg-slate-700/20">
                      <td className="px-4 py-3 text-slate-400 text-xs">{node.stepNo}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">
                          {node.nodeType}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-400">{node.configJson ?? '{}'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && stats && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Total Calls', value: stats.total },
                  { label: 'Handled', value: stats.handled },
                  { label: 'Abandoned', value: stats.abandoned },
                  { label: 'Avg Handle Time', value: `${stats.avgHandleTime}s` },
                ].map(kpi => (
                  <div key={kpi.label} className="bg-[#16213e] rounded-lg border border-slate-700/50 p-4 text-center">
                    <div className="text-2xl font-bold text-white">{kpi.value}</div>
                    <div className="text-xs text-slate-400 mt-1">{kpi.label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-[#16213e] rounded-lg border border-slate-700/50 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-700/50 text-xs font-medium text-slate-400">Recent Runs</div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">Caller</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">Started</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">Duration</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">Outcome</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {flow.runs.slice(0, 50).map(run => (
                      <tr key={run.id} className="hover:bg-slate-700/20">
                        <td className="px-4 py-2 text-slate-300 text-xs">{run.callerNum ?? 'Unknown'}</td>
                        <td className="px-4 py-2 text-slate-400 text-xs">{new Date(run.startedAt).toLocaleString()}</td>
                        <td className="px-4 py-2 text-slate-400 text-xs">
                          {run.endedAt ? `${Math.round((new Date(run.endedAt).getTime() - new Date(run.startedAt).getTime()) / 1000)}s` : '—'}
                        </td>
                        <td className={`px-4 py-2 text-xs capitalize ${OUTCOME_COLOR[run.outcome ?? ''] ?? 'text-slate-400'}`}>
                          {run.outcome ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* FactBox Sidebar */}
        <div className="w-64 shrink-0 space-y-4">
          <div className="bg-[#16213e] rounded-lg border border-slate-700/50 p-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3">Flow Summary</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-slate-400">Nodes</span><span className="text-white">{flow.nodes.length}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Total Runs</span><span className="text-white">{flow.runs.length}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Status</span><span className="capitalize text-white">{flow.status}</span></div>
            </div>
          </div>
          <div className="bg-[#16213e] rounded-lg border border-slate-700/50 p-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3">Quick Actions</h4>
            <div className="space-y-2">
              <button className="w-full text-left text-xs text-slate-300 hover:text-white py-1 px-2 rounded hover:bg-slate-700 transition-colors">
                Test Flow
              </button>
              <button className="w-full text-left text-xs text-slate-300 hover:text-white py-1 px-2 rounded hover:bg-slate-700 transition-colors">
                Clone Flow
              </button>
              <button className="w-full text-left text-xs text-red-400 hover:text-red-300 py-1 px-2 rounded hover:bg-slate-700 transition-colors">
                Delete Flow
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
