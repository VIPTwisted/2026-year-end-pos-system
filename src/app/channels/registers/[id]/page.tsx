'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { ChevronLeft, Monitor, Play, Square, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Register {
  id: string; registerNumber: string; storeName: string | null; terminalType: string
  status: string; lastActivityAt: string | null; drawerLimit: number; isActive: boolean
  hardwareProfile: { profileName: string } | null
  shifts: Array<{ id: string; shiftNumber: string; cashierName: string | null; openedAt: string; closedAt: string | null; openingFloat: number; closingFloat: number | null; netSales: number; transactions: number; status: string }>
}

export default function RegisterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [reg, setReg] = useState<Register | null>(null)
  const [showOpen, setShowOpen] = useState(false)
  const [showClose, setShowClose] = useState(false)
  const [openForm, setOpenForm] = useState({ cashierName: '', openingFloat: '' })
  const [closeForm, setCloseForm] = useState({ closingFloat: '', netSales: '', transactions: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetch(`/api/registers/${id}`).then(r => r.json()).then(setReg) }, [id])

  async function openShift() {
    setLoading(true)
    await fetch(`/api/registers/${id}/open-shift`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cashierName: openForm.cashierName, openingFloat: parseFloat(openForm.openingFloat) || 0 }) })
    const fresh = await fetch(`/api/registers/${id}`).then(r => r.json())
    setReg(fresh); setShowOpen(false); setLoading(false)
  }

  async function closeShift() {
    setLoading(true)
    await fetch(`/api/registers/${id}/close-shift`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ closingFloat: parseFloat(closeForm.closingFloat) || 0, netSales: parseFloat(closeForm.netSales) || 0, transactions: parseInt(closeForm.transactions) || 0 }) })
    const fresh = await fetch(`/api/registers/${id}`).then(r => r.json())
    setReg(fresh); setShowClose(false); setLoading(false)
  }

  if (!reg) return <main className="flex-1 p-6 bg-zinc-950"><div className="animate-pulse"><div className="h-6 bg-zinc-800 rounded w-48" /></div></main>

  const hasOpenShift = reg.shifts.some(s => s.status === 'open')

  return (
    <main className="flex-1 p-6 bg-zinc-950 overflow-auto space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Link href="/channels/registers" className="text-zinc-500 hover:text-zinc-300 flex items-center gap-1 text-xs"><ChevronLeft className="w-3 h-3" /> Registers</Link>
          <span className="text-zinc-700">/</span>
          <h1 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <Monitor className="w-4 h-4 text-zinc-500" /> {reg.registerNumber}
          </h1>
          <span className={cn('px-2 py-0.5 rounded text-xs font-medium', reg.status === 'online' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500')}>
            {reg.status}
          </span>
        </div>
        <div className="flex gap-2">
          {!hasOpenShift ? (
            <button onClick={() => setShowOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors">
              <Play className="w-3 h-3" /> Open Shift
            </button>
          ) : (
            <button onClick={() => setShowClose(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-700 hover:bg-red-600 text-white rounded transition-colors">
              <Square className="w-3 h-3" /> Close Shift
            </button>
          )}
        </div>
      </div>

      {/* Register info */}
      <section>
        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Register Details</p>
        <div className="grid grid-cols-3 gap-4 bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          {[
            { label: 'Register #', value: reg.registerNumber },
            { label: 'Store', value: reg.storeName ?? '—' },
            { label: 'Terminal Type', value: reg.terminalType },
            { label: 'Hardware Profile', value: reg.hardwareProfile?.profileName ?? '—' },
            { label: 'Drawer Limit', value: `$${reg.drawerLimit}` },
            { label: 'Last Activity', value: reg.lastActivityAt ? new Date(reg.lastActivityAt).toLocaleString() : '—' },
          ].map(item => (
            <div key={item.label}>
              <div className="text-xs text-zinc-500 mb-0.5">{item.label}</div>
              <div className="text-xs text-zinc-200">{item.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Shift Management */}
      <section>
        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Shift History</p>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Shift #</th>
                <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Cashier</th>
                <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Opened</th>
                <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Closed</th>
                <th className="text-right px-4 py-2 font-medium uppercase tracking-widest">Opening</th>
                <th className="text-right px-4 py-2 font-medium uppercase tracking-widest">Net Sales</th>
                <th className="text-right px-4 py-2 font-medium uppercase tracking-widest">Txns</th>
                <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {reg.shifts.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-zinc-600">No shifts yet</td></tr>
              ) : reg.shifts.map(s => (
                <tr key={s.id} className="hover:bg-zinc-800/30">
                  <td className="px-4 py-2.5 text-zinc-400 font-mono">{s.shiftNumber.slice(-8)}</td>
                  <td className="px-4 py-2.5 text-zinc-300">{s.cashierName ?? '—'}</td>
                  <td className="px-4 py-2.5 text-zinc-500">{new Date(s.openedAt).toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-zinc-500">{s.closedAt ? new Date(s.closedAt).toLocaleString() : '—'}</td>
                  <td className="px-4 py-2.5 text-right text-zinc-400">${s.openingFloat.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right text-zinc-200 font-medium">${s.netSales.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right text-zinc-400">{s.transactions}</td>
                  <td className="px-4 py-2.5">
                    <span className={cn('px-1.5 py-0.5 rounded text-xs', s.status === 'open' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500')}>{s.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Open Shift Modal */}
      {showOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-80 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-100">Open Shift</h3>
              <button onClick={() => setShowOpen(false)}><X className="w-4 h-4 text-zinc-500" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Cashier Name</label>
                <input value={openForm.cashierName} onChange={e => setOpenForm(p => ({ ...p, cashierName: e.target.value }))} className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Opening Float ($)</label>
                <input type="number" value={openForm.openingFloat} onChange={e => setOpenForm(p => ({ ...p, openingFloat: e.target.value }))} className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowOpen(false)} className="flex-1 py-2 text-xs border border-zinc-700 text-zinc-400 rounded">Cancel</button>
              <button onClick={openShift} disabled={loading} className="flex-1 py-2 text-xs bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded">
                {loading ? 'Opening...' : 'Open Shift'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Shift Modal */}
      {showClose && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-80 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-100">Close Shift</h3>
              <button onClick={() => setShowClose(false)}><X className="w-4 h-4 text-zinc-500" /></button>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Closing Float ($)', key: 'closingFloat' },
                { label: 'Net Sales ($)', key: 'netSales' },
                { label: 'Transactions', key: 'transactions' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs text-zinc-500 mb-1">{f.label}</label>
                  <input type="number" value={(closeForm as Record<string, string>)[f.key]} onChange={e => setCloseForm(p => ({ ...p, [f.key]: e.target.value }))} className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none" />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowClose(false)} className="flex-1 py-2 text-xs border border-zinc-700 text-zinc-400 rounded">Cancel</button>
              <button onClick={closeShift} disabled={loading} className="flex-1 py-2 text-xs bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white rounded">
                {loading ? 'Closing...' : 'Close Shift'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
