'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { CalendarDays, Plus, Send, ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

const API_BASE = '/api/hr/workforce/schedules'

interface Schedule {
  id: string; name: string; storeName: string | null; weekStart: string; weekEnd: string; status: string; shifts: ScheduledShift[]
}
interface ScheduledShift {
  id: string; employeeName: string; role: string | null; startTime: string; endTime: string; breakMinutes: number; notes: string | null; status: string; coveredBy: string | null
}

const SHIFT_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-600/20 text-blue-300 border-blue-700/30',
  confirmed: 'bg-green-600/20 text-green-300 border-green-700/30',
  'no-show': 'bg-red-600/20 text-red-300 border-red-700/30',
  covered: 'bg-purple-600/20 text-purple-300 border-purple-700/30',
}
const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-zinc-700 text-zinc-300',
  published: 'bg-blue-600/20 text-blue-400',
  acknowledged: 'bg-green-600/20 text-green-400',
}
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
function fmt(dt: string) { return new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }

export default function ScheduleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [schedule, setSchedule] = useState<Schedule | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddShift, setShowAddShift] = useState(false)
  const [coverModal, setCoverModal] = useState<{ shift: ScheduledShift } | null>(null)
  const [coverName, setCoverName] = useState('')
  const [saving, setSaving] = useState(false)
  const [shiftForm, setShiftForm] = useState({ employeeName: '', role: '', day: '0', startTime: '09:00', endTime: '17:00', breakMinutes: '30', notes: '' })

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`${API_BASE}/${id}`)
    setSchedule(await res.json())
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  async function publish() {
    await fetch(`${API_BASE}/${id}/publish`, { method: 'POST' })
    load()
  }

  async function addShift(e: React.FormEvent) {
    e.preventDefault()
    if (!schedule) return
    setSaving(true)
    const weekStart = new Date(schedule.weekStart)
    const baseDate = new Date(weekStart)
    baseDate.setDate(weekStart.getDate() + parseInt(shiftForm.day))
    const [sh, sm] = shiftForm.startTime.split(':').map(Number)
    const startTime = new Date(baseDate); startTime.setHours(sh, sm, 0, 0)
    const [eh, em] = shiftForm.endTime.split(':').map(Number)
    const endTime = new Date(baseDate); endTime.setHours(eh, em, 0, 0)
    await fetch(`${API_BASE}/${id}/shifts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeName: shiftForm.employeeName, role: shiftForm.role, startTime: startTime.toISOString(), endTime: endTime.toISOString(), breakMinutes: parseInt(shiftForm.breakMinutes), notes: shiftForm.notes }),
    })
    setSaving(false)
    setShowAddShift(false)
    setShiftForm({ employeeName: '', role: '', day: '0', startTime: '09:00', endTime: '17:00', breakMinutes: '30', notes: '' })
    load()
  }

  async function updateShiftStatus(shiftId: string, status: string) {
    await fetch(`${API_BASE}/${id}/shifts/${shiftId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    load()
  }

  async function coverShift() {
    if (!coverModal || !coverName.trim()) return
    await fetch(`${API_BASE}/${id}/shifts/${coverModal.shift.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'covered', coveredBy: coverName }) })
    setCoverModal(null); setCoverName(''); load()
  }

  async function deleteShift(shiftId: string) {
    if (!confirm('Delete this shift?')) return
    await fetch(`${API_BASE}/${id}/shifts/${shiftId}`, { method: 'DELETE' }); load()
  }

  if (loading) return <div className="p-8 text-zinc-500">Loading...</div>
  if (!schedule) return <div className="p-8 text-zinc-500">Schedule not found.</div>

  const weekStart = new Date(schedule.weekStart)
  const employees = [...new Set(schedule.shifts.map(s => s.employeeName))]

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href="/hr/scheduling" className="text-zinc-500 hover:text-zinc-300"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-zinc-100">{schedule.name}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[schedule.status] ?? 'bg-zinc-700 text-zinc-300'}`}>{schedule.status}</span>
            </div>
            <p className="text-zinc-500 text-sm">{schedule.storeName && <span className="mr-2">{schedule.storeName} ·</span>}{new Date(schedule.weekStart).toLocaleDateString()} — {new Date(schedule.weekEnd).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {schedule.status === 'draft' && (
            <button onClick={publish} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Send className="w-4 h-4" /> Publish
            </button>
          )}
          <button onClick={() => setShowAddShift(true)} className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Add Shift
          </button>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left text-xs text-zinc-500 font-medium px-4 py-3 w-36">Employee</th>
              {DAYS.map((day, i) => { const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return <th key={day} className="text-center text-xs text-zinc-500 font-medium px-2 py-3"><div>{day}</div><div className="text-zinc-600">{d.getDate()}</div></th> })}
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr><td colSpan={8} className="text-center text-zinc-600 py-12 text-sm">No shifts yet. Click &quot;Add Shift&quot; to get started.</td></tr>
            ) : employees.map(emp => (
              <tr key={emp} className="border-b border-zinc-800/50">
                <td className="px-4 py-2 font-medium text-zinc-200 text-sm truncate max-w-[9rem]">{emp}</td>
                {DAYS.map((_, i) => {
                  const d = new Date(weekStart); d.setDate(weekStart.getDate() + i)
                  const dayShifts = schedule.shifts.filter(s => { const st = new Date(s.startTime); return s.employeeName === emp && st.toDateString() === d.toDateString() })
                  return (
                    <td key={i} className="px-1 py-2 align-top">
                      {dayShifts.map(shift => (
                        <div key={shift.id} className={`border rounded-lg p-2 mb-1 text-[11px] leading-tight ${SHIFT_COLORS[shift.status] ?? 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                          <div className="font-semibold">{fmt(shift.startTime)} – {fmt(shift.endTime)}</div>
                          {shift.role && <div className="text-zinc-400">{shift.role}</div>}
                          {shift.coveredBy && <div className="text-purple-300">Covered: {shift.coveredBy}</div>}
                          <div className="flex gap-1 mt-1.5 flex-wrap">
                            {shift.status === 'scheduled' && (
                              <>
                                <button onClick={() => updateShiftStatus(shift.id, 'confirmed')} className="flex items-center gap-0.5 text-[10px] bg-green-800/30 hover:bg-green-800/50 text-green-300 px-1.5 py-0.5 rounded transition-colors"><CheckCircle className="w-2.5 h-2.5" /> Confirm</button>
                                <button onClick={() => updateShiftStatus(shift.id, 'no-show')} className="flex items-center gap-0.5 text-[10px] bg-red-800/30 hover:bg-red-800/50 text-red-300 px-1.5 py-0.5 rounded transition-colors"><XCircle className="w-2.5 h-2.5" /> No-Show</button>
                                <button onClick={() => setCoverModal({ shift })} className="flex items-center gap-0.5 text-[10px] bg-purple-800/30 hover:bg-purple-800/50 text-purple-300 px-1.5 py-0.5 rounded transition-colors">Cover</button>
                              </>
                            )}
                            <button onClick={() => deleteShift(shift.id)} className="text-[10px] text-zinc-600 hover:text-red-400 px-1 py-0.5 rounded transition-colors">×</button>
                          </div>
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

      {showAddShift && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-zinc-100 mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-blue-400" /> Add Shift</h2>
            <form onSubmit={addShift} className="space-y-3">
              <div><label className="block text-xs text-zinc-500 mb-1">Employee Name</label>
                <input required className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500" placeholder="Jane Smith" value={shiftForm.employeeName} onChange={e => setShiftForm(f => ({ ...f, employeeName: e.target.value }))} /></div>
              <div><label className="block text-xs text-zinc-500 mb-1">Role</label>
                <input className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500" placeholder="Cashier" value={shiftForm.role} onChange={e => setShiftForm(f => ({ ...f, role: e.target.value }))} /></div>
              <div><label className="block text-xs text-zinc-500 mb-1">Day</label>
                <select className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500" value={shiftForm.day} onChange={e => setShiftForm(f => ({ ...f, day: e.target.value }))}>
                  {DAYS.map((day, i) => { const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return <option key={i} value={String(i)}>{day} {d.getDate()}</option> })}
                </select></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-zinc-500 mb-1">Start</label><input type="time" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500" value={shiftForm.startTime} onChange={e => setShiftForm(f => ({ ...f, startTime: e.target.value }))} /></div>
                <div><label className="block text-xs text-zinc-500 mb-1">End</label><input type="time" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500" value={shiftForm.endTime} onChange={e => setShiftForm(f => ({ ...f, endTime: e.target.value }))} /></div>
              </div>
              <div><label className="block text-xs text-zinc-500 mb-1">Break (min)</label><input type="number" min="0" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500" value={shiftForm.breakMinutes} onChange={e => setShiftForm(f => ({ ...f, breakMinutes: e.target.value }))} /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddShift(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg py-2 text-sm transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-50">{saving ? 'Adding...' : 'Add Shift'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {coverModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold text-zinc-100 mb-4">Find Cover for {coverModal.shift.employeeName}</h2>
            <input autoFocus className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500 mb-4" placeholder="Covering employee name" value={coverName} onChange={e => setCoverName(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={() => { setCoverModal(null); setCoverName('') }} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg py-2 text-sm transition-colors">Cancel</button>
              <button onClick={coverShift} disabled={!coverName.trim()} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-50">Assign Cover</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
