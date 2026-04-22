'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'

type AbsenceCode = { id: string; code: string; description: string; type: string }
type Employee = { id: string; firstName: string; lastName: string }

export default function NewAbsencePage() {
  const router = useRouter()
  const [codes, setCodes] = useState<AbsenceCode[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [saving, setSaving] = useState(false)

  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({
    employeeId: '',
    codeId: '',
    fromDate: today,
    toDate: today,
    quantity: 1,
    unit: 'days',
    description: '',
  })

  useEffect(() => {
    fetch('/api/hr/absence/codes').then(r => r.json()).then(setCodes).catch(() => {})
    fetch('/api/hr/employees').then(r => r.json()).then(setEmployees).catch(() => {})
  }, [])

  const inp = 'w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await fetch('/api/hr/absence/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          fromDate: new Date(form.fromDate).toISOString(),
          toDate: new Date(form.toDate).toISOString(),
          quantity: parseFloat(String(form.quantity)),
          status: 'pending',
        }),
      })
      router.push('/hr/absence')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Absence Registration" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a]">
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4">Absence Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Employee *</label>
                <select required className={inp} value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))}>
                  <option value="">Select employee...</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Absence Code *</label>
                <select required className={inp} value={form.codeId} onChange={e => setForm(f => ({ ...f, codeId: e.target.value }))}>
                  <option value="">Select code...</option>
                  {codes.map(c => <option key={c.id} value={c.id}>{c.code} — {c.description}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">From Date *</label>
                  <input type="date" required className={inp} value={form.fromDate} onChange={e => setForm(f => ({ ...f, fromDate: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">To Date *</label>
                  <input type="date" required className={inp} value={form.toDate} onChange={e => setForm(f => ({ ...f, toDate: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Quantity *</label>
                  <input type="number" step="0.5" min="0.5" required className={inp} value={form.quantity}
                    onChange={e => setForm(f => ({ ...f, quantity: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Unit</label>
                  <select className={inp} value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
                    <option value="days">Days</option>
                    <option value="hours">Hours</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Description</label>
                <textarea className={inp + ' resize-none'} rows={2} value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Optional notes..." />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Registration'}
            </Button>
          </div>
        </form>
      </div>
      </main>
    </>
  )
}
