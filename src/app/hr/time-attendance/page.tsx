'use client'
import { useEffect, useState, useCallback } from 'react'
import { Clock, Plus, CheckCircle, Coffee } from 'lucide-react'

const API = '/api/hr/workforce/time-attendance'

interface TARecord {
  id: string; employeeName: string; storeName: string | null; clockIn: string; clockOut: string | null; breakStart: string | null; breakEnd: string | null; totalHours: number | null; overtimeHrs: number; status: string; approvedBy: string | null
}

const STATUS_COLORS: Record<string, string> = {
  'clocked-in': 'bg-green-600/20 text-green-400',
  'on-break': 'bg-yellow-600/20 text-yellow-400',
  'clocked-out': 'bg-zinc-700 text-zinc-400',
}

function fmt(dt: string | null) { return dt ? new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—' }

type FilterMode = 'today' | 'week' | 'all'

export default function TimeAttendancePage() {
  const [records, setRecords] = useState<TARecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterMode>('today')
  const [empFilter, setEmpFilter] = useState('')
  const [showClockIn, setShowClockIn] = useState(false)
  const [clockInForm, setClockInForm] = useState({ employeeName: '', storeName: '' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (empFilter) params.set('employeeName', empFilter)
    if (filter === 'today') { const t = new Date(); t.setHours(0, 0, 0, 0); params.set('dateFrom', t.toISOString()) }
    else if (filter === 'week') { const w = new Date(); w.setDate(w.getDate() - 7); params.set('dateFrom', w.toISOString()) }
    const res = await fetch(`${API}?${params}`)
    const data = await res.json()
    setRecords(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [filter, empFilter])

  useEffect(() => { load() }, [load])

  const clockedIn = records.filter(r => r.status === 'clocked-in').length
  const totalHours = records.filter(r => r.totalHours).reduce((s, r) => s + (r.totalHours ?? 0), 0)
  const overtimeTotal = records.reduce((s, r) => s + (r.overtimeHrs ?? 0), 0)

  async function clockIn(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(clockInForm) })
    setSaving(false); setShowClockIn(false); setClockInForm({ employeeName: '', storeName: '' }); load()
  }

  async function clockOut(id: string) {
    await fetch(`${API}/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'clock-out' }) }); load()
  }

  async function toggleBreak(r: TARecord) {
    await fetch(`${API}/${r.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: r.status === 'on-break' ? 'break-end' : 'break-start' }) }); load()
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2"><Clock className="w-6 h-6 text-green-400" />Time &amp; Attendance</h1>
          <p className="text-zinc-500 mt-1">Clock-in/out, breaks, overtime</p>
        </div>
        <button onClick={() => setShowClockIn(true)} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Clock In
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"><div className="text-xs text-zinc-500 mb-1">Currently Clocked In</div><div className="text-3xl font-bold text-green-400">{clockedIn}</div></div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"><div className="text-xs text-zinc-500 mb-1">Total Hours (Filtered)</div><div className="text-3xl font-bold text-blue-400">{totalHours.toFixed(1)}h</div></div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"><div className="text-xs text-zinc-500 mb-1">Overtime Hours</div><div className="text-3xl font-bold text-orange-400">{overtimeTotal.toFixed(1)}h</div></div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          {(['today', 'week', 'all'] as FilterMode[]).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 text-sm transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}>
              {f === 'today' ? 'Today' : f === 'week' ? 'This Week' : 'All'}
            </button>
          ))}
        </div>
        <input className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-600" placeholder="Filter by employee..." value={empFilter} onChange={e => setEmpFilter(e.target.value)} />
      </div>

      {showClockIn && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold text-zinc-100 mb-4">Clock In</h2>
            <form onSubmit={clockIn} className="space-y-3">
              <div><label className="block text-xs text-zinc-500 mb-1">Employee Name</label><input required className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500" placeholder="Jane Smith" value={clockInForm.employeeName} onChange={e => setClockInForm(f => ({ ...f, employeeName: e.target.value }))} /></div>
              <div><label className="block text-xs text-zinc-500 mb-1">Store Name</label><input className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500" placeholder="Main Store" value={clockInForm.storeName} onChange={e => setClockInForm(f => ({ ...f, storeName: e.target.value }))} /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowClockIn(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg py-2 text-sm transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-green-600 hover:bg-green-500 text-white rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-50">{saving ? 'Clocking In...' : 'Clock In Now'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <div className="text-zinc-500 text-sm">Loading...</div> : records.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <Clock className="w-12 h-12 text-zinc-700 mx-auto mb-3" /><p className="text-zinc-500">No records found.</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                {['Employee', 'Store', 'Clock In', 'Clock Out', 'Break', 'Hours', 'OT', 'Status', 'Approved', 'Actions'].map(h => (
                  <th key={h} className={`text-xs text-zinc-500 font-medium px-4 py-3 ${['Hours', 'OT'].includes(h) ? 'text-right' : h === 'Status' || h === 'Approved' || h === 'Actions' ? 'text-center' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {records.map(r => (
                <tr key={r.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-zinc-100">{r.employeeName}</td>
                  <td className="px-4 py-3 text-zinc-400">{r.storeName ?? '—'}</td>
                  <td className="px-4 py-3 text-zinc-400">{fmt(r.clockIn)}</td>
                  <td className="px-4 py-3 text-zinc-400">{fmt(r.clockOut)}</td>
                  <td className="px-4 py-3 text-zinc-400">{r.breakStart ? `${fmt(r.breakStart)} – ${fmt(r.breakEnd)}` : '—'}</td>
                  <td className="px-4 py-3 text-right font-medium text-zinc-300">{r.totalHours != null ? `${r.totalHours.toFixed(1)}h` : '—'}</td>
                  <td className="px-4 py-3 text-right">{r.overtimeHrs > 0 ? <span className="text-orange-400 font-medium">{r.overtimeHrs.toFixed(1)}h</span> : <span className="text-zinc-600">0h</span>}</td>
                  <td className="px-4 py-3 text-center"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[r.status] ?? 'bg-zinc-700 text-zinc-400'}`}>{r.status}</span></td>
                  <td className="px-4 py-3 text-center">{r.approvedBy ? <span className="flex items-center justify-center gap-1 text-xs text-green-400"><CheckCircle className="w-3.5 h-3.5" />{r.approvedBy}</span> : <span className="text-xs text-zinc-600">Pending</span>}</td>
                  <td className="px-4 py-3 text-center">
                    {r.status !== 'clocked-out' && (
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => toggleBreak(r)} className="flex items-center gap-1 text-xs bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 px-2 py-1 rounded transition-colors"><Coffee className="w-3 h-3" />{r.status === 'on-break' ? 'End Break' : 'Break'}</button>
                        <button onClick={() => clockOut(r.id)} className="text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 px-2 py-1 rounded transition-colors">Clock Out</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
