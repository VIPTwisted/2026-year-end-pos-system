'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Lock, Calendar, X, Check } from 'lucide-react'

interface FiscalPeriod {
  id: string; period: string; fiscalYear: string; status: string
  closedBy: string | null; closedAt: string | null; notes: string | null; createdAt: string
}

export default function FiscalPeriodsPage() {
  const [periods, setPeriods] = useState<FiscalPeriod[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [closing, setClosing] = useState<string | null>(null)
  const [form, setForm] = useState({ period: '', fiscalYear: '', notes: '' })

  async function load() {
    setLoading(true)
    const res = await fetch('/api/finance/periods')
    if (res.ok) setPeriods(await res.json())
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function save() {
    setSaving(true)
    const res = await fetch('/api/finance/periods', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (!res.ok) { const d = await res.json(); alert(d.error || 'Failed') }
    else { setShowModal(false); load() }
    setSaving(false)
  }

  async function closePeriod(id: string, period: string) {
    if (!confirm(`Close period ${period}? This cannot be undone.`)) return
    setClosing(id)
    const res = await fetch(`/api/finance/periods/${id}/close`, { method: 'POST' })
    if (!res.ok) { const d = await res.json(); alert(d.error || 'Failed') }
    setClosing(null); load()
  }

  return (
    <>
      <TopBar title="Fiscal Periods" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Fiscal Periods</h2>
            <p className="text-sm text-zinc-500">{periods.filter(p => p.status === 'open').length} open</p>
          </div>
          <Button onClick={() => { setForm({ period: '', fiscalYear: '', notes: '' }); setShowModal(true) }}>
            <Plus className="w-4 h-4 mr-1" />New Period
          </Button>
        </div>

        {loading ? (
          <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-zinc-800 animate-pulse rounded-lg" />)}</div>
        ) : periods.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
            <Calendar className="w-12 h-12 mb-4 opacity-30" /><p className="text-sm">No fiscal periods</p>
          </CardContent></Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3 font-medium">Period</th>
                  <th className="text-left pb-3 font-medium">Fiscal Year</th>
                  <th className="text-center pb-3 font-medium">Status</th>
                  <th className="text-left pb-3 font-medium">Closed At</th>
                  <th className="text-left pb-3 font-medium">Notes</th>
                  <th className="text-center pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {periods.map(p => (
                  <tr key={p.id} className="hover:bg-zinc-900/50">
                    <td className="py-3 pr-4 font-mono text-zinc-200">{p.period}</td>
                    <td className="py-3 pr-4 text-zinc-400">{p.fiscalYear}</td>
                    <td className="py-3 pr-4 text-center"><Badge variant={p.status === 'open' ? 'success' : 'secondary'}>{p.status}</Badge></td>
                    <td className="py-3 pr-4 text-xs text-zinc-500">{p.closedAt ? new Date(p.closedAt).toLocaleDateString('en-US', { dateStyle: 'medium' }) : '—'}</td>
                    <td className="py-3 pr-4 text-xs text-zinc-500 max-w-xs truncate">{p.notes || '—'}</td>
                    <td className="py-3 text-center">
                      {p.status === 'open' && (
                        <Button size="sm" variant="outline" onClick={() => closePeriod(p.id, p.period)} disabled={closing === p.id}
                          className="text-amber-400 border-amber-400/30 hover:bg-amber-400/10">
                          <Lock className="w-3.5 h-3.5 mr-1" />{closing === p.id ? 'Closing…' : 'Close'}
                        </Button>
                      )}
                      {p.status === 'closed' && <span className="text-zinc-600 text-xs">Closed</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-zinc-100">New Fiscal Period</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Period (YYYY-MM) *</label>
                <input className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 font-mono"
                  value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))} placeholder="2026-05" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Fiscal Year *</label>
                <input className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 font-mono"
                  value={form.fiscalYear} onChange={e => setForm(f => ({ ...f, fiscalYear: e.target.value }))} placeholder="FY2026" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Notes</label>
                <input className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                  value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={save} disabled={saving || !form.period.trim() || !form.fiscalYear.trim()}>
                <Check className="w-4 h-4 mr-1" />{saving ? 'Saving…' : 'Create Period'}
              </Button>
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
