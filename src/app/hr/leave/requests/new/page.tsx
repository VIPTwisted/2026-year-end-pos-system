'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'

interface LeaveType { id: string; code: string; name: string; category: string; isPaid: boolean }
interface Employee { id: string; firstName: string; lastName: string }
interface Balance { available: number; balance: number; plan: { name: string } }

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
  const [balance, setBalance] = useState<Balance | null>(null)
  const [form, setForm] = useState({
    employeeId: '', leaveTypeId: '', startDate: '', endDate: '',
    hours: '', halfDay: false, reason: '', isFmla: false,
  })
  const [fmla, setFmla] = useState({
    fmlaReason: 'serious_health_condition',
    certificationRequired: true, intermittent: false, reducedSchedule: false,
  })

  useEffect(() => {
    fetch('/api/hr/leave/types').then(r => r.json()).then(setLeaveTypes)
    fetch('/api/employees').then(r => r.json()).then((d: { employees?: Employee[] } | Employee[]) => {
      if (Array.isArray(d)) setEmployees(d)
      else if (d.employees) setEmployees(d.employees)
    })
  }, [])

  useEffect(() => {
    if (form.employeeId && form.leaveTypeId) {
      fetch(`/api/hr/leave/balances?employeeId=${form.employeeId}`)
        .then(r => r.json())
        .then((balances: (Balance & { plan: { leaveTypeId: string } })[]) => {
          const b = balances.find(b => b.plan?.leaveTypeId === form.leaveTypeId)
          setBalance(b ?? null)
        })
    }
  }, [form.employeeId, form.leaveTypeId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/hr/leave/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          hours: parseFloat(form.hours) || 0,
          fmlaDetails: form.isFmla ? fmla : undefined,
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
                  {leaveTypes.map(t => <option key={t.id} value={t.id}>{t.name} {!t.isPaid ? '(Unpaid)' : ''}</option>)}
                </select>
              </div>
            </div>

            {balance && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-2 text-[13px]">
                <span className="text-zinc-400">Available balance: </span>
                <span className="text-blue-400 font-medium">{balance.available.toFixed(1)} hours</span>
                <span className="text-zinc-600 ml-2">({balance.plan.name})</span>
              </div>
            )}

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
                <input type="number" step="0.5" value={form.hours} onChange={e => setForm(f => ({ ...f, hours: e.target.value }))} required placeholder="8" className={inputCls} />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.halfDay} onChange={e => setForm(f => ({ ...f, halfDay: e.target.checked }))}
                    className="rounded border-zinc-600 bg-zinc-900 text-blue-600" />
                  <span className="text-[13px] text-zinc-300">Half Day</span>
                </label>
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Reason</label>
                <input value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="Optional reason for leave" className={inputCls} />
              </div>
            </div>

            {/* FMLA toggle */}
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isFmla} onChange={e => setForm(f => ({ ...f, isFmla: e.target.checked }))}
                  className="rounded border-zinc-600 bg-zinc-900 text-purple-600" />
                <span className="text-[13px] font-medium text-zinc-200">This is an FMLA leave request</span>
              </label>
            </div>

            {form.isFmla && (
              <div className="border border-purple-500/30 rounded-lg p-4 space-y-3 bg-purple-500/5">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 border-b border-zinc-800/50 pb-1 mb-3">FMLA Details</p>
                <div>
                  <label className={labelCls}>FMLA Reason</label>
                  <select value={fmla.fmlaReason} onChange={e => setFmla(f => ({ ...f, fmlaReason: e.target.value }))} className={inputCls}>
                    {FMLA_REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div className="flex gap-4 flex-wrap">
                  {[
                    { key: 'certificationRequired', label: 'Certification Required' },
                    { key: 'intermittent', label: 'Intermittent Leave' },
                    { key: 'reducedSchedule', label: 'Reduced Schedule' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={fmla[key as keyof typeof fmla] as boolean}
                        onChange={e => setFmla(f => ({ ...f, [key]: e.target.checked }))}
                        className="rounded border-zinc-600 bg-zinc-900 text-purple-600" />
                      <span className="text-[13px] text-zinc-300">{label}</span>
                    </label>
                  ))}
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
