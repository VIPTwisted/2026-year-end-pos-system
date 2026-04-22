'use client'
import { useEffect, useState, useCallback } from 'react'
import { PieChart, Plus, X, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Segment {
  id: string
  segmentName: string
  description: string | null
  segmentType: string
  memberCount: number
  lastRefreshedAt: string | null
  isActive: boolean
  _count: { members: number }
}

const TYPE_TABS = ['All', 'Static', 'Dynamic']
const BLANK = { segmentName: '', description: '', segmentType: 'static', queryJson: '', isActive: true }

export default function SegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [refreshing, setRefreshing] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/customer-insights/segments')
      .then(r => r.json())
      .then(d => { setSegments(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = tab === 'All' ? segments : segments.filter(s => s.segmentType.toLowerCase() === tab.toLowerCase())

  function setF(k: string, v: string | boolean) { setForm(f => ({ ...f, [k]: v })) }

  async function save() {
    await fetch('/api/customer-insights/segments', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    setShowModal(false)
    setForm(BLANK)
    load()
  }

  async function refresh(id: string) {
    setRefreshing(id)
    await fetch(`/api/customer-insights/segments/${id}/refresh`, { method: 'POST' })
    setRefreshing(null)
    load()
  }

  async function toggleActive(seg: Segment) {
    setToggling(seg.id)
    await fetch(`/api/customer-insights/segments/${seg.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !seg.isActive }),
    })
    setToggling(null)
    load()
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PieChart className="w-5 h-5 text-purple-400" />
          <h1 className="text-xl font-bold">Segments</h1>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-sm px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Segment
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
        {TYPE_TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn('px-3 py-1.5 text-sm rounded-md transition-colors', tab === t ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200')}>{t}</button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Name</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Type</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Members</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Last Refreshed</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Active</th>
              <th className="text-right text-zinc-400 font-medium px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-zinc-500">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-zinc-500">No segments</td></tr>
            ) : filtered.map(seg => (
              <tr key={seg.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-zinc-100">{seg.segmentName}</div>
                  {seg.description && <div className="text-xs text-zinc-500 mt-0.5">{seg.description}</div>}
                </td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs px-2 py-0.5 rounded border capitalize',
                    seg.segmentType === 'dynamic' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-zinc-700/50 text-zinc-400 border-zinc-600/30'
                  )}>{seg.segmentType}</span>
                </td>
                <td className="px-4 py-3 text-zinc-300 font-mono">{(seg._count?.members ?? seg.memberCount).toLocaleString()}</td>
                <td className="px-4 py-3 text-zinc-400 text-xs">
                  {seg.lastRefreshedAt ? new Date(seg.lastRefreshedAt).toLocaleString() : '—'}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(seg)}
                    disabled={toggling === seg.id}
                    className={cn('w-10 h-5 rounded-full transition-colors relative', seg.isActive ? 'bg-emerald-500' : 'bg-zinc-700')}
                  >
                    <div className={cn('absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all', seg.isActive ? 'left-5' : 'left-0.5')} />
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => refresh(seg.id)}
                    disabled={refreshing === seg.id}
                    className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 disabled:opacity-50 ml-auto transition-colors"
                  >
                    <RefreshCw className={cn('w-3.5 h-3.5', refreshing === seg.id && 'animate-spin')} />
                    {refreshing === seg.id ? 'Refreshing...' : 'Refresh'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">New Segment</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-200"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Segment Name</label>
                <input value={form.segmentName} onChange={e => setF('segmentName', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Description</label>
                <input value={form.description} onChange={e => setF('description', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Type</label>
                <select value={form.segmentType} onChange={e => setF('segmentType', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500">
                  <option value="static">Static</option>
                  <option value="dynamic">Dynamic</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Query JSON (optional)</label>
                <textarea value={form.queryJson} onChange={e => setF('queryJson', e.target.value)} rows={3} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-purple-500 resize-none" placeholder='{"filters":[{"field":"totalSpend","op":"gt","value":1000}]}' />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm py-2 rounded-lg transition-colors">Cancel</button>
              <button onClick={save} disabled={!form.segmentName} className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm py-2 rounded-lg transition-colors">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
