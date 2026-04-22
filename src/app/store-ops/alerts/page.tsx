'use client'
import { useEffect, useState } from 'react'
import { Bell, Plus, X, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StoreAlert {
  id: string; storeId?: string; storeName?: string; alertType: string; severity: string
  title: string; description: string; isRead: boolean; resolvedAt: string | null; createdAt: string
}
const SEVERITY_BAR: Record<string, string> = { critical: 'bg-red-500', high: 'bg-orange-500', medium: 'bg-yellow-500', low: 'bg-zinc-600' }
const SEVERITY_BADGE: Record<string, string> = { critical: 'bg-red-500/20 text-red-400 border border-red-500/40', high: 'bg-orange-500/20 text-orange-400 border border-orange-500/40', medium: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40', low: 'bg-zinc-700 text-zinc-400 border border-zinc-600' }
const ALERT_TYPES = ['low-cash', 'price-override-high', 'refund-limit', 'void-spike', 'inventory-discrepancy', 'login-fail', 'till-variance']
type FilterTab = 'all' | 'unread' | 'critical' | 'high' | 'resolved'
function emptyForm() { return { alertType: 'till-variance', severity: 'medium', title: '', description: '', storeName: '' } }

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<StoreAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<FilterTab>('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm())
  const [submitting, setSubmitting] = useState(false)

  async function load() { setLoading(true); const data = await fetch('/api/store-ops/alerts').then(r => r.json()); setAlerts(Array.isArray(data) ? data : []); setLoading(false) }
  useEffect(() => { load() }, [])

  async function markRead(id: string) { await fetch(`/api/store-ops/alerts/${id}/read`, { method: 'POST' }); setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a)) }
  async function resolve(id: string) { await fetch(`/api/store-ops/alerts/${id}/resolve`, { method: 'POST' }); setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolvedAt: new Date().toISOString(), isRead: true } : a)) }

  async function create(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true)
    await fetch('/api/store-ops/alerts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setShowForm(false); setForm(emptyForm()); setSubmitting(false); load()
  }

  const filtered = alerts.filter(a => { if (tab === 'unread') return !a.isRead; if (tab === 'critical') return a.severity === 'critical'; if (tab === 'high') return a.severity === 'high'; if (tab === 'resolved') return !!a.resolvedAt; return true })
  const tabs: { id: FilterTab; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: alerts.length },
    { id: 'unread', label: 'Unread', count: alerts.filter(a => !a.isRead).length },
    { id: 'critical', label: 'Critical', count: alerts.filter(a => a.severity === 'critical').length },
    { id: 'high', label: 'High', count: alerts.filter(a => a.severity === 'high').length },
    { id: 'resolved', label: 'Resolved', count: alerts.filter(a => !!a.resolvedAt).length },
  ]

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2"><Bell className="w-6 h-6 text-blue-400" /> Store Alerts</h1><p className="text-zinc-500 text-sm mt-1">All operational alerts across stores</p></div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium"><Plus className="w-4 h-4" /> New Alert</button>
      </div>
      <div className="flex gap-1 mb-6 bg-zinc-900 border border-zinc-800 rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2', tab === t.id ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300')}>
            {t.label}{t.count > 0 && <span className={cn('text-xs px-1.5 py-0.5 rounded-full', tab === t.id ? 'bg-zinc-700 text-zinc-300' : 'bg-zinc-800 text-zinc-500')}>{t.count}</span>}
          </button>
        ))}
      </div>
      {loading && <p className="text-zinc-500 text-center py-12">Loading…</p>}
      <div className="space-y-3">
        {!loading && filtered.length === 0 && <p className="text-zinc-500 text-center py-12">No alerts in this view</p>}
        {filtered.map(alert => (
          <div key={alert.id} className={cn('bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex transition-opacity', alert.isRead && 'opacity-70')}>
            <div className={cn('w-1 shrink-0', SEVERITY_BAR[alert.severity] ?? 'bg-zinc-600')} />
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', SEVERITY_BADGE[alert.severity])}>{alert.severity}</span>
                    <span className="text-xs text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-full">{alert.alertType}</span>
                    {!alert.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full" title="Unread" />}
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-100 mb-1">{alert.title}</h3>
                  <p className="text-sm text-zinc-400">{alert.description}</p>
                  <p className="text-xs text-zinc-600 mt-2">{alert.storeName && `${alert.storeName} · `}{new Date(alert.createdAt).toLocaleString()}{alert.resolvedAt && ` · Resolved ${new Date(alert.resolvedAt).toLocaleString()}`}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {alert.resolvedAt ? <div className="flex items-center gap-1 text-emerald-400 text-xs"><CheckCircle className="w-4 h-4" /><span>Resolved</span></div> : <>
                    {!alert.isRead && <button onClick={() => markRead(alert.id)} className="text-xs text-zinc-400 hover:text-zinc-100 border border-zinc-700 rounded-lg px-3 py-1.5 transition-colors">Mark Read</button>}
                    <button onClick={() => resolve(alert.id)} className="text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-800 rounded-lg px-3 py-1.5 transition-colors">Resolve</button>
                  </>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5"><h2 className="text-lg font-semibold text-zinc-100">New Store Alert</h2><button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-5 h-5" /></button></div>
            <form onSubmit={create} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-zinc-400 block mb-1">Alert Type</label><select value={form.alertType} onChange={e => setForm(p => ({ ...p, alertType: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500">{ALERT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                <div><label className="text-xs text-zinc-400 block mb-1">Severity</label><select value={form.severity} onChange={e => setForm(p => ({ ...p, severity: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500">{['critical', 'high', 'medium', 'low'].map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              </div>
              <div><label className="text-xs text-zinc-400 block mb-1">Store Name</label><input value={form.storeName} onChange={e => setForm(p => ({ ...p, storeName: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500" placeholder="Store name" /></div>
              <div><label className="text-xs text-zinc-400 block mb-1">Title *</label><input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500" placeholder="Short alert title" /></div>
              <div><label className="text-xs text-zinc-400 block mb-1">Description *</label><textarea required value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500 resize-none" placeholder="Alert details…" /></div>
              <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-zinc-700 rounded-lg py-2 text-sm text-zinc-300 hover:bg-zinc-800">Cancel</button><button type="submit" disabled={submitting} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50">{submitting ? 'Creating…' : 'Create Alert'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
