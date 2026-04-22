'use client'

import { useState, useEffect, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Plus, X, Loader2, CalendarDays, Trash2 } from 'lucide-react'
import Link from 'next/link'

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

interface WorkSchedule {
  id: string
  employeeId: string
  storeId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
  effectiveFrom: string
  effectiveTo: string | null
  notes: string | null
  createdAt: string
  employee: EmployeeRef
  store: StoreRef
}

// ─── Utilities ────────────────────────────────────────────────────────────────

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function fmt12(t: string): string {
  const [hStr, mStr] = t.split(':')
  const h = parseInt(hStr, 10)
  const m = mStr ?? '00'
  const suffix = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${m} ${suffix}`
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ─── Add Template Modal ───────────────────────────────────────────────────────

interface AddTemplateModalProps {
  employees: EmployeeRef[]
  stores: StoreRef[]
  onClose: () => void
  onCreated: () => void
}

function AddTemplateModal({ employees, stores, onClose, onCreated }: AddTemplateModalProps) {
  const [empId, setEmpId] = useState('')
  const [storeId, setStoreId] = useState('')
  const [dayOfWeek, setDayOfWeek] = useState('1')
  const [start, setStart] = useState('09:00')
  const [end, setEnd] = useState('17:00')
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().slice(0, 10))
  const [effectiveTo, setEffectiveTo] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!empId || !storeId || !start || !end) {
      setErr('Employee, Store, Start Time, and End Time are required')
      return
    }
    setSaving(true)
    setErr(null)
    try {
      const res = await fetch('/api/hr/work-schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: empId,
          storeId,
          dayOfWeek: parseInt(dayOfWeek, 10),
          startTime: start,
          endTime: end,
          effectiveFrom: effectiveFrom || undefined,
          effectiveTo: effectiveTo || undefined,
          notes: notes || undefined,
        }),
      })
      if (!res.ok) {
        const j = await res.json() as { error?: string }
        throw new Error(j.error ?? 'Failed to create template')
      }
      onCreated()
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'Unknown error')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl shadow-2xl w-full max-w-md p-6 overflow-y-auto max-h-[90dvh]">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-zinc-100">Add Recurring Template</h2>
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
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 block mb-1">Day of Week</label>
            <select
              value={dayOfWeek}
              onChange={e => setDayOfWeek(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
            >
              {DAY_NAMES.map((d, i) => (
                <option key={i} value={i}>{d}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 block mb-1">Start Time</label>
              <input
                type="time"
                value={start}
                onChange={e => setStart(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 block mb-1">End Time</label>
              <input
                type="time"
                value={end}
                onChange={e => setEnd(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 block mb-1">Effective From</label>
              <input
                type="date"
                value={effectiveFrom}
                onChange={e => setEffectiveFrom(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 block mb-1">Effective To</label>
              <input
                type="date"
                value={effectiveTo}
                onChange={e => setEffectiveTo(e.target.value)}
                placeholder="Leave blank = no end"
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
              {saving ? 'Saving…' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Delete Confirmation Modal ────────────────────────────────────────────────

interface DeleteModalProps {
  schedule: WorkSchedule
  onClose: () => void
  onDeleted: () => void
}

function DeleteModal({ schedule, onClose, onDeleted }: DeleteModalProps) {
  const [deleting, setDeleting] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function confirm() {
    setDeleting(true)
    setErr(null)
    try {
      const res = await fetch(`/api/hr/work-schedules/${schedule.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const j = await res.json() as { error?: string }
        throw new Error(j.error ?? 'Failed to delete')
      }
      onDeleted()
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'Unknown error')
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-zinc-100">Delete Template</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-[13px] text-zinc-400 mb-4">
          Remove the <span className="text-zinc-200 font-medium">{DAY_NAMES[schedule.dayOfWeek]}</span> template for{' '}
          <span className="text-zinc-200 font-medium">{schedule.employee.lastName}, {schedule.employee.firstName}</span>?
          This will not affect already-created scheduled shifts.
        </p>
        {err && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-[12px] rounded px-3 py-2 mb-4">
            {err}
          </div>
        )}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-md border border-zinc-700 text-zinc-300 text-[13px] hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={confirm}
            disabled={deleting}
            className="flex-1 px-4 py-2 rounded-md bg-red-600 hover:bg-red-500 text-white text-[13px] font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ScheduleTemplatesPage() {
  const [schedules, setSchedules] = useState<WorkSchedule[]>([])
  const [employees, setEmployees] = useState<EmployeeRef[]>([])
  const [stores, setStores] = useState<StoreRef[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [toDelete, setToDelete] = useState<WorkSchedule | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  const loadAll = useCallback(() => {
    setLoading(true)
    Promise.all([
      fetch('/api/hr/work-schedules').then(r => r.json()),
      fetch('/api/hr/employees').then(r => r.json()),
      fetch('/api/stores').then(r => r.json()),
    ]).then(([scheds, emps, sts]: [WorkSchedule[], EmployeeRef[], StoreRef[]]) => {
      setSchedules(scheds)
      setEmployees(emps)
      setStores(sts)
    }).catch(() => notify('Failed to load data', 'err'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  // Group by employee
  const grouped = schedules.reduce<Record<string, WorkSchedule[]>>((acc, s) => {
    const key = s.employeeId
    if (!acc[key]) acc[key] = []
    acc[key].push(s)
    return acc
  }, {})

  return (
    <>
      <TopBar title="Schedule Templates" />
      <main className="flex-1 p-6 overflow-auto space-y-6 bg-[#0f0f1a] min-h-[100dvh]">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg border text-[13px] font-medium shadow-xl
            ${toast.type === 'ok'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-semibold text-zinc-100">Schedule Templates</h1>
            <p className="text-[13px] text-zinc-500">
              Recurring weekly schedule templates — used to auto-generate weekly shifts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/hr/schedule"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-700 text-zinc-300 text-[13px] hover:bg-zinc-800 transition-colors"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Weekly View
            </Link>
            <button
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Template
            </button>
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Total Templates</p>
            <p className="text-2xl font-bold text-zinc-100">{schedules.length}</p>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Active</p>
            <p className="text-2xl font-bold text-emerald-400">{schedules.filter(s => s.isActive).length}</p>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Employees Covered</p>
            <p className="text-2xl font-bold text-zinc-100">{Object.keys(grouped).length}</p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-48 text-zinc-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading templates…
          </div>
        ) : schedules.length === 0 ? (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl flex flex-col items-center justify-center py-20 text-zinc-500">
            <CalendarDays className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-[13px] mb-2">No recurring templates yet</p>
            <button
              onClick={() => setShowAdd(true)}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add First Template
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([empId, empSchedules]) => {
              const emp = empSchedules[0].employee
              return (
                <div key={empId} className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-zinc-800/50 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                      {emp.firstName[0]}{emp.lastName[0]}
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold text-zinc-100">
                        {emp.lastName}, {emp.firstName}
                      </div>
                      <div className="text-[11px] text-zinc-500">{emp.position}{emp.department ? ` · ${emp.department}` : ''}</div>
                    </div>
                    <span className="ml-auto text-[11px] text-zinc-500">{empSchedules.length} day{empSchedules.length !== 1 ? 's' : ''}</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr className="border-b border-zinc-800/50">
                          <th className="text-left px-5 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Day</th>
                          <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Start</th>
                          <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">End</th>
                          <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Store</th>
                          <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Effective From</th>
                          <th className="text-left px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Effective To</th>
                          <th className="text-center px-3 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Status</th>
                          <th className="text-right px-5 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {empSchedules
                          .slice()
                          .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                          .map(s => (
                            <tr key={s.id} className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20 transition-colors">
                              <td className="px-5 py-2 font-medium text-zinc-100">{DAY_NAMES[s.dayOfWeek]}</td>
                              <td className="px-3 py-2 text-zinc-400 font-mono text-[12px]">{fmt12(s.startTime)}</td>
                              <td className="px-3 py-2 text-zinc-400 font-mono text-[12px]">{fmt12(s.endTime)}</td>
                              <td className="px-3 py-2 text-zinc-400">{s.store.name}</td>
                              <td className="px-3 py-2 text-zinc-400">{fmtDate(s.effectiveFrom)}</td>
                              <td className="px-3 py-2 text-zinc-400">{s.effectiveTo ? fmtDate(s.effectiveTo) : '—'}</td>
                              <td className="px-3 py-2 text-center">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium
                                  ${s.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700/50 text-zinc-400'}`}>
                                  {s.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-5 py-2 text-right">
                                <button
                                  onClick={() => setToDelete(s)}
                                  className="text-zinc-500 hover:text-red-400 transition-colors"
                                  title="Delete template"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {showAdd && (
        <AddTemplateModal
          employees={employees}
          stores={stores}
          onClose={() => setShowAdd(false)}
          onCreated={() => { setShowAdd(false); loadAll(); notify('Template created') }}
        />
      )}

      {toDelete && (
        <DeleteModal
          schedule={toDelete}
          onClose={() => setToDelete(null)}
          onDeleted={() => { setToDelete(null); loadAll(); notify('Template deleted') }}
        />
      )}
    </>
  )
}
