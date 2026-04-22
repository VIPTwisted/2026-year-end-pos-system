'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'

const REQUEST_TYPES = [
  { value: 'continuous', label: 'Continuous Leave' },
  { value: 'intermittent', label: 'Intermittent Leave' },
  { value: 'reduced_schedule', label: 'Reduced Schedule' },
]

const FMLA_REASONS = [
  { value: 'serious_health', label: 'Serious Health Condition (Employee)' },
  { value: 'family_member', label: 'Care for Family Member' },
  { value: 'military', label: 'Military Family Leave' },
  { value: 'birth_adoption', label: 'Birth / Adoption / Foster Care' },
]

export default function NewFMLAPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<{ id: string; firstName: string; lastName: string }[]>([])
  const [form, setForm] = useState({
    employeeId: '',
    requestType: 'continuous',
    fmlaReason: '',
    startDate: '',
    endDate: '',
    hoursApproved: '',
    certificationDue: '',
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
      const res = await fetch('/api/hr/leave-absence/fmla', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          hoursApproved: form.hoursApproved ? parseFloat(form.hoursApproved) : null,
        }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Failed to save') }
      router.push('/hr/leave-absence/fmla')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-white">
      <TopBar title="New FMLA Request" />
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-6">
          <h2 className="font-semibold text-zinc-200 mb-6">New FMLA Request</h2>
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
                <label className="block text-xs text-zinc-400 mb-1">Request Type *</label>
                <select required value={form.requestType}
                  onChange={e => setForm(f => ({ ...f, requestType: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                  {REQUEST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">FMLA Reason *</label>
                <select required value={form.fmlaReason}
                  onChange={e => setForm(f => ({ ...f, fmlaReason: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                  <option value="">Select reason...</option>
                  {FMLA_REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Hours Approved</label>
                <input type="number" step="0.5" value={form.hoursApproved} placeholder="480"
                  onChange={e => setForm(f => ({ ...f, hoursApproved: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Certification Due</label>
                <input type="date" value={form.certificationDue}
                  onChange={e => setForm(f => ({ ...f, certificationDue: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1">Notes</label>
              <textarea rows={3} value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-5 py-2 rounded-lg text-sm font-medium transition-colors">
                {saving ? 'Submitting...' : 'Submit Request'}
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
