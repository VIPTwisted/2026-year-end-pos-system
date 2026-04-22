'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Monitor, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Register {
  id: string; registerNumber: string; storeName: string | null; terminalType: string
  status: string; lastActivityAt: string | null; drawerLimit: number; isActive: boolean
  hardwareProfile: { profileName: string } | null
}

const STATUS_DOT: Record<string, string> = {
  online: 'bg-emerald-500 animate-pulse shadow-[0_0_6px_#10b981]',
  offline: 'bg-zinc-600',
  suspended: 'bg-amber-500',
}

export default function RegistersPage() {
  const [registers, setRegisters] = useState<Register[]>([])
  const [filter, setFilter] = useState({ store: '', status: '', type: '' })

  useEffect(() => {
    const q = new URLSearchParams()
    if (filter.store) q.set('storeId', filter.store)
    if (filter.status) q.set('status', filter.status)
    if (filter.type) q.set('terminalType', filter.type)
    fetch(`/api/registers?${q}`).then(r => r.json()).then(setRegisters)
  }, [filter])

  return (
    <main className="flex-1 p-6 bg-zinc-950 overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">Registers</h2>
          <p className="text-xs text-zinc-500 mt-0.5">{registers.length} registers</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors">
          <Plus className="w-3 h-3" /> New Register
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <input placeholder="Filter by store..." value={filter.store} onChange={e => setFilter(p => ({ ...p, store: e.target.value }))}
          className="px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-700 rounded text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 w-44" />
        <select value={filter.status} onChange={e => setFilter(p => ({ ...p, status: e.target.value }))} className="px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-700 rounded text-zinc-300 focus:outline-none">
          <option value="">All statuses</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="suspended">Suspended</option>
        </select>
        <select value={filter.type} onChange={e => setFilter(p => ({ ...p, type: e.target.value }))} className="px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-700 rounded text-zinc-300 focus:outline-none">
          <option value="">All types</option>
          <option value="POS">POS</option>
          <option value="MPOS">MPOS</option>
          <option value="CPOS">CPOS</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500">
              <th className="text-left pb-2 font-medium uppercase tracking-widest pr-4">Status</th>
              <th className="text-left pb-2 font-medium uppercase tracking-widest pr-4">Register #</th>
              <th className="text-left pb-2 font-medium uppercase tracking-widest pr-4">Store</th>
              <th className="text-left pb-2 font-medium uppercase tracking-widest pr-4">Type</th>
              <th className="text-left pb-2 font-medium uppercase tracking-widest pr-4">Hardware Profile</th>
              <th className="text-left pb-2 font-medium uppercase tracking-widest pr-4">Drawer Limit</th>
              <th className="text-left pb-2 font-medium uppercase tracking-widest">Last Activity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {registers.length === 0 ? (
              <tr><td colSpan={7} className="py-16 text-center text-zinc-600">
                <Monitor className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No registers found
              </td></tr>
            ) : registers.map(reg => (
              <tr key={reg.id} className="hover:bg-zinc-900/50">
                <td className="py-2.5 pr-4">
                  <div className={cn('w-2 h-2 rounded-full', STATUS_DOT[reg.status] ?? STATUS_DOT.offline)} />
                </td>
                <td className="py-2.5 pr-4">
                  <Link href={`/channels/registers/${reg.id}`} className="text-blue-400 hover:text-blue-300 font-mono">{reg.registerNumber}</Link>
                </td>
                <td className="py-2.5 pr-4 text-zinc-400">{reg.storeName ?? '—'}</td>
                <td className="py-2.5 pr-4 text-zinc-400">{reg.terminalType}</td>
                <td className="py-2.5 pr-4 text-zinc-500">{reg.hardwareProfile?.profileName ?? '—'}</td>
                <td className="py-2.5 pr-4 text-zinc-400">${reg.drawerLimit.toFixed(0)}</td>
                <td className="py-2.5 text-zinc-500">{reg.lastActivityAt ? new Date(reg.lastActivityAt).toLocaleString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
