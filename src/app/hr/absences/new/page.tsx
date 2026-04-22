'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { ArrowLeft } from 'lucide-react'

type Employee = { id: string; firstName: string; lastName: string; department?: string | null }

const INPUT_CLS = 'w-full rounded-md bg-zinc-900/60 border border-zinc-800/50 text-zinc-100 text-[12px] px-3 py-2 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/60'
const LABEL_CLS = 'block text-[10px] uppercase tracking-wide text-zinc-500 mb-1'

const CAUSES = [
  'Sick Leave',
  'Vacation',
  'Personal',
  'Bereavement',
  'FMLA',
  'Jury Duty',
  'Military Leave',
  'Other',
]

export default function NewAbsencePage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const today = new Date().toISOString().slice(0, 10)

  const [form, setForm] = useState({
    employeeId:     '',
    causeOfAbsence: 'Sick Leave',
    fromDate:       today,
    toDate:         today,
    qty:            '1',
    unitOfMeasure:  'Days',
    notes:          '',
    returnDate:     '',
  })

  useEffect(() => {
    fetch('/api/hr/employees')
      .then(r => r.json())
      .then((data: Employee[]) => setEmployees(data))
      .catch(() => setError('Failed to load employees'))
  }, [])

  // Auto-calculate qty when dates change
  useEffect(() => {
    if (form.fromDate && form.toDate) {
      const diff = Math.max(
        1,
        Math.round((new Date(form.toDate).getTime() - new Date(form.fromDate).getTime()) / (86400000)) + 1
      )
      setForm(prev => ({ ...prev, qty: String(diff) }))
    }
  }, [form.fromDate, form.toDate])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (!form.employeeId) { setError('Please select an employee'); return }
    setLoading(true)
    setError(null)

    const selected = employees.find(e => e.id === form.employeeId)
    const payload = {
      employeeId:     form.employeeId,
      employeeName:   selected ? `${selected.firstName} ${selected.lastName}` : '',
      causeOfAbsence: form.causeOfAbsence,
      fromDate:       form.fromDate,
      toDate:         form.toDate,
      qty:            parseFloat(form.qty) || 1,
      unitOfMeasure:  form.unitOfMeasure,
      notes:          form.notes.trim() || undefined,
      returnDate:     form.returnDate || undefined,
    }

    try {
      const res = await fetch('/api/hr/absences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const json = (await res.json()) as { error?: string }
        throw new Error(json.error ?? 'Failed to register absence')
      }
      router.push('/hr/absences')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
    }
  }

  return (
    <>
      <TopBar title="Register Absence" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-4 max-w-2xl">

          <div className="flex items-center gap-3">
            <Link href="/hr/absences" className="inline-flex items-center gap-1.5 text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Employee Absences
            </Link>
            <span className="text-zinc-700">/</span>
            <span className="text-[12px] text-zinc-400">Register Absence</span>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Human Resources</p>
            <h2 className="text-[18px] font-semibold text-zinc-100">Register Absence</h2>
          </div>

          {error && (
            <div className="rounded-md bg-red-900/30 border border-red-700/50 px-4 py-3 text-[12px] text-red-400">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="bg-[#16213e] border border-zinc-800/50 rounded-lg px-5 py-5 space-y-4">

            {/* Employee */}
            <div>
              <label className={LABEL_CLS}>Employee *</label>
              <select name="employeeId" required value={form.employeeId} onChange={handleChange} className={INPUT_CLS}>
                <option value="">Select employee…</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.lastName}, {e.firstName}{e.department ? ` — ${e.department}` : ''}</option>
                ))}
              </select>
            </div>

            {/* Cause */}
            <div>
              <label className={LABEL_CLS}>Cause of Absence *</label>
              <select name="causeOfAbsence" required value={form.causeOfAbsence} onChange={handleChange} className={INPUT_CLS}>
                {CAUSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL_CLS}>From Date *</label>
                <input name="fromDate" type="date" required value={form.fromDate} onChange={handleChange} className={INPUT_CLS} />
              </div>
              <div>
                <label className={LABEL_CLS}>To Date *</label>
                <input name="toDate" type="date" required value={form.toDate} onChange={handleChange} className={INPUT_CLS} />
              </div>
            </div>

            {/* Qty + Unit */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL_CLS}>Quantity *</label>
                <input name="qty" type="number" step="0.5" min="0.5" required value={form.qty} onChange={handleChange} className={INPUT_CLS} />
              </div>
              <div>
                <label className={LABEL_CLS}>Unit of Measure</label>
                <select name="unitOfMeasure" value={form.unitOfMeasure} onChange={handleChange} className={INPUT_CLS}>
                  <option>Days</option>
                  <option>Hours</option>
                </select>
              </div>
            </div>

            {/* Return Date */}
            <div>
              <label className={LABEL_CLS}>Expected Return Date</label>
              <input name="returnDate" type="date" value={form.returnDate} onChange={handleChange} className={INPUT_CLS} />
            </div>

            {/* Notes */}
            <div>
              <label className={LABEL_CLS}>Notes</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className={INPUT_CLS} placeholder="Optional notes…" />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-[12px] bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
              >
                {loading ? 'Saving…' : 'Register Absence'}
              </button>
              <Link href="/hr/absences">
                <button type="button" className="px-4 py-2 text-[12px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-medium transition-colors">Cancel</button>
              </Link>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}
