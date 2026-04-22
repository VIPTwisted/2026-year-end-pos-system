'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileBarChart, Plus, Trash2, Play, Clock, Share2, X } from 'lucide-react'

type Report = { id: string; name: string; description: string | null; reportType: string; isShared: boolean; lastRunAt: string | null; schedule: string | null; createdAt: string }

const REPORT_TYPES = ['sales', 'inventory', 'customers', 'employees', 'finance', 'loyalty']
const SCHEDULES = [{ value: '', label: 'No Schedule' }, { value: 'daily', label: 'Daily' }, { value: 'weekly-monday', label: 'Weekly (Monday)' }, { value: 'monthly-1st', label: 'Monthly (1st)' }]
const TYPE_COLORS: Record<string, string> = {
  sales: 'text-blue-400 bg-blue-600/20', inventory: 'text-amber-400 bg-amber-600/20',
  customers: 'text-purple-400 bg-purple-600/20', employees: 'text-emerald-400 bg-emerald-600/20',
  finance: 'text-red-400 bg-red-600/20', loyalty: 'text-pink-400 bg-pink-600/20',
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [running, setRunning] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', description: '', reportType: 'sales', isShared: false, schedule: '' })

  useEffect(() => { fetch('/api/analytics/reports').then(r => r.json()).then(d => { setReports(d); setLoading(false) }) }, [])

  const createReport = async () => {
    if (!form.name.trim()) return
    const res = await fetch('/api/analytics/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const r = await res.json()
    setReports(prev => [r, ...prev])
    setForm({ name: '', description: '', reportType: 'sales', isShared: false, schedule: '' })
    setShowForm(false)
  }

  const deleteReport = async (id: string) => {
    if (!confirm('Delete report?')) return
    await fetch(`/api/analytics/reports/${id}`, { method: 'DELETE' })
    setReports(prev => prev.filter(r => r.id !== id))
  }

  const runReport = async (id: string) => {
    setRunning(id)
    await fetch(`/api/analytics/reports/${id}/run`, { method: 'POST' })
    setRunning(null)
    setReports(prev => prev.map(r => r.id === id ? { ...r, lastRunAt: new Date().toISOString() } : r))
    window.location.href = `/advanced-analytics/reports/${id}`
  }

  const grouped = REPORT_TYPES.reduce((acc, type) => { acc[type] = reports.filter(r => r.reportType === type); return acc }, {} as Record<string, Report[]>)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Saved Reports</h1>
          <p className="text-sm text-zinc-400 mt-1">Scheduled & ad-hoc report builder</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Report
        </button>
      </div>

      {showForm && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-100">New Report</h3>
            <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Report Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Monthly Sales Summary"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Report Type</label>
              <select value={form.reportType} onChange={e => setForm(f => ({ ...f, reportType: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500">
                {REPORT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-zinc-400 block mb-1">Description</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Schedule</label>
              <select value={form.schedule} onChange={e => setForm(f => ({ ...f, schedule: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500">
                {SCHEDULES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 pt-5">
              <button onClick={() => setForm(f => ({ ...f, isShared: !f.isShared }))}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${form.isShared ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/40' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'}`}>
                <Share2 className="w-3.5 h-3.5" /> {form.isShared ? 'Shared' : 'Private'}
              </button>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-zinc-700 text-zinc-400 rounded-lg text-sm hover:text-zinc-100 transition-colors">Cancel</button>
            <button onClick={createReport} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">Create Report</button>
          </div>
        </div>
      )}

      {loading ? <div className="text-zinc-500 text-sm">Loading reports...</div> : (
        <div className="space-y-6">
          {REPORT_TYPES.map(type => {
            const list = grouped[type] ?? []
            if (list.length === 0) return null
            return (
              <div key={type}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${TYPE_COLORS[type] ?? 'bg-zinc-800 text-zinc-400'}`}>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                  <span className="text-xs text-zinc-600">{list.length} report{list.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {list.map(report => (
                    <div key={report.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-600 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-sm font-semibold text-zinc-100">{report.name}</div>
                          {report.description && <div className="text-xs text-zinc-500 mt-0.5">{report.description}</div>}
                        </div>
                        {report.isShared && <Share2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-600 mb-3">
                        {report.lastRunAt && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(report.lastRunAt).toLocaleDateString()}</span>}
                        {report.schedule && <span className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-500">{report.schedule}</span>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => runReport(report.id)} disabled={running === report.id}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-xs font-medium transition-colors disabled:opacity-50">
                          <Play className="w-3 h-3" /> {running === report.id ? 'Running...' : 'Run Now'}
                        </button>
                        <Link href={`/advanced-analytics/reports/${report.id}`} className="px-3 py-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 rounded-lg text-xs transition-colors">View</Link>
                        <button onClick={() => deleteReport(report.id)} className="px-3 py-1.5 hover:bg-red-500/10 text-zinc-600 hover:text-red-400 rounded-lg text-xs transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
          {reports.length === 0 && (
            <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-xl">
              <FileBarChart className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <div className="text-zinc-400 text-sm">No reports yet. Create one above.</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
