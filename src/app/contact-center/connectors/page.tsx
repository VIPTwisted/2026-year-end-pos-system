'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type Connector = {
  id: string; name: string; connectorType: string; status: string
  lastSyncAt?: string | null; syncEnabled: boolean; createdAt: string; updatedAt: string
}

const STATUS_COLOR: Record<string, string> = {
  connected: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  disconnected: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
  error: 'bg-red-500/20 text-red-400 border border-red-500/30',
  syncing: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
}

const TYPE_LABEL: Record<string, string> = {
  salesforce: 'Salesforce',
  servicenow: 'ServiceNow',
  zendesk: 'Zendesk',
  dynamics: 'NovaPOS CRM',
  hubspot: 'HubSpot',
  custom: 'Custom',
}

export default function ConnectorsPage() {
  const [connectors, setConnectors] = useState<Connector[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string[]>([])
  const [search, setSearch] = useState('')

  const load = () => {
    setLoading(true)
    fetch('/api/contact-center/connectors')
      .then(r => r.json())
      .then(d => { setConnectors(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = connectors.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.connectorType.includes(search.toLowerCase())
  )

  const toggleSelect = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const handleSyncNow = async () => {
    // Mock sync action — in production would call sync endpoint
    alert('Sync triggered for selected connectors.')
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-white">
      {/* TopBar */}
      <div className="bg-[#16213e] border-b border-slate-700/50 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Link href="/contact-center" className="hover:text-white">Contact Center</Link>
          <span>/</span>
          <span className="text-white font-medium">CRM Connectors</span>
        </div>
        <div className="text-xs text-slate-500">{filtered.length} connector{filtered.length !== 1 ? 's' : ''}</div>
      </div>

      {/* Action Ribbon */}
      <div className="bg-[#16213e] border-b border-slate-700/50 px-6 py-2 flex items-center gap-2">
        <Link href="/contact-center/connectors/new">
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded font-medium">+ New</button>
        </Link>
        <button
          disabled={selected.length !== 1}
          className="text-xs px-3 py-1.5 rounded border border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Test Connection
        </button>
        <button
          onClick={handleSyncNow}
          disabled={selected.length === 0}
          className="text-xs px-3 py-1.5 rounded border border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Sync Now
        </button>
        <button
          onClick={load}
          className="text-xs px-3 py-1.5 rounded border border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          Refresh
        </button>
      </div>

      {/* Filter Pane */}
      <div className="bg-[#16213e]/60 border-b border-slate-700/30 px-6 py-3 flex items-center gap-4">
        <input
          type="text"
          placeholder="Search connectors..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-[#0f0f1a] border border-slate-700 rounded px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-64"
        />
      </div>

      {/* Table */}
      <div className="p-6">
        <div className="bg-[#16213e] rounded-lg border border-slate-700/50 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading connectors...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      className="rounded border-slate-600 bg-transparent"
                      checked={selected.length === filtered.length && filtered.length > 0}
                      onChange={() => setSelected(selected.length === filtered.length ? [] : filtered.map(c => c.id))}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Connector Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Last Sync</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Sync Enabled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500 text-sm">
                      No CRM connectors configured. <Link href="/contact-center/connectors/new" className="text-blue-400 hover:underline">Add one.</Link>
                    </td>
                  </tr>
                ) : filtered.map(c => (
                  <tr key={c.id} className={`hover:bg-slate-700/20 ${selected.includes(c.id) ? 'bg-blue-600/10' : ''}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggleSelect(c.id)} className="rounded border-slate-600 bg-transparent" />
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{c.name}</td>
                    <td className="px-4 py-3 text-slate-300">{TYPE_LABEL[c.connectorType] ?? c.connectorType}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_COLOR[c.status] ?? STATUS_COLOR.disconnected}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {c.lastSyncAt ? new Date(c.lastSyncAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${c.syncEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
                        {c.syncEnabled ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filtered.length} of {connectors.length} records</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded border border-slate-700 disabled:opacity-40" disabled>Previous</button>
            <button className="px-3 py-1 rounded border border-slate-700 disabled:opacity-40" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}
