'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'

interface LeaveType { id: string; code: string; name: string; isPaid: boolean; isFmlaEligible: boolean }
interface Employee { id: string; firstName: string; lastName: string }

const FMLA_REASONS = [
  { value: 'serious_health_condition', label: 'Serious Health Condition (Self)' },
  { value: 'family_care', label: 'Family Member Care' },
  { value: 'military_exigency', label: 'Military Exigency' },
  { value: 'military_caregiver', label: 'Military Caregiver' },
  { value: 'birth_adoption', label: 'Birth, Adoption, or Foster Placement' },
]

export default function NewLeaveRequestPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [form, setForm] = useState({
    employeeId: '',
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    hours: '8',
    halfDay: false,
    reason: '',
    isFmla: false,
  })
  const [fmlaReason, setFmlaReason] = useState('serious_health_condition')

  useEffect(() => {
    fetch('/api/hr/leave/types')
      .then(r => r.json())
      .then(d => Array.isArray(d) ? setLeaveTypes(d) : setLeaveTypes([]))
    fetch('/api/hr/employees')
      .then(r => r.json())
      .then((d: { employees?: Employee[] } | Employee[]) => {
        if (Array.isArray(d)) setEmployees(d)
        else if (d.employees) setEmployees(d.employees)
      })
      .catch(() => {
        // Fallback to employees endpoint
        fetch('/api/employees')
          .then(r => r.json())
          .then((d: { employees?: Employee[] } | Employee[]) => {
            if (Array.isArray(d)) setEmployees(d)
            else if (d.employees) setEmployees(d.employees)
          })
          .catch(() => {})
      })
  }, [])

  // Auto-calculate hours when dates change
  useEffect(() => {
    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate)
      const end = new Date(form.endDate)
      if (end >= start) {
        const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
        const days = form.halfDay ? 0.5 : diffDays
        setForm(f => ({ ...f, hours: String(days * 8) }))
      }
    }
  }, [form.startDate, form.endDate, form.halfDay])

  const selectedType = leaveTypes.find(t => t.id === form.leaveTypeId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const selectedEmp = employees.find(e => e.id === form.employeeId)
      const res = await fetch('/api/hr/leave/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          employeeName: selectedEmp ? `${selectedEmp.firstName} ${selectedEmp.lastName}` : form.employeeId,
          leaveTypeName: selectedType?.name ?? 'Vacation',
          hours: parseFloat(form.hours) || 8,
          fmlaDetails: form.isFmla ? { fmlaReason } : undefined,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      router.push('/hr/leave/requests')
    } catch {
      setSaving(false)
    }
  }

  const inputCls = 'w-full rounded-md bg-zinc-900 border border-zinc-700 text-zinc-100 text-[13px] px-3 py-2 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500'
  const labelCls = 'block text-[12px] text-zinc-400 mb-1'

  return (
    <>
      <TopBar title="New Leave Request" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a]">
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">

          <div>
            <h1 className="text-[18px] font-semibold text-zinc-100">New Leave Request</h1>
            <p className="text-[13px] text-zinc-500">Submit a leave or absence request</p>
          </div>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Employee *</label>
                <select value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))} required className={inputCls}>
                  <option value="">Select employee...</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.lastName}, {e.firstName}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Leave Type *</label>
                <select value={form.leaveTypeId} onChange={e => setForm(f => ({ ...f, leaveTypeId: e.target.value }))} required className={inputCls}>
                  <option value="">Select leave type...</option>
                  {leaveTypes.length === 0 && (
                    <option value="vacation">Vacation (default)</option>
                  )}
                  {leaveTypes.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name}{!t.isPaid ? ' (Unpaid)' : ''}{t.isFmlaEligible ? ' [FMLA]' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Start Date *</label>
                <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>End Date *</label>
                <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Hours *</label>
                <input type="number" step="0.5" min="0.5" value={form.hours}
                  onChange={e => setForm(f => ({ ...f, hours: e.target.value }))}
                  required className={inputCls} />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.halfDay}
                    onChange={e => setForm(f => ({ ...f, halfDay: e.target.checked }))}
                    className="rounded border-zinc-600 bg-zinc-900 text-blue-600 w-4 h-4" />
                  <span className="text-[13px] text-zinc-300">Half Day</span>
                </label>
              </div>
            </div>

            <div>
              <label className={labelCls}>Reason</label>
              <input value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                placeholder="Optional reason for leave" className={inputCls} />
            </div>

            {/* FMLA toggle */}
            <div className="pt-1 border-t border-zinc-800/50">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isFmla}
                  onChange={e => setForm(f => ({ ...f, isFmla: e.target.checked }))}
                  className="rounded border-zinc-600 bg-zinc-900 text-purple-600 w-4 h-4" />
                <span className="text-[13px] font-medium text-zinc-200">This is an FMLA leave request</span>
              </label>
            </div>

            {form.isFmla && (
              <div className="border border-purple-500/30 rounded-lg p-4 space-y-3 bg-purple-500/5">
                <p className="text-[10px] uppercase tracking-widest text-purple-400 mb-2">FMLA Details</p>
                <div>
                  <label className={labelCls}>FMLA Reason</label>
                  <select value={fmlaReason} onChange={e => setFmlaReason(e.target.value)} className={inputCls}>
                    {FMLA_REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[13px] font-medium transition-colors">
              {saving ? 'Submitting...' : 'Submit Request'}
            </button>
            <button type="button" onClick={() => router.back()}
              className="px-4 py-2 rounded-md border border-zinc-700 text-zinc-300 hover:text-zinc-100 text-[13px] transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </main>
    </>
  )
}
