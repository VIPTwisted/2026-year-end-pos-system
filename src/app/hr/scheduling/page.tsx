'use client'
import { useEffect, useState, useCallback } from 'react'
import { CalendarDays, Plus, Store, Eye, Send } from 'lucide-react'
import Link from 'next/link'

const API = '/api/hr/workforce/schedules'

interface Schedule {
  id: string
  name: string
  storeName: string | null
  weekStart: string
  weekEnd: string
  status: string
  shifts: ScheduledShift[]
}

interface ScheduledShift {
  id: string
  employeeName: string
  role: string | null
  startTime: string
  endTime: string
  status: string
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-zinc-700 text-zinc-300',
  published: 'bg-blue-600/20 text-blue-400',
  acknowledged: 'bg-green-600/20 text-green-400',
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function SchedulingPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [storeFilter, setStoreFilter] = useState('')
  const [form, setForm] = useState({ name: '', storeName: '', weekStart: '' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (storeFilter) params.set('storeId', storeFilter)
    const res = await fetch(`${API}?${params}`)
    const data = await res.json()
    setSchedules(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [storeFilter])

  useEffect(() => { load() }, [load])

  async function createSchedule(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.weekStart) return
    setSaving(true)
    await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    setShowNew(false)
    setForm({ name: '', storeName: '', weekStart: '' })
    load()
  }

  async function publish(id: string, e: React.MouseEvent) {
    e.preventDefault()
    await fetch(`${API}/${id}/publish`, { method: 'POST' })
    load()
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-purple-400" />
            Schedule Builder
          </h1>
          <p className="text-zinc-500 mt-1">Create and manage weekly shift schedules</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> New Schedule
        </button>
      </div>

      <div className="flex gap-3">
        <div className="relative">
          <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            className="bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 w-48"
            placeholder="Filter by store..."
            value={storeFilter}
            onChange={e => setStoreFilter(e.target.value)}
          />
        </div>
      </div>

      {showNew && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-zinc-100 mb-4">New Schedule</h2>
            <form onSubmit={createSchedule} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Schedule Name</label>
                <input required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500"
                  placeholder="Week of Apr 21" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Store Name (optional)</label>
                <input
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500"
                  placeholder="Main Store" value={form.storeName}
                  onChange={e => setForm(f => ({ ...f, storeName: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Week Start (Monday)</label>
                <input required type="date"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500"
                  value={form.weekStart}
                  onChange={e => setForm(f => ({ ...f, weekStart: e.target.value }))} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowNew(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg py-2 text-sm transition-colors">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-50">
                  {saving ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-zinc-500 text-sm">Loading schedules...</div>
      ) : schedules.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <CalendarDays className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500">No schedules yet. Create the first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map(schedule => {
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            const weekStart = new Date(schedule.weekStart)
            const employees = [...new Set(schedule.shifts.map(s => s.employeeName))]
            return (
              <div key={schedule.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-semibold text-zinc-100">{schedule.name}</div>
                      <div className="text-xs text-zinc-500">
                        {schedule.storeName && <span className="mr-2">{schedule.storeName}</span>}
                        {formatDate(schedule.weekStart)} — {formatDate(schedule.weekEnd)}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[schedule.status] ?? 'bg-zinc-700 text-zinc-300'}`}>
                      {schedule.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {schedule.status === 'draft' && (
                      <button onClick={e => publish(schedule.id, e)}
                        className="flex items-center gap-1.5 text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-3 py-1.5 rounded-lg transition-colors">
                        <Send className="w-3.5 h-3.5" /> Publish
                      </button>
                    )}
                    <Link href={`/hr/scheduling/${schedule.id}`}
                      className="flex items-center gap-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg transition-colors">
                      <Eye className="w-3.5 h-3.5" /> Open
                    </Link>
                  </div>
                </div>
                {employees.length > 0 ? (
                  <div className="p-4 overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr>
                          <th className="text-left text-zinc-600 font-medium pb-2 pr-4 w-32">Employee</th>
                          {days.map((day, i) => {
                            const d = new Date(weekStart); d.setDate(weekStart.getDate() + i)
                            return <th key={day} className="text-center text-zinc-600 font-medium pb-2 px-1 w-24">{day} {d.getDate()}</th>
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {employees.map(emp => (
                          <tr key={emp}>
                            <td className="text-zinc-300 pr-4 py-1 font-medium truncate max-w-[8rem]">{emp}</td>
                            {days.map((_, i) => {
                              const d = new Date(weekStart); d.setDate(weekStart.getDate() + i)
                              const dayShifts = schedule.shifts.filter(s => {
                                const st = new Date(s.startTime)
                                return s.employeeName === emp && st.toDateString() === d.toDateString()
                              })
                              return (
                                <td key={i} className="px-1 py-1 text-center">
                                  {dayShifts.map(s => (
                                    <div key={s.id} className="bg-blue-600/20 text-blue-300 rounded px-1 py-0.5 text-[10px] leading-tight mb-0.5">
                                      {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                  ))}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 text-xs text-zinc-600 text-center">No shifts added yet</div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
