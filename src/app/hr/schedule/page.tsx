'use client'

import { useState, useEffect, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { ChevronLeft, ChevronRight, Plus, RefreshCw, X, Loader2 } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmployeeRef {
  id: string
  firstName: string
  lastName: string
  position: string
  department: string | null
}

interface StoreRef {
  id: string
  name: string
}

interface ScheduledShift {
  id: string
  employeeId: string
  storeId: string
  date: string
  startTime: string
  endTime: string
  status: string
  notes: string | null
  employee: EmployeeRef
  store: StoreRef
}

// ─── Utilities ────────────────────────────────────────────────────────────────

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getISOWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `${d.getUTCFullYear()}-${String(week).padStart(2, '0')}`
}

function getWeekMonday(week: string): Date {
  const [yr, wk] = week.split('-').map(Number)
  const jan4 = new Date(yr, 0, 4)
  const dow = jan4.getDay() === 0 ? 7 : jan4.getDay()
  const monday = new Date(jan4)
  monday.setDate(jan4.getDate() - dow + 1 + (wk - 1) * 7)
  monday.setHours(0, 0, 0, 0)
  return monday
}

function addWeeks(week: string, delta: number): string {
  const monday = getWeekMonday(week)
  monday.setDate(monday.getDate() + delta * 7)
  return getISOWeek(monday)
}

