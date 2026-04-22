'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'

const GARNISH_TYPES = [
  { value: 'child_support', label: 'Child Support' },
  { value: 'alimony', label: 'Alimony / Spousal Support' },
  { value: 'tax_levy', label: 'Tax Levy (IRS/State)' },
  { value: 'creditor', label: 'Creditor Garnishment' },
  { value: 'student_loan', label: 'Student Loan Default' },
]

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS',
  'KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY',
  'NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
]

export default function NewGarnishmentPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<{ id: string; firstName: string; lastName: string }[]>([])
  const [form, setForm] = useState({
    employeeId: '',
    garnishType: '',
    caseNumber: '',
    agency: '',
    issuingState: '',
    amountType: 'fixed',
    amount: '',
    maxPercent: '',
    startDate: '',
    endDate: '',
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/hr/employees').then(r => r.json()).then(d => setEmployees(d.employees ?? d)).catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/hr/payroll/garnishments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          amount: parseFloat(form.amount || '0'),
          maxPercent: form.maxPercent ? parseFloat(form.maxPercent) : null,
        }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Failed to save') }
      router.push('/hr/payroll/garnishments')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-white">
      <TopBar title="New Garnishment" />
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-6">
          <h2 className="font-semibold text-zinc-200 mb-6">New Garnishment Order</h2>
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Employee *</label>
              <select required value={form.employeeId}
                onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                <option value="">Select employee...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Garnishment Type *</label>
                <select required value={form.garnishType}
                  onChange={e => setForm(f => ({ ...f, garnishType: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                  <option value="">Select type...</option>
                  {GARNISH_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Case Number</label>
                <input type="text" value={form.caseNumber} placeholder="Case #"
                  onChange={e => setForm(f => ({ ...f, caseNumber: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Agency</label>
                <input type="text" value={form.agency} placeholder="Issuing agency"
                  onChange={e => setForm(f => ({ ...f, agency: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Issuing State</label>
                <select value={form.issuingState}
                  onChange={e => setForm(f => ({ ...f, issuingState: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                  <option value="">Select state...</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Amount Type *</label>
                <select value={form.amountType}
                  onChange={e => setForm(f => ({ ...f, amountType: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                  <option value="fixed">Fixed $</option>
                  <option value="percent">Percent %</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Amount *</label>
                <input required type="number" step="0.01" value={form.amount} placeholder="0.00"
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Max % Cap</label>
                <input type="number" step="0.01" value={form.maxPercent} placeholder="25"
                  onChange={e => setForm(f => ({ ...f, maxPercent: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Start Date *</label>
                <input required type="date" value={form.startDate}
                  onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">End Date</label>
                <input type="date" value={form.endDate}
                  onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1">Notes</label>
              <textarea rows={2} value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-5 py-2 rounded-lg text-sm font-medium transition-colors">
                {saving ? 'Saving...' : 'Save Garnishment'}
              </button>
              <button type="button" onClick={() => router.back()}
                className="bg-zinc-700 hover:bg-zinc-600 px-5 py-2 rounded-lg text-sm font-medium transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
