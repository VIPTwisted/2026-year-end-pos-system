'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

type IVRFlow = {
  id: string
  name: string
  description?: string | null
  phoneNumber?: string | null
  status: string
  createdAt: string
  updatedAt: string
}

const STATUS_COLOR: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  draft: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  inactive: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
}

export default function IvrFlowsPage() {
  const router = useRouter()
  const [flows, setFlows] = useState<IVRFlow[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortField, setSortField] = useState<keyof IVRFlow>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetch('/api/contact-center/ivr-flows')
      .then(r => r.json())
      .then(d => { setFlows(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleSort = (field: keyof IVRFlow) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const filtered = flows
    .filter(f => statusFilter === 'all' || f.status === statusFilter)
    .filter(f => !search || f.name.toLowerCase().includes(search.toLowerCase()) || (f.phoneNumber ?? '').includes(search))
    .sort((a, b) => {
      const av = a[sortField] ?? ''
      const bv = b[sortField] ?? ''
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
    })

  const toggleSelect = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const handleActivate = async () => {
    for (const id of selected) {
      await fetch(`/api/contact-center/ivr-flows/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' }),
      })
    }
    const updated = await fetch('/api/contact-center/ivr-flows').then(r => r.json())
    setFlows(updated); setSelected([])
  }

  const handleDeactivate = async () => {
    for (const id of selected) {
      await fetch(`/api/contact-center/ivr-flows/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'inactive' }),
      })
    }
    const updated = await fetch('/api/contact-center/ivr-flows').then(r => r.json())
    setFlows(updated); setSelected([])
  }

  const SortIcon = ({ field }: { field: keyof IVRFlow }) => (
    <span className="ml-1 text-slate-500">
      {sortField === field ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  )

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-white">
      {/* TopBar */}
      <div className="bg-[#16213e] border-b border-slate-700/50 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Link href="/contact-center" className="hover:text-white transition-colors">Contact Center</Link>
          <span>/</span>
          <span className="text-white font-medium">IVR Flows</span>
        </div>
        <div className="text-xs text-slate-500">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</div>
      </div>

      {/* Action Ribbon */}
      <div className="bg-[#16213e] border-b border-slate-700/50 px-6 py-2 flex items-center gap-2">
        <Link href="/contact-center/ivr-flows/new">
          <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded transition-colors font-medium">
            + New
          </button>
        </Link>
        <button
          onClick={() => selected.length === 1 && router.push(`/contact-center/ivr-flows/${selected[0]}`)}
          disabled={selected.length !== 1}
          className="text-xs px-3 py-1.5 rounded border border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Edit
        </button>
        <button
          onClick={handleActivate}
          disabled={selected.length === 0}
          className="text-xs px-3 py-1.5 rounded border border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Activate
        </button>
        <button
          onClick={handleDeactivate}
          disabled={selected.length === 0}
          className="text-xs px-3 py-1.5 rounded border border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Deactivate
        </button>
        <button
          disabled={selected.length !== 1}
          className="text-xs px-3 py-1.5 rounded border border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Test
        </button>
      </div>

      {/* Filter Pane */}
      <div className="bg-[#16213e]/60 border-b border-slate-700/30 px-6 py-3 flex items-center gap-4">
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-[#0f0f1a] border border-slate-700 rounded px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-64"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-[#0f0f1a] border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="p-6">
        <div className="bg-[#16213e] rounded-lg border border-slate-700/50 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading IVR flows...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="w-10 px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      className="rounded border-slate-600 bg-transparent"
                      checked={selected.length === filtered.length && filtered.length > 0}
                      onChange={() => setSelected(selected.length === filtered.length ? [] : filtered.map(f => f.id))}
                    />
                  </th>
                  {([
                    ['id', 'Flow ID'],
                    ['name', 'Name'],
                    ['phoneNumber', 'Entry Point'],
                    ['status', 'Status'],
                    ['createdAt', 'Created Date'],
                    ['updatedAt', 'Last Modified'],
                  ] as [keyof IVRFlow, string][]).map(([field, label]) => (
                    <th
                      key={field}
                      className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white select-none"
                      onClick={() => handleSort(field)}
                    >
                      {label}<SortIcon field={field} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-sm">
                      No IVR flows found. <Link href="/contact-center/ivr-flows/new" className="text-blue-400 hover:underline">Create the first one.</Link>
                    </td>
                  </tr>
                ) : filtered.map(flow => (
                  <tr
                    key={flow.id}
                    className={`hover:bg-slate-700/20 transition-colors ${selected.includes(flow.id) ? 'bg-blue-600/10' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(flow.id)}
                        onChange={() => toggleSelect(flow.id)}
                        className="rounded border-slate-600 bg-transparent"
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{flow.id.slice(0, 8)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/contact-center/ivr-flows/${flow.id}`} className="text-blue-400 hover:text-blue-300 font-medium hover:underline">
                        {flow.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{flow.phoneNumber ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_COLOR[flow.status] ?? STATUS_COLOR.inactive}`}>
                        {flow.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{new Date(flow.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{new Date(flow.updatedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination stub */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filtered.length} of {flows.length} records</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded border border-slate-700 hover:bg-slate-700 disabled:opacity-40" disabled>Previous</button>
            <button className="px-3 py-1 rounded border border-slate-700 hover:bg-slate-700 disabled:opacity-40" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}
