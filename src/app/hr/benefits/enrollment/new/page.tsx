'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2 } from 'lucide-react'

interface Plan { id: string; code: string; name: string; planType: string; employeeCost: number; employerCost: number; coverageTypes: string | null }
interface Employee { id: string; firstName: string; lastName: string }
interface Dependent { firstName: string; lastName: string; relationship: string; dateOfBirth: string }

export default function NewEnrollmentPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [plans, setPlans] = useState<Plan[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [form, setForm] = useState({ employeeId: '', planId: '', coverageType: 'employee_only', effectiveDate: '' })
  const [dependents, setDependents] = useState<Dependent[]>([])
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)

  useEffect(() => {
    fetch('/api/hr/benefits/plans').then(r => r.json()).then(setPlans)
    fetch('/api/employees').then(r => r.json()).then((d: { employees?: Employee[] } | Employee[]) => {
      if (Array.isArray(d)) setEmployees(d)
      else if (d.employees) setEmployees(d.employees)
    })
  }, [])

  useEffect(() => {
    const p = plans.find(p => p.id === form.planId) ?? null
    setSelectedPlan(p)
  }, [form.planId, plans])

  const needsDependents = ['employee_spouse', 'employee_children', 'family'].includes(form.coverageType)

  function addDependent() {
    setDependents(d => [...d, { firstName: '', lastName: '', relationship: 'spouse', dateOfBirth: '' }])
  }
  function removeDependent(i: number) { setDependents(d => d.filter((_, idx) => idx !== i)) }
  function updateDependent(i: number, field: keyof Dependent, value: string) {
    setDependents(d => d.map((dep, idx) => idx === i ? { ...dep, [field]: value } : dep))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/hr/benefits/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          dependents: needsDependents ? dependents : [],
        }),
      })
      if (!res.ok) throw new Error('Failed')
      router.push('/hr/benefits/enrollment')
    } catch {
      setSaving(false)
    }
  }

  const coverageOptions = selectedPlan?.coverageTypes
    ? (JSON.parse(selectedPlan.coverageTypes) as string[])
    : ['employee_only', 'employee_spouse', 'employee_children', 'family']

  return (
    <>
      <TopBar title="Enroll Employee in Benefits" />
      <main className="flex-1 p-6 overflow-auto">
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          <h1 className="text-xl font-bold text-zinc-100">Enroll Employee in Benefits</h1>

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
                  <Label>Benefit Plan *</Label>
                  <select value={form.planId} onChange={e => setForm(f => ({ ...f, planId: e.target.value }))} required
                    className="w-full h-10 bg-zinc-900 border border-zinc-700 rounded-lg px-3 text-sm text-zinc-100">
                    <option value="">Select plan...</option>
                    {plans.map(p => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Coverage Type *</Label>
                  <select value={form.coverageType} onChange={e => setForm(f => ({ ...f, coverageType: e.target.value }))} required
                    className="w-full h-10 bg-zinc-900 border border-zinc-700 rounded-lg px-3 text-sm text-zinc-100">
                    {coverageOptions.map(c => (
                      <option key={c} value={c}>{c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Effective Date *</Label>
                  <Input type="date" value={form.effectiveDate} onChange={e => setForm(f => ({ ...f, effectiveDate: e.target.value }))} required />
                </div>
              </div>

              {selectedPlan && (
                <div className="bg-zinc-800/50 rounded-lg p-3 text-sm">
                  <p className="text-zinc-400">Employee cost: <span className="text-zinc-200 font-medium">${selectedPlan.employeeCost.toFixed(2)}/period</span></p>
                  <p className="text-zinc-400">Employer cost: <span className="text-emerald-400 font-medium">${selectedPlan.employerCost.toFixed(2)}/period</span></p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dependents */}
          {needsDependents && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-zinc-200">Dependents</h3>
                <Button type="button" size="sm" variant="outline" onClick={addDependent}>
                  <Plus className="w-4 h-4 mr-1" />Add Dependent
                </Button>
              </div>
              {dependents.map((dep, i) => (
                <Card key={i} className="mb-3">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-zinc-300">Dependent {i + 1}</span>
                      <Button type="button" size="sm" variant="ghost" onClick={() => removeDependent(i)}>
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1"><Label>First Name</Label>
                        <Input value={dep.firstName} onChange={e => updateDependent(i, 'firstName', e.target.value)} /></div>
                      <div className="space-y-1"><Label>Last Name</Label>
                        <Input value={dep.lastName} onChange={e => updateDependent(i, 'lastName', e.target.value)} /></div>
                      <div className="space-y-1"><Label>Relationship</Label>
                        <select value={dep.relationship} onChange={e => updateDependent(i, 'relationship', e.target.value)}
                          className="w-full h-10 bg-zinc-900 border border-zinc-700 rounded-lg px-3 text-sm text-zinc-100">
                          <option value="spouse">Spouse</option>
                          <option value="child">Child</option>
                          <option value="domestic_partner">Domestic Partner</option>
                        </select>
                      </div>
                      <div className="space-y-1"><Label>Date of Birth</Label>
                        <Input type="date" value={dep.dateOfBirth} onChange={e => updateDependent(i, 'dateOfBirth', e.target.value)} /></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>{saving ? 'Enrolling...' : 'Enroll'}</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </main>
    </>
  )
}
