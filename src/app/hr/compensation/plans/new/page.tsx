'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2 } from 'lucide-react'

interface Grade {
  gradeCode: string
  description: string
  minAmount: string
  midAmount: string
  maxAmount: string
  steps: { stepNo: string; amount: string }[]
}

export default function NewCompensationPlanPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    code: '', description: '', type: 'fixed', currency: 'USD',
    effectiveDate: '', expirationDate: '',
  })
  const [grades, setGrades] = useState<Grade[]>([])

  function addGrade() {
    setGrades(g => [...g, { gradeCode: '', description: '', minAmount: '', midAmount: '', maxAmount: '', steps: [] }])
  }
  function removeGrade(i: number) { setGrades(g => g.filter((_, idx) => idx !== i)) }
  function updateGrade(i: number, field: keyof Grade, value: string) {
    setGrades(g => g.map((gr, idx) => idx === i ? { ...gr, [field]: value } : gr))
  }
  function addStep(gi: number) {
    setGrades(g => g.map((gr, idx) => idx === gi
      ? { ...gr, steps: [...gr.steps, { stepNo: String(gr.steps.length + 1), amount: '' }] }
      : gr))
  }
  function removeStep(gi: number, si: number) {
    setGrades(g => g.map((gr, idx) => idx === gi
      ? { ...gr, steps: gr.steps.filter((_, sidx) => sidx !== si) }
      : gr))
  }
  function updateStep(gi: number, si: number, field: 'stepNo' | 'amount', value: string) {
    setGrades(g => g.map((gr, idx) => idx === gi
      ? { ...gr, steps: gr.steps.map((s, sidx) => sidx === si ? { ...s, [field]: value } : s) }
      : gr))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/hr/compensation/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form }),
      })
      if (!res.ok) throw new Error('Failed to create plan')
      const plan = await res.json()

      // Create grades
      for (const grade of grades) {
        const gr = await fetch(`/api/hr/compensation/grades`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planId: plan.id,
            gradeCode: grade.gradeCode,
            description: grade.description,
            minAmount: parseFloat(grade.minAmount) || 0,
            midAmount: parseFloat(grade.midAmount) || 0,
            maxAmount: parseFloat(grade.maxAmount) || 0,
          }),
        })
        if (gr.ok) {
          const grData = await gr.json()
          for (const step of grade.steps) {
            await fetch(`/api/hr/compensation/steps`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                gradeId: grData.id,
                stepNo: parseInt(step.stepNo) || 1,
                amount: parseFloat(step.amount) || 0,
              }),
            })
          }
        }
      }
      router.push(`/hr/compensation/plans/${plan.id}`)
    } catch {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Compensation Plan" />
      <main className="flex-1 p-6 overflow-auto">
        <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">New Compensation Plan</h1>
            <p className="text-sm text-zinc-500">Create a fixed, variable, band, grade, or step plan</p>
          </div>

          <Card>
            <CardContent className="pt-5 pb-4 space-y-4">
              <h3 className="text-sm font-semibold text-zinc-200">Plan Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="code">Plan Code *</Label>
                  <Input id="code" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} required placeholder="e.g. SAL-EXEC" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="type">Plan Type</Label>
                  <select id="type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full h-10 bg-zinc-900 border border-zinc-700 rounded-lg px-3 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                    {['fixed', 'variable', 'band', 'grade', 'step'].map(t => (
                      <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="description">Description *</Label>
                  <Input id="description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required placeholder="Plan description" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="currency">Currency</Label>
                  <Input id="currency" value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} placeholder="USD" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="effectiveDate">Effective Date</Label>
                  <Input id="effectiveDate" type="date" value={form.effectiveDate} onChange={e => setForm(f => ({ ...f, effectiveDate: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="expirationDate">Expiration Date</Label>
                  <Input id="expirationDate" type="date" value={form.expirationDate} onChange={e => setForm(f => ({ ...f, expirationDate: e.target.value }))} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grades */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-zinc-200">Compensation Grades</h3>
              <Button type="button" size="sm" variant="outline" onClick={addGrade}>
                <Plus className="w-4 h-4 mr-1" />Add Grade
              </Button>
            </div>
            {grades.map((grade, gi) => (
              <Card key={gi} className="mb-4">
                <CardContent className="pt-4 pb-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-200">Grade {gi + 1}</span>
                    <Button type="button" size="sm" variant="ghost" onClick={() => removeGrade(gi)}>
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Grade Code</Label>
                      <Input value={grade.gradeCode} onChange={e => updateGrade(gi, 'gradeCode', e.target.value)} placeholder="e.g. G1" />
                    </div>
                    <div className="space-y-1">
                      <Label>Description</Label>
                      <Input value={grade.description} onChange={e => updateGrade(gi, 'description', e.target.value)} placeholder="Grade description" />
                    </div>
                    <div className="space-y-1">
                      <Label>Min Amount</Label>
                      <Input type="number" value={grade.minAmount} onChange={e => updateGrade(gi, 'minAmount', e.target.value)} placeholder="0.00" />
                    </div>
                    <div className="space-y-1">
                      <Label>Mid Amount</Label>
                      <Input type="number" value={grade.midAmount} onChange={e => updateGrade(gi, 'midAmount', e.target.value)} placeholder="0.00" />
                    </div>
                    <div className="space-y-1">
                      <Label>Max Amount</Label>
                      <Input type="number" value={grade.maxAmount} onChange={e => updateGrade(gi, 'maxAmount', e.target.value)} placeholder="0.00" />
                    </div>
                  </div>

                  {/* Steps */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-zinc-500 uppercase tracking-wide">Steps</span>
                      <Button type="button" size="sm" variant="ghost" onClick={() => addStep(gi)} className="text-xs h-6 px-2">
                        <Plus className="w-3 h-3 mr-1" />Add Step
                      </Button>
                    </div>
                    {grade.steps.map((step, si) => (
                      <div key={si} className="flex items-center gap-2 mb-2">
                        <Input className="w-24" type="number" value={step.stepNo} onChange={e => updateStep(gi, si, 'stepNo', e.target.value)} placeholder="Step #" />
                        <Input type="number" value={step.amount} onChange={e => updateStep(gi, si, 'amount', e.target.value)} placeholder="Amount" />
                        <Button type="button" size="sm" variant="ghost" onClick={() => removeStep(gi, si)}>
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? 'Creating...' : 'Create Plan'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </main>
    </>
  )
}
