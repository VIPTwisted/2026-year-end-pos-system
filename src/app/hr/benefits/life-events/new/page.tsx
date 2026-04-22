'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'

const EVENT_TYPES = [
  { value: 'marriage', label: 'Marriage' },
  { value: 'divorce', label: 'Divorce' },
  { value: 'birth', label: 'Birth of Child' },
  { value: 'adoption', label: 'Adoption' },
  { value: 'death', label: 'Death of Dependent' },
  { value: 'address_change', label: 'Address Change' },
  { value: 'spouse_job_loss', label: 'Spouse Job Loss' },
]

export default function NewLifeEventPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<{ id: string; firstName: string; lastName: string }[]>([])
  const [form, setForm] = useState({
    employeeId: '',
    eventType: '',
    eventDate: '',
    documentation: '',
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
      const res = await fetch('/api/hr/benefits/life-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, changesJson: null }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Failed to save') }
      router.push('/hr/benefits/life-events')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-white">
      <TopBar title="New Life Event" />
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-6">
          <h2 className="font-semibold text-zinc-200 mb-6">Record Life Event</h2>
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

            <div>
              <label className="block text-xs text-zinc-400 mb-1">Event Type *</label>
              <select required value={form.eventType}
                onChange={e => setForm(f => ({ ...f, eventType: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                <option value="">Select event type...</option>
                {EVENT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1">Event Date *</label>
              <input required type="date" value={form.eventDate}
                onChange={e => setForm(f => ({ ...f, eventDate: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1">Documentation Upload (URL / reference)</label>
              <input type="text" value={form.documentation} placeholder="Document reference or URL"
                onChange={e => setForm(f => ({ ...f, documentation: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1">Notes</label>
              <textarea rows={3} value={form.notes} placeholder="Additional notes..."
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-5 py-2 rounded-lg text-sm font-medium transition-colors">
                {saving ? 'Saving...' : 'Submit Life Event'}
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
