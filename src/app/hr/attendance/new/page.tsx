'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Clock, Save, AlertCircle } from 'lucide-react'

interface Employee {
  id: string
  firstName: string
  lastName: string
  position: string
  department: string | null
}

function todayDateStr(): string {
  return new Date().toISOString().split('T')[0]
}

function calcHours(checkIn: string, checkOut: string): string {
  if (!checkIn || !checkOut) return ''
  const [inH, inM] = checkIn.split(':').map(Number)
  const [outH, outM] = checkOut.split(':').map(Number)
  const mins = (outH * 60 + outM) - (inH * 60 + inM)
  if (mins <= 0) return ''
  return (mins / 60).toFixed(2)
}

export default function NewAttendancePage() {
  const router = useRouter()

  const [employees, setEmployees]   = useState<Employee[]>([])
  const [loadingEmp, setLoadingEmp] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState<string | null>(null)

  const [employeeId, setEmployeeId] = useState('')
  const [date, setDate]             = useState(todayDateStr())
  const [checkIn, setCheckIn]       = useState('09:00')
  const [checkOut, setCheckOut]     = useState('')
  const [hoursWorked, setHoursWorked] = useState('')
  const [notes, setNotes]           = useState('')

  const hoursManualRef = useRef(false)

  useEffect(() => {
    fetch('/api/hr/employees')
      .then(r => r.json())
      .then((data: Employee[]) => setEmployees(data))
      .catch(() => setError('Failed to load employees'))
      .finally(() => setLoadingEmp(false))
  }, [])

  // Auto-calculate hours when checkIn/checkOut change
  useEffect(() => {
    if (hoursManualRef.current) return
    const calc = calcHours(checkIn, checkOut)
    if (calc) setHoursWorked(calc)
  }, [checkIn, checkOut])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!employeeId) { setError('Please select an employee.'); return }
    if (!date)       { setError('Please select a date.');     return }
    if (!checkIn)    { setError('Check-in time is required.'); return }

    setSubmitting(true)
    try {
      const body: {
        employeeId: string
        date: string
        checkIn: string
        checkOut?: string
        hoursWorked?: number
        notes?: string
      } = { employeeId, date, checkIn }

      if (checkOut)     body.checkOut     = checkOut
      if (hoursWorked)  body.hoursWorked  = parseFloat(hoursWorked)
      if (notes.trim()) body.notes        = notes.trim()

      const res = await fetch('/api/hr/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const json = await res.json() as { error?: string }
        throw new Error(json.error ?? 'Failed to create attendance record')
      }

      router.push('/hr/attendance')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <TopBar
        title="Log Attendance"
        breadcrumb={[{ label: 'Attendance', href: '/hr/attendance' }]}
        showBack
      />

      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a]">
        <div className="max-w-lg mx-auto">

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-zinc-800/50 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600/10 flex items-center justify-center">
                <Clock className="w-4.5 h-4.5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-zinc-100">Log Attendance</h2>
                <p className="text-[12px] text-zinc-500">Record an employee shift or check-in</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              {error && (
                <div className="flex items-center gap-2.5 p-3 rounded-md bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <p className="text-[13px] text-red-400">{error}</p>
                </div>
              )}

              {/* Employee */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                  Employee <span className="text-red-400">*</span>
                </label>
                <select
                  value={employeeId}
                  onChange={e => setEmployeeId(e.target.value)}
                  disabled={loadingEmp}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-[13px] text-zinc-100 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                >
                  <option value="">
                    {loadingEmp ? 'Loading employees…' : 'Select employee…'}
                  </option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} — {emp.position}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                  Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-[13px] text-zinc-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Check In / Check Out */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                    Check In <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="time"
                    value={checkIn}
                    onChange={e => {
                      hoursManualRef.current = false
                      setCheckIn(e.target.value)
                    }}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-[13px] text-zinc-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                    Check Out
                  </label>
                  <input
                    type="time"
                    value={checkOut}
                    onChange={e => {
                      hoursManualRef.current = false
                      setCheckOut(e.target.value)
                    }}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-[13px] text-zinc-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Hours Worked */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                  Hours Worked
                  <span className="ml-1 text-zinc-600 normal-case tracking-normal font-normal">(auto-calculated, editable)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  step="0.25"
                  placeholder="e.g. 8.00"
                  value={hoursWorked}
                  onChange={e => {
                    hoursManualRef.current = true
                    setHoursWorked(e.target.value)
                  }}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-[13px] text-zinc-100 focus:border-blue-500 focus:outline-none"
                />
                {checkIn && checkOut && !hoursManualRef.current && hoursWorked && (
                  <p className="text-[11px] text-zinc-500">
                    Calculated: {hoursWorked}h from {checkIn} → {checkOut}
                  </p>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                  Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Optional notes…"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-[13px] text-zinc-100 focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting || loadingEmp}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-3.5 h-3.5" />
                  {submitting ? 'Saving…' : 'Save Attendance'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/hr/attendance')}
                  className="px-4 py-2 rounded-md text-zinc-400 hover:text-zinc-200 text-[13px] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}
