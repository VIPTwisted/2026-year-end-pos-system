'use client'
import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import {
  CalendarDays, Plus, ChevronDown, ChevronUp, Trash2,
  Clock, UserCheck, X, Check, LayoutList,
} from 'lucide-react'

type Shift = {
  id: string
  employeeName: string
  role: string | null
  startTime: string
  endTime: string
  breakMinutes: number
  notes: string | null
  status: string
}

type Schedule = {
  id: string
  name: string
  storeName: string | null
  weekStart: string
  weekEnd: string
  status: string
  createdAt: string
  _count: { shifts: number }
  shifts: Shift[]
}

const STATUS_COLORS: Record<string, string> = {
  draft:     'bg-zinc-700 text-zinc-300',
  published: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  approved:  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  archived:  'bg-zinc-800 text-zinc-500',
}

const SHIFT_STATUS_COLORS: Record<string, string> = {
  scheduled:  'bg-blue-500/15 text-blue-400',
  confirmed:  'bg-emerald-500/15 text-emerald-400',
  completed:  'bg-zinc-700 text-zinc-400',
  no_show:    'bg-red-500/15 text-red-400',
  swapped:    'bg-amber-500/15 text-amber-400',
}

const STATUSES = ['draft', 'published', 'approved', 'archived']

function fmtTime(dt: string) {
  return new Date(dt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}
function fmtDate(dt: string) {
  return new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
function shiftHours(start: string, end: string, breakMin: number) {
  const mins = (new Date(end).getTime() - new Date(start).getTime()) / 60000 - breakMin
  return (mins / 60).toFixed(1)
}

export default function ServiceSchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading]     = useState(true)
  const [expanded, setExpanded]   = useState<string | null>(null)
  const [showNewSchedule, setShowNewSchedule]   = useState(false)
  const [showNewShift, setShowNewShift]         = useState<string | null>(null)
  const [scheduleForm, setScheduleForm] = useState({
    name: '', storeName: '', weekStart: '', weekEnd: '',
  })
  const [shiftForm, setShiftForm] = useState({
    employeeName: '', role: '', startTime: '', endTime: '', breakMinutes: 30, notes: '',
  })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/service/schedule')
    setSchedules(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function createSchedule(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/service/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...scheduleForm,
        storeName: scheduleForm.storeName || null,
      }),
    })
    setShowNewSchedule(false)
    setScheduleForm({ name: '', storeName: '', weekStart: '', weekEnd: '' })
    setSaving(false)
    load()
  }

  async function createShift(e: React.FormEvent) {
    e.preventDefault()
    if (!showNewShift) return
    setSaving(true)
    await fetch('/api/service/schedule/shifts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scheduleId: showNewShift,
        ...shiftForm,
        role: shiftForm.role || null,
        notes: shiftForm.notes || null,
      }),
    })
    setShowNewShift(null)
    setShiftForm({ employeeName: '', role: '', startTime: '', endTime: '', breakMinutes: 30, notes: '' })
    setSaving(false)
    load()
  }

  async function cycleStatus(s: Schedule) {
    const idx = STATUSES.indexOf(s.status)
    const next = STATUSES[(idx + 1) % STATUSES.length]
    await fetch(`/api/service/schedule/${s.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    load()
  }

  async function deleteSchedule(id: string) {
    if (!confirm('Delete this schedule and all shifts?')) return
    await fetch(`/api/service/schedule/${id}`, { method: 'DELETE' })
    load()
  }

  const totalShifts   = schedules.reduce((a, s) => a + s._count.shifts, 0)
  const totalHours    = schedules.flatMap(s => s.shifts).reduce((a, sh) => a + parseFloat(shiftHours(sh.startTime, sh.endTime, sh.breakMinutes)), 0)
  const publishedCount = schedules.filter(s => s.status === 'published' || s.status === 'approved').length

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100">
      {/* Header */}
      <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <CalendarDays className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Service Scheduling</h1>
            <p className="text-xs text-zinc-500">Agent schedules · shift capacity · coverage planning</p>
          </div>
        </div>
        <button
          onClick={() => setShowNewSchedule(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> New Schedule
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 p-6 pb-0">
        {[
          { label: 'Total Schedules', value: schedules.length, icon: LayoutList, color: 'text-blue-400' },
          { label: 'Total Shifts', value: totalShifts, icon: CalendarDays, color: 'text-violet-400' },
          { label: 'Scheduled Hours', value: `${totalHours.toFixed(0)}h`, icon: Clock, color: 'text-emerald-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={cn('w-4 h-4', color)} />
              <span className="text-xs text-zinc-500">{label}</span>
            </div>
            <p className={cn('text-2xl font-bold tabular-nums', color)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Schedule List */}
      <div className="p-6 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-zinc-900 border border-zinc-800 rounded-xl animate-pulse" />
          ))
        ) : schedules.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">
            <CalendarDays className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
            <p>No schedules yet. Create one to plan agent coverage.</p>
          </div>
        ) : schedules.map(s => (
          <div key={s.id} className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
            {/* Schedule header row */}
            <div className="flex items-center gap-4 px-5 py-4">
              <button
                onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {expanded === s.id
                  ? <ChevronUp className="w-4 h-4" />
                  : <ChevronDown className="w-4 h-4" />}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-zinc-100">{s.name}</h3>
                  {s.storeName && (
                    <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{s.storeName}</span>
                  )}
                  <button
                    onClick={() => cycleStatus(s)}
                    className={cn('text-xs px-2 py-0.5 rounded font-medium capitalize cursor-pointer transition-opacity hover:opacity-80', STATUS_COLORS[s.status] ?? 'bg-zinc-700 text-zinc-400')}
                  >
                    {s.status}
                  </button>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {fmtDate(s.weekStart)} – {fmtDate(s.weekEnd)} · {s._count.shifts} shift{s._count.shifts !== 1 ? 's' : ''}
                </p>
              </div>

              <button
                onClick={() => setShowNewShift(s.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs text-zinc-300 transition-colors"
              >
                <Plus className="w-3 h-3" /> Add Shift
              </button>

              <button
                onClick={() => deleteSchedule(s.id)}
                className="p-2 text-zinc-600 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Shifts table */}
            {expanded === s.id && (
              <div className="border-t border-zinc-800">
                {s.shifts.length === 0 ? (
                  <p className="text-center text-xs text-zinc-600 py-5">No shifts yet. Add one above.</p>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-800/60 text-[11px] text-zinc-500 uppercase tracking-wide">
                        <th className="px-5 py-2.5 text-left">Agent</th>
                        <th className="px-4 py-2.5 text-left">Role</th>
                        <th className="px-4 py-2.5 text-left">Start</th>
                        <th className="px-4 py-2.5 text-left">End</th>
                        <th className="px-4 py-2.5 text-left">Hours</th>
                        <th className="px-4 py-2.5 text-left">Break</th>
                        <th className="px-4 py-2.5 text-left">Status</th>
                        <th className="px-4 py-2.5 text-left">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40">
                      {s.shifts.map(sh => (
                        <tr key={sh.id} className="hover:bg-zinc-800/20 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-[11px] font-bold text-blue-400">
                                {sh.employeeName.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm text-zinc-200">{sh.employeeName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-zinc-400">{sh.role ?? '—'}</td>
                          <td className="px-4 py-3 text-sm text-zinc-300 tabular-nums">{fmtTime(sh.startTime)}</td>
                          <td className="px-4 py-3 text-sm text-zinc-300 tabular-nums">{fmtTime(sh.endTime)}</td>
                          <td className="px-4 py-3 text-sm font-medium text-zinc-100 tabular-nums">
                            {shiftHours(sh.startTime, sh.endTime, sh.breakMinutes)}h
                          </td>
                          <td className="px-4 py-3 text-sm text-zinc-500">{sh.breakMinutes}m</td>
                          <td className="px-4 py-3">
                            <span className={cn('text-xs px-2 py-0.5 rounded capitalize', SHIFT_STATUS_COLORS[sh.status] ?? 'bg-zinc-700 text-zinc-400')}>
                              {sh.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-zinc-500 max-w-[150px] truncate">{sh.notes ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New Schedule Modal */}
      {showNewSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <h2 className="text-base font-semibold">New Schedule</h2>
              <button onClick={() => setShowNewSchedule(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={createSchedule} className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Schedule Name *</label>
                <input required value={scheduleForm.name} onChange={e => setScheduleForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Week of Apr 28 – Support Team"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Store / Team (optional)</label>
                <input value={scheduleForm.storeName} onChange={e => setScheduleForm(f => ({ ...f, storeName: e.target.value }))}
                  placeholder="e.g. Downtown Store · Tier-1 Agents"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Week Start *</label>
                  <input required type="date" value={scheduleForm.weekStart}
                    onChange={e => setScheduleForm(f => ({ ...f, weekStart: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Week End *</label>
                  <input required type="date" value={scheduleForm.weekEnd}
                    onChange={e => setScheduleForm(f => ({ ...f, weekEnd: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowNewSchedule(false)}
                  className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors">
                  {saving ? 'Creating…' : 'Create Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Shift Modal */}
      {showNewShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-400" /> Add Shift
              </h2>
              <button onClick={() => setShowNewShift(null)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={createShift} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs text-zinc-400 mb-1">Agent Name *</label>
                  <input required value={shiftForm.employeeName}
                    onChange={e => setShiftForm(f => ({ ...f, employeeName: e.target.value }))}
                    placeholder="e.g. Sarah J."
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-blue-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-zinc-400 mb-1">Role</label>
                  <input value={shiftForm.role}
                    onChange={e => setShiftForm(f => ({ ...f, role: e.target.value }))}
                    placeholder="e.g. Tier-1, Supervisor"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Start Time *</label>
                  <input required type="datetime-local" value={shiftForm.startTime}
                    onChange={e => setShiftForm(f => ({ ...f, startTime: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">End Time *</label>
                  <input required type="datetime-local" value={shiftForm.endTime}
                    onChange={e => setShiftForm(f => ({ ...f, endTime: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Break (minutes)</label>
                  <input type="number" min={0} value={shiftForm.breakMinutes}
                    onChange={e => setShiftForm(f => ({ ...f, breakMinutes: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Notes</label>
                  <input value={shiftForm.notes}
                    onChange={e => setShiftForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Optional notes"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowNewShift(null)}
                  className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors">
                  {saving ? 'Saving…' : 'Add Shift'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
