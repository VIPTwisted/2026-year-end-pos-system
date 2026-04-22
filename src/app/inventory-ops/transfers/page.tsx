'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeftRight, Plus } from 'lucide-react'

type Transfer = {
  id: string
  transferNumber: string
  fromLocation: string | null
  toLocation: string | null
  priority: string
  status: string
  lines: unknown[]
  createdAt: string
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-zinc-700 text-zinc-300',
  approved: 'bg-blue-500/20 text-blue-400',
  shipped: 'bg-purple-500/20 text-purple-400',
  received: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-500/20 text-red-400',
  high: 'bg-orange-500/20 text-orange-400',
  normal: 'bg-zinc-700 text-zinc-400',
  low: 'bg-zinc-800 text-zinc-500',
}

const TABS = ['all', 'draft', 'approved', 'shipped', 'received']

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const load = async (status?: string) => {
    setLoading(true)
    const url = status && status !== 'all' ? `/api/inventory/outbound-transfers?status=${status}` : '/api/inventory/outbound-transfers'
    const res = await fetch(url)
    const data = await res.json()
    setTransfers(data)
    setLoading(false)
  }

  useEffect(() => { load(activeTab) }, [activeTab])

  const approve = async (id: string) => {
    setActionLoading(id)
    await fetch(`/api/inventory/outbound-transfers/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvedBy: 'Manager' }),
    })
    setActionLoading(null)
    load(activeTab)
  }

  const ship = async (id: string) => {
    setActionLoading(id)
    await fetch(`/api/inventory/outbound-transfers/${id}/ship`, { method: 'POST' })
    setActionLoading(null)
    load(activeTab)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ArrowLeftRight className="w-6 h-6 text-purple-400" />
          <h1 className="text-2xl font-bold text-zinc-100">Transfers</h1>
        </div>
        <Link href="/inventory-ops/transfers/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Transfer
        </Link>
      </div>

      <div className="flex gap-2">
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${activeTab === t ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              {['Transfer #', 'From', 'To', 'Priority', 'Lines', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-zinc-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-600">Loading...</td></tr>
            ) : transfers.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-600">No transfers found</td></tr>
            ) : transfers.map(t => (
              <tr key={t.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                <td className="px-4 py-3">
                  <Link href={`/inventory-ops/transfers/${t.id}`} className="font-mono text-blue-400 hover:text-blue-300">{t.transferNumber}</Link>
                </td>
                <td className="px-4 py-3 text-zinc-400">{t.fromLocation || '—'}</td>
                <td className="px-4 py-3 text-zinc-400">{t.toLocation || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${PRIORITY_COLORS[t.priority] || 'bg-zinc-700 text-zinc-400'}`}>{t.priority}</span>
                </td>
                <td className="px-4 py-3 text-zinc-400">{(t.lines as unknown[]).length}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${STATUS_COLORS[t.status] || 'bg-zinc-700 text-zinc-300'}`}>{t.status}</span>
                </td>
                <td className="px-4 py-3">
                  {t.status === 'draft' && (
                    <button onClick={() => approve(t.id)} disabled={actionLoading === t.id}
                      className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded disabled:opacity-50">
                      {actionLoading === t.id ? '...' : 'Approve'}
                    </button>
                  )}
                  {t.status === 'approved' && (
                    <button onClick={() => ship(t.id)} disabled={actionLoading === t.id}
                      className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded disabled:opacity-50">
                      {actionLoading === t.id ? '...' : 'Ship'}
                    </button>
                  )}
                  {['shipped', 'received', 'cancelled'].includes(t.status) && (
                    <Link href={`/inventory-ops/transfers/${t.id}`} className="text-xs text-zinc-400 hover:text-zinc-200">View</Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