function fmt12(t: string): string {
  const [hStr, mStr] = t.split(':')
  const h = parseInt(hStr, 10)
  const m = mStr ?? '00'
  const suffix = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${m} ${suffix}`
}

function weekLabel(week: string): string {
  const monday = getWeekMonday(week)
  return monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function weekDays(week: string): Date[] {
  const monday = getWeekMonday(week)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function statusCls(status: string): string {
  switch (status) {
    case 'confirmed':  return 'bg-emerald-500/10 border-emerald-600/30 text-emerald-300'
    case 'completed':  return 'bg-emerald-500/20 border-emerald-600/30 text-emerald-400'
    case 'absent':     return 'bg-red-500/10 border-red-600/30 text-red-300'
    case 'swapped':    return 'bg-amber-500/10 border-amber-600/30 text-amber-300'
    default:           return 'bg-blue-500/10 border-blue-600/30 text-blue-300'
  }
}

// ─── Shift Cell ───────────────────────────────────────────────────────────────

interface ShiftCellProps {
  shift: ScheduledShift | undefined
  onEmpty: () => void
  onStatusChange: (id: string, status: string) => void
  onDelete: (id: string) => void
}

function ShiftCell({ shift, onEmpty, onStatusChange, onDelete }: ShiftCellProps) {
  const [open, setOpen] = useState(false)

  if (!shift) {
    return (
      <button
        onClick={onEmpty}
        className="w-full h-full min-h-[52px] flex items-center justify-center rounded border border-dashed border-zinc-700/50 hover:border-zinc-500 hover:bg-zinc-800/30 transition-all group"
      >
        <Plus className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400" />
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full min-h-[52px] rounded border px-1.5 py-1 text-left text-[11px] leading-tight transition-all ${statusCls(shift.status)}`}
      >
        <div className="font-semibold">{fmt12(shift.startTime)}</div>
        <div className="opacity-70">{fmt12(shift.endTime)}</div>
        <div className="mt-0.5 opacity-50 capitalize text-[10px]">{shift.status}</div>
      </button>

      {open && (
        <div className="absolute z-30 top-0 left-full ml-1 w-44 bg-[#1a2640] border border-zinc-700 rounded-lg shadow-xl p-2 space-y-1">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1 px-1">Change Status</div>
          {(['scheduled', 'confirmed', 'completed', 'absent', 'swapped'] as const).map(s => (
            <button
              key={s}
              onClick={() => { onStatusChange(shift.id, s); setOpen(false) }}
              className={`w-full text-left px-2 py-1 rounded text-[12px] capitalize hover:bg-zinc-700/50 transition-colors ${shift.status === s ? 'text-blue-400 font-semibold' : 'text-zinc-300'}`}
            >
              {s}
            </button>
          ))}
          <div className="border-t border-zinc-700 pt-1 mt-1">
            <button
              onClick={() => { onDelete(shift.id); setOpen(false) }}
              className="w-full text-left px-2 py-1 rounded text-[12px] text-red-400 hover:bg-red-500/10 transition-colors"
            >
              Delete Shift
            </button>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="absolute top-1 right-1 text-zinc-500 hover:text-zinc-300"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Add Shift Modal ──────────────────────────────────────────────────────────

interface AddShiftModalProps {
  employees: EmployeeRef[]
  stores: StoreRef[]
  defaultDate: string
  defaultEmployeeId: string
  defaultStoreId: string
  onClose: () => void
  onCreated: () => void
}

function AddShiftModal({
  employees,
  stores,
  defaultDate,
  defaultEmployeeId,
  defaultStoreId,
  onClose,
  onCreated,
}: AddShiftModalProps) {
  const [empId, setEmpId] = useState(defaultEmployeeId)
  const [storeId, setStoreId] = useState(defaultStoreId)
  const [date, setDate] = useState(defaultDate)
  const [start, setStart] = useState('09:00')
  const [end, setEnd] = useState('17:00')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!empId || !storeId || !date || !start || !end) {
      setErr('All fields except notes are required')
      return
    }
    setSaving(true)
    setErr(null)
    try {
      const res = await fetch('/api/hr/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: empId, storeId, date, startTime: start, endTime: end, notes: notes || undefined }),
      })
      if (!res.ok) {
        const j = await res.json() as { error?: string }
        throw new Error(j.error ?? 'Failed to create shift')
      }
      onCreated()
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'Unknown error')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-zinc-100">Add Shift</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {err && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-[12px] rounded px-3 py-2">
              {err}
            </div>
          )}

          <div>
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 block mb-1">Employee</label>
            <select
              value={empId}
              onChange={e => setEmpId(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select employee…</option>
              {employees.map(em => (
                <option key={em.id} value={em.id}>{em.lastName}, {em.firstName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 block mb-1">Store</label>
            <select
              value={storeId}
              onChange={e => setStoreId(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select store…</option>
              {stores.map(st => (
                <option key={st.id} value={st.id}>{st.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 block mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 block mb-1">Start</label>
              <input
                type="time"
                value={start}
                onChange={e => setStart(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 block mb-1">End</label>
              <input
                type="time"
                value={end}
                onChange={e => setEnd(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 block mb-1">Notes (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any notes…"
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none placeholder:text-zinc-600"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-md border border-zinc-700 text-zinc-300 text-[13px] hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {saving ? 'Saving…' : 'Add Shift'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SchedulePage() {
  const [week, setWeek] = useState(() => getISOWeek(new Date()))
  const [storeId, setStoreId] = useState('')
  const [shifts, setShifts] = useState<ScheduledShift[]>([])
  const [employees, setEmployees] = useState<EmployeeRef[]>([])
  const [stores, setStores] = useState<StoreRef[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)
  const [modal, setModal] = useState<{ date: string; employeeId: string } | null>(null)

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  // Load stores + employees once
  useEffect(() => {
    Promise.all([
      fetch('/api/hr/employees').then(r => r.json()),
      fetch('/api/stores').then(r => r.json()),
    ]).then(([emps, sts]: [EmployeeRef[], StoreRef[]]) => {
      setEmployees(emps)
      setStores(sts)
    }).catch(() => notify('Failed to load reference data', 'err'))
  }, [])

  const loadShifts = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ week })
    if (storeId) params.set('storeId', storeId)
    fetch(`/api/hr/schedules?${params}`)
      .then(r => r.json())
      .then((data: ScheduledShift[]) => setShifts(data))
      .catch(() => notify('Failed to load schedule', 'err'))
      .finally(() => setLoading(false))
  }, [week, storeId])

  useEffect(() => { loadShifts() }, [loadShifts])

  async function handleStatusChange(id: string, status: string) {
    try {
      const res = await fetch(`/api/hr/schedules/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update')
      setShifts(prev => prev.map(s => s.id === id ? { ...s, status } : s))
      notify('Status updated')
    } catch {
      notify('Failed to update status', 'err')
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/hr/schedules/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setShifts(prev => prev.filter(s => s.id !== id))
      notify('Shift removed')
    } catch {
      notify('Failed to delete shift', 'err')
    }
  }

  async function handleGenerate() {
    setGenerating(true)
    try {
      const res = await fetch('/api/hr/schedules/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ week, storeId: storeId || undefined }),
      })
      const data = await res.json() as { created?: number; message?: string; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Generate failed')
      notify(`Generated ${data.created ?? 0} shift(s)`)
      loadShifts()
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Generate failed', 'err')
    } finally {
      setGenerating(false)
    }
  }

  const days = weekDays(week)

  // Employees visible in this week's shifts (union with all employees for rows)
  const visibleEmployees = employees.filter(em =>
    !storeId || shifts.some(s => s.employeeId === em.id) || true
  )

  function shiftsFor(empId: string, day: Date): ScheduledShift | undefined {
    return shifts.find(s => s.employeeId === empId && isSameDay(new Date(s.date), day))
  }

  function openModal(day: Date, empId: string) {
    setModal({
      date: day.toISOString().slice(0, 10),
      employeeId: empId,
    })
  }

  return (
    <>
      <TopBar title="Work Schedule" />
      <main className="flex-1 p-6 overflow-auto space-y-6 bg-[#0f0f1a] min-h-[100dvh]">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg border text-[13px] font-medium shadow-xl transition-all
            ${toast.type === 'ok'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-semibold text-zinc-100">Work Schedule</h1>
            <p className="text-[13px] text-zinc-500">Weekly employee scheduling grid</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-700 text-zinc-300 text-[13px] hover:bg-zinc-800 transition-colors disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
              {generating ? 'Generating…' : 'Generate Week'}
            </button>
            <button
              onClick={() => openModal(days[0], '')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Shift
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Week nav */}
          <div className="flex items-center gap-1 bg-[#16213e] border border-zinc-800/50 rounded-lg px-1 py-1">
            <button
              onClick={() => setWeek(w => addWeeks(w, -1))}
              className="p-1.5 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700/50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-[13px] text-zinc-200 font-medium whitespace-nowrap">
              Week of {weekLabel(week)}
            </span>
            <button
              onClick={() => setWeek(w => addWeeks(w, 1))}
              className="p-1.5 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700/50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Store filter */}
          <select
            value={storeId}
            onChange={e => setStoreId(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Stores</option>
            {stores.map(st => (
              <option key={st.id} value={st.id}>{st.name}</option>
            ))}
          </select>
        </div>

        {/* Weekly Grid */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-zinc-500">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading schedule…
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Header row */}
              <div className="grid grid-cols-8 border-b border-zinc-800/50" style={{ minWidth: '800px' }}>
                <div className="px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium border-r border-zinc-800/30">
                  Employee
                </div>
                {days.map((d, i) => (
                  <div key={i} className="px-2 py-3 text-center border-r border-zinc-800/30 last:border-r-0">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500">{DAY_LABELS[i]}</div>
                    <div className="text-[13px] font-semibold text-zinc-200 mt-0.5">
                      {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                ))}
              </div>

              {visibleEmployees.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
                  <p className="text-[13px]">No employees found. Add employees in HR first.</p>
                </div>
              ) : (
                visibleEmployees.map((emp, rowIdx) => (
                  <div
                    key={emp.id}
                    className={`grid grid-cols-8 border-b border-zinc-800/30 last:border-b-0 ${rowIdx % 2 === 0 ? '' : 'bg-zinc-900/20'}`}
                    style={{ minWidth: '800px' }}
                  >
                    {/* Employee name */}
                    <div className="px-4 py-2 border-r border-zinc-800/30 flex flex-col justify-center">
                      <div className="text-[13px] font-medium text-zinc-100 leading-tight">
                        {emp.lastName}, {emp.firstName}
                      </div>
                      <div className="text-[11px] text-zinc-500 truncate">{emp.position}</div>
                    </div>

                    {/* 7 day cells */}
                    {days.map((day, di) => (
                      <div key={di} className="p-1 border-r border-zinc-800/30 last:border-r-0">
                        <ShiftCell
                          shift={shiftsFor(emp.id, day)}
                          onEmpty={() => openModal(day, emp.id)}
                          onStatusChange={handleStatusChange}
                          onDelete={handleDelete}
                        />
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500">Legend:</span>
          {[
            { label: 'Scheduled', cls: 'bg-blue-500/10 border-blue-600/30 text-blue-300' },
            { label: 'Confirmed', cls: 'bg-emerald-500/10 border-emerald-600/30 text-emerald-300' },
            { label: 'Completed', cls: 'bg-emerald-500/20 border-emerald-600/30 text-emerald-400' },
            { label: 'Absent', cls: 'bg-red-500/10 border-red-600/30 text-red-300' },
            { label: 'Swapped', cls: 'bg-amber-500/10 border-amber-600/30 text-amber-300' },
          ].map(({ label, cls }) => (
            <span key={label} className={`inline-flex items-center px-2 py-0.5 rounded border text-[11px] font-medium ${cls}`}>
              {label}
            </span>
          ))}
        </div>

      </main>

      {/* Add Shift Modal */}
      {modal && (
        <AddShiftModal
          employees={employees}
          stores={stores}
          defaultDate={modal.date}
          defaultEmployeeId={modal.employeeId}
          defaultStoreId={storeId}
          onClose={() => setModal(null)}
          onCreated={() => { setModal(null); loadShifts(); notify('Shift added') }}
        />
      )}
    </>
  )
}
