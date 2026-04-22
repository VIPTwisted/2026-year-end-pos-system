'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const PLAN_TYPES = [
  { value: 'medical', label: 'Medical' },
  { value: 'dental', label: 'Dental' },
  { value: 'vision', label: 'Vision' },
  { value: 'life', label: 'Life Insurance' },
  { value: 'disability', label: 'Disability' },
  { value: 'retirement_401k', label: '401(k) Retirement' },
  { value: 'fsa', label: 'FSA' },
  { value: 'hsa', label: 'HSA' },
  { value: 'other', label: 'Other' },
]
const COVERAGE_OPTIONS = ['employee_only', 'employee_spouse', 'employee_children', 'family']

export default function NewBenefitPlanPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    code: '', name: '', planType: 'medical', carrier: '', description: '',
    employeeCost: '', employerCost: '', waitingPeriodDays: '0',
    startDate: '', endDate: '',
  })
  const [coverageTypes, setCoverageTypes] = useState<string[]>(['employee_only'])

  function toggleCoverage(val: string) {
    setCoverageTypes(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/hr/benefits/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          employeeCost: parseFloat(form.employeeCost) || 0,
          employerCost: parseFloat(form.employerCost) || 0,
          waitingPeriodDays: parseInt(form.waitingPeriodDays) || 0,
          coverageTypes,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      router.push('/hr/benefits/plans')
    } catch {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Benefit Plan" />
      <main className="flex-1 p-6 overflow-auto">
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          <h1 className="text-xl font-bold text-zinc-100">New Benefit Plan</h1>

          <Card>
            <CardContent className="pt-5 pb-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Plan Code *</Label>
                  <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} required placeholder="e.g. MED-PPO" />
                </div>
                <div className="space-y-1.5">
                  <Label>Plan Name *</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="e.g. PPO Medical Plan" />
                </div>
                <div className="space-y-1.5">
                  <Label>Plan Type *</Label>
                  <select value={form.planType} onChange={e => setForm(f => ({ ...f, planType: e.target.value }))}
                    className="w-full h-10 bg-zinc-900 border border-zinc-700 rounded-lg px-3 text-sm text-zinc-100">
                    {PLAN_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Carrier</Label>
                  <Input value={form.carrier} onChange={e => setForm(f => ({ ...f, carrier: e.target.value }))} placeholder="e.g. Aetna, BCBS" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Description</Label>
                  <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Plan description" />
                </div>
                <div className="space-y-1.5">
                  <Label>Employee Cost / Period</Label>
                  <Input type="number" step="0.01" value={form.employeeCost} onChange={e => setForm(f => ({ ...f, employeeCost: e.target.value }))} placeholder="0.00" />
                </div>
                <div className="space-y-1.5">
                  <Label>Employer Cost / Period</Label>
                  <Input type="number" step="0.01" value={form.employerCost} onChange={e => setForm(f => ({ ...f, employerCost: e.target.value }))} placeholder="0.00" />
                </div>
                <div className="space-y-1.5">
                  <Label>Waiting Period (days)</Label>
                  <Input type="number" value={form.waitingPeriodDays} onChange={e => setForm(f => ({ ...f, waitingPeriodDays: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Start Date</Label>
                  <Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>End Date</Label>
                  <Input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Coverage Types</Label>
                <div className="flex flex-wrap gap-3">
                  {COVERAGE_OPTIONS.map(c => (
                    <label key={c} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={coverageTypes.includes(c)} onChange={() => toggleCoverage(c)}
                        className="rounded border-zinc-600 bg-zinc-900 text-blue-600" />
                      <span className="text-sm text-zinc-300 capitalize">{c.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Create Plan'}</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </main>
    </>
  )
}
