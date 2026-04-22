'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Employee { id: string; firstName: string; lastName: string }

const INJURY_TYPES = ['laceration', 'strain', 'fracture', 'burn', 'illness', 'near_miss', 'other']
const SEVERITIES = [
  { value: 'near_miss', label: 'Near Miss' },
  { value: 'first_aid', label: 'First Aid Only' },
  { value: 'minor', label: 'Minor (no lost time)' },
  { value: 'lost_time', label: 'Lost Time' },
  { value: 'fatality', label: 'Fatality' },
]

export default function NewInjuryPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [form, setForm] = useState({
    employeeId: '', incidentDate: '', location: '', description: '',
    injuryType: 'strain', bodyPart: '', severity: 'minor',
    daysLost: '0', recordable: false, oshaRecordable: false,
    treatment: '', witnesses: '',
  })

  useEffect(() => {
    fetch('/api/employees').then(r => r.json()).then((d: { employees?: Employee[] } | Employee[]) => {
      if (Array.isArray(d)) setEmployees(d)
      else if (d.employees) setEmployees(d.employees)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/hr/injuries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, daysLost: parseInt(form.daysLost) || 0 }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      router.push(`/hr/injuries/${data.id}`)
    } catch {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="Report Incident" />
      <main className="flex-1 p-6 overflow-auto">
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          <h1 className="text-xl font-bold text-zinc-100">Report Injury / Incident</h1>

          <Card>
            <CardContent className="pt-5 pb-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Employee *</Label>
                  <select value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))} required
                    className="w-full h-10 bg-zinc-900 border border-zinc-700 rounded-lg px-3 text-sm text-zinc-100">
                    <option value="">Select employee...</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.lastName}, {e.firstName}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Incident Date *</Label>
                  <Input type="date" value={form.incidentDate} onChange={e => setForm(f => ({ ...f, incidentDate: e.target.value }))} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Location</Label>
                  <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Warehouse Bay 3" />
                </div>
                <div className="space-y-1.5">
                  <Label>Injury Type *</Label>
                  <select value={form.injuryType} onChange={e => setForm(f => ({ ...f, injuryType: e.target.value }))} required
                    className="w-full h-10 bg-zinc-900 border border-zinc-700 rounded-lg px-3 text-sm text-zinc-100">
                    {INJURY_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Body Part Affected</Label>
                  <Input value={form.bodyPart} onChange={e => setForm(f => ({ ...f, bodyPart: e.target.value }))} placeholder="e.g. Left hand, Lower back" />
                </div>
                <div className="space-y-1.5">
                  <Label>Severity *</Label>
                  <select value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))} required
                    className="w-full h-10 bg-zinc-900 border border-zinc-700 rounded-lg px-3 text-sm text-zinc-100">
                    {SEVERITIES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Days Lost</Label>
                  <Input type="number" value={form.daysLost} onChange={e => setForm(f => ({ ...f, daysLost: e.target.value }))} min="0" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Description *</Label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required
                    rows={3} placeholder="Describe the incident in detail..."
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 resize-none" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Treatment</Label>
                  <Input value={form.treatment} onChange={e => setForm(f => ({ ...f, treatment: e.target.value }))} placeholder="Treatment provided" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Witnesses</Label>
                  <Input value={form.witnesses} onChange={e => setForm(f => ({ ...f, witnesses: e.target.value }))} placeholder="Witness names" />
                </div>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.recordable} onChange={e => setForm(f => ({ ...f, recordable: e.target.checked }))}
                    className="rounded border-zinc-600 bg-zinc-900 text-blue-600" />
                  <span className="text-sm text-zinc-300">Recordable Incident</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.oshaRecordable} onChange={e => setForm(f => ({ ...f, oshaRecordable: e.target.checked }))}
                    className="rounded border-zinc-600 bg-zinc-900 text-red-600" />
                  <span className="text-sm text-zinc-300">OSHA 300 Recordable</span>
                </label>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Report Incident'}</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </main>
    </>
  )
}
