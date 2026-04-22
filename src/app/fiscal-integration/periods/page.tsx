'use client'
import { useState, useEffect, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Calendar, Plus, Lock, CheckSquare } from 'lucide-react'
import Link from 'next/link'

interface FiscalPeriod {
  id: string; name: string; storeId: string | null; storeName: string | null
  startDate: string; endDate: string | null; status: string
  xReportCount: number; zReportCount: number; totalSales: number
  totalReturns: number; totalTax: number; cashDrawer: number; variance: number
  closedBy: string | null; closedAt: string | null; auditedBy: string | null; auditedAt: string | null; createdAt: string
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, string> = {
    open: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    closing: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    closed: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20',
    audited: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  }
  return <span className={`text-[10px] font-medium border rounded-full px-2 py-0.5 capitalize ${cfg[status] ?? 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20'}`}>{status}</span>
}

export default function FiscalPeriodsPage() {
  const [periods, setPeriods] = useState<FiscalPeriod[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [closingId, setClosingId] = useState<string | null>(null)
  const [auditingId, setAuditingId] = useState<string | null>(null)
  const [closedBy, setClosedBy] = useState('')
  const [auditedBy, setAuditedBy] = useState('')
  const [form, setForm] = useState({ name: '', storeName: '', startDate: '' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/fiscal/periods')
    const data = await res.json()
    setPeriods(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    await fetch('/api/fiscal/periods', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, storeName: form.storeName || null, startDate: form.startDate }) })
    await load(); setShowForm(false); setForm({ name: '', storeName: '', startDate: '' }); setSaving(false)
  }

  const handleClose = async (id: string) => {
    if (!closedBy.trim()) { alert('Enter your name to close the period'); return }
    setClosingId(id)
    await fetch(`/api/fiscal/periods/${id}/close`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ closedBy }) })
    await load(); setClosingId(null); setClosedBy('')
  }

  const handleAudit = async (id: string) => {
    if (!auditedBy.trim()) { alert('Enter your name to audit the period'); return }
    setAuditingId(id)
    await fetch(`/api/fiscal/periods/${id}/audit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ auditedBy }) })
    await load(); setAuditingId(null); setAuditedBy('')
  }

  const fmt = (d: string | null) => d ? new Date(d).toLocaleDateString() : '—'
  const fmtCur = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <>
      <TopBar title="Fiscal Periods" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Fiscal Periods</h2>
            <p className="text-xs text-zinc-500">{periods.length} period(s)</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> New Period
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-100">New Fiscal Period</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Period Name *</label>
                <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" placeholder="Q1 2026" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Store Name</label>
                <input value={form.storeName} onChange={e => setForm(p => ({ ...p, storeName: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" placeholder="Main Street Store" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Start Date *</label>
                <input required type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">{saving ? 'Creating...' : 'Create Period'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm transition-colors">Cancel</button>
            </div>
          </form>
        )}

        {loading ? <div className="text-center py-12 text-zinc-600 text-sm">Loading...</div>
        : periods.length === 0 ? (
          <div className="text-center py-16 text-zinc-600">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No fiscal periods yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs text-zinc-600 uppercase tracking-wide">
                  {['Period','Store','Start','End','Sales','Returns','Tax','Variance','Status','Actions'].map(h => (
                    <th key={h} className={`pb-3 font-medium ${['Sales','Returns','Tax','Variance'].includes(h) ? 'text-right' : h === 'Status' ? 'text-center' : h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {periods.map(period => (
                  <tr key={period.id} className="hover:bg-zinc-900/40">
                    <td className="py-3 pr-4">
                      <Link href={`/fiscal-integration/periods/${period.id}`} className="font-medium text-zinc-100 hover:text-blue-400 transition-colors">{period.name}</Link>
                    </td>
                    <td className="py-3 pr-4 text-xs text-zinc-400">{period.storeName ?? '—'}</td>
                    <td className="py-3 pr-4 text-xs text-zinc-400">{fmt(period.startDate)}</td>
                    <td className="py-3 pr-4 text-xs text-zinc-400">{fmt(period.endDate)}</td>
                    <td className="py-3 pr-4 text-right text-zinc-300">{period.totalSales > 0 ? fmtCur(period.totalSales) : '—'}</td>
                    <td className="py-3 pr-4 text-right text-zinc-400">{period.totalReturns > 0 ? fmtCur(period.totalReturns) : '—'}</td>
                    <td className="py-3 pr-4 text-right text-zinc-400">{period.totalTax > 0 ? fmtCur(period.totalTax) : '—'}</td>
                    <td className="py-3 pr-4 text-right">{period.variance !== 0 ? <span className={period.variance < 0 ? 'text-red-400' : 'text-emerald-400'}>{fmtCur(Math.abs(period.variance))}</span> : <span className="text-zinc-600">—</span>}</td>
                    <td className="py-3 pr-4 text-center"><StatusBadge status={period.status} /></td>
                    <td className="py-3 text-right">
                      {period.status === 'open' && (
                        <div className="flex items-center gap-1 justify-end">
                          <input value={closingId === period.id ? closedBy : ''} onChange={e => setClosedBy(e.target.value)} onFocus={() => setClosingId(period.id)} placeholder="Your name"
                            className="w-24 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-[11px] text-zinc-100 focus:outline-none focus:border-amber-500" />
                          <button onClick={() => handleClose(period.id)} disabled={closingId === period.id && !closedBy.trim()}
                            className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 disabled:opacity-40 transition-colors">
                            <Lock className="w-3.5 h-3.5" />Close
                          </button>
                        </div>
                      )}
                      {period.status === 'closed' && (
                        <div className="flex items-center gap-1 justify-end">
                          <input value={auditingId === period.id ? auditedBy : ''} onChange={e => setAuditedBy(e.target.value)} onFocus={() => setAuditingId(period.id)} placeholder="Auditor name"
                            className="w-24 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-[11px] text-zinc-100 focus:outline-none focus:border-blue-500" />
                          <button onClick={() => handleAudit(period.id)}
                            className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors">
                            <CheckSquare className="w-3.5 h-3.5" />Audit
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  )
}
