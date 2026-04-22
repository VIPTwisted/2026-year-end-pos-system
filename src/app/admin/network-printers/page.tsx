'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Printer, Plus, Wifi, WifiOff, AlertTriangle } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { cn } from '@/lib/utils'

interface NetworkPrinter {
  id: string
  name: string
  description: string | null
  networkPath: string | null
  printerType: string
  status: string
  isDefault: boolean
  lastPingAt: string | null
  store: { id: string; name: string } | null
}

export const dynamic = 'force-dynamic'

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  inactive: 'bg-zinc-700/50 text-zinc-400 border-zinc-700',
  error: 'bg-red-500/10 text-red-400 border-red-500/20',
  offline: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
}

const TYPE_STYLES: Record<string, string> = {
  receipt: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  label: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  report: 'bg-green-500/10 text-green-400 border-green-500/20',
  invoice: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  document: 'bg-zinc-700/50 text-zinc-400 border-zinc-700',
}

export default function NetworkPrintersPage() {
  const [printers, setPrinters] = useState<NetworkPrinter[]>([])
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/network-printers')
      .then(r => r.json())
      .then(d => { setPrinters(d); setLoading(false) })
  }, [])

  async function testPrinter(id: string) {
    setTesting(id)
    const res = await fetch(`/api/admin/network-printers/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _action: 'test-connection' }),
    })
    if (res.ok) {
      const { printer } = await res.json()
      setPrinters(prev => prev.map(p => p.id === id ? { ...p, ...printer } : p))
    }
    setTesting(null)
  }

  const total = printers.length
  const active = printers.filter(p => p.status === 'active').length
  const offline = printers.filter(p => p.status === 'offline').length
  const error = printers.filter(p => p.status === 'error').length

  return (
    <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-screen">
      <TopBar
        title="Network Printers"
        breadcrumb={[{ label: 'Admin', href: '/admin/users' }]}
        actions={
          <Link href="/admin/network-printers/new"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors">
            <Plus className="w-3 h-3" /> Add Printer
          </Link>
        }
      />

      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Printers', value: total, color: 'text-blue-400', icon: Printer },
            { label: 'Active', value: active, color: 'text-emerald-400', icon: Wifi },
            { label: 'Offline', value: offline, color: 'text-amber-400', icon: WifiOff },
            { label: 'Error', value: error, color: 'text-red-400', icon: AlertTriangle },
          ].map(k => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <k.icon className={`w-4 h-4 ${k.color}`} />
                <span className="text-xs text-zinc-500">{k.label}</span>
              </div>
              <div className="text-2xl font-bold text-zinc-100">{k.value}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Name</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Type</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Network Path</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Store</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Status</th>
                  <th className="text-left px-4 py-3 font-medium uppercase tracking-widest">Last Ping</th>
                  <th className="text-right px-4 py-3 font-medium uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {loading ? (
                  <tr><td colSpan={7} className="py-16 text-center text-zinc-600">Loading...</td></tr>
                ) : printers.length === 0 ? (
                  <tr><td colSpan={7} className="py-16 text-center text-zinc-600">
                    <Printer className="w-8 h-8 mx-auto mb-2 opacity-30" />No printers configured
                  </td></tr>
                ) : printers.map(p => (
                  <tr key={p.id} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-zinc-200">{p.name}</div>
                      {p.isDefault && <span className="text-[10px] text-blue-400">Default</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium border capitalize', TYPE_STYLES[p.printerType] ?? TYPE_STYLES.document)}>
                        {p.printerType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 font-mono">{p.networkPath ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-400">{p.store?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium border capitalize', STATUS_STYLES[p.status] ?? STATUS_STYLES.inactive)}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {p.lastPingAt ? new Date(p.lastPingAt).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => testPrinter(p.id)} disabled={testing === p.id}
                        className="flex items-center gap-1 px-2.5 py-1 text-[10px] bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-600/30 rounded transition-colors ml-auto disabled:opacity-50">
                        <Wifi className="w-3 h-3" /> {testing === p.id ? 'Testing...' : 'Test'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
