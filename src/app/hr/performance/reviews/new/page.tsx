'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2 } from 'lucide-react'

interface Employee { id: string; firstName: string; lastName: string }
interface Goal { id: string; title: string; status: string }
interface GoalRow { goalId?: string; goalTitle: string }

export default function NewPerformanceReviewPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [existingGoals, setExistingGoals] = useState<Goal[]>([])
  const [form, setForm] = useState({ employeeId: '', reviewerId: '', reviewPeriodStart: '', reviewPeriodEnd: '' })
  const [goalRows, setGoalRows] = useState<GoalRow[]>([])

  useEffect(() => {
    fetch('/api/employees').then(r => r.json()).then((d: { employees?: Employee[] } | Employee[]) => {
      if (Array.isArray(d)) setEmployees(d)
      else if (d.employees) setEmployees(d.employees)
    })
  }, [])

  useEffect(() => {
    if (form.employeeId) {
      fetch(`/api/hr/performance/goals?employeeId=${form.employeeId}&status=in_progress`)
        .then(r => r.json()).then(setExistingGoals)
    }
  }, [form.employeeId])

  function addGoalRow() {
    setGoalRows(g => [...g, { goalTitle: '' }])
  }
  function removeGoalRow(i: number) { setGoalRows(g => g.filter((_, idx) => idx !== i)) }
  function updateGoalRow(i: number, field: keyof GoalRow, value: string) {
    setGoalRows(g => g.map((row, idx) => idx === i ? { ...row, [field]: value } : row))
  }
  function toggleExistingGoal(goal: Goal) {
    const exists = goalRows.some(r => r.goalId === goal.id)
    if (exists) {
      setGoalRows(g => g.filter(r => r.goalId !== goal.id))
    } else {
      setGoalRows(g => [...g, { goalId: goal.id, goalTitle: goal.title }])
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/hr/performance/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, goals: goalRows }),
      })
      if (!res.ok) throw new Error('Failed')
      const review = await res.json()
      router.push(`/hr/performance/reviews/${review.id}`)
    } catch {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Performance Review" />
      <main className="flex-1 p-6 overflow-auto">
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          <h1 className="text-xl font-bold text-zinc-100">New Performance Review</h1>

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
                  <Label>Reviewer (Manager)</Label>
                  <select value={form.reviewerId} onChange={e => setForm(f => ({ ...f, reviewerId: e.target.value }))}
                    className="w-full h-10 bg-zinc-900 border border-zinc-700 rounded-lg px-3 text-sm text-zinc-100">
                    <option value="">Select reviewer...</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.lastName}, {e.firstName}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Review Period Start *</Label>
                  <Input type="date" value={form.reviewPeriodStart} onChange={e => setForm(f => ({ ...f, reviewPeriodStart: e.target.value }))} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Review Period End *</Label>
                  <Input type="date" value={form.reviewPeriodEnd} onChange={e => setForm(f => ({ ...f, reviewPeriodEnd: e.target.value }))} required />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Existing goals */}
          {existingGoals.length > 0 && (
            <Card>
              <CardContent className="pt-4 pb-4 space-y-3">
                <h3 className="text-sm font-semibold text-zinc-200">Include Existing Goals</h3>
                <div className="space-y-2">
                  {existingGoals.map(g => (
                    <label key={g.id} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={goalRows.some(r => r.goalId === g.id)} onChange={() => toggleExistingGoal(g)}
                        className="rounded border-zinc-600 bg-zinc-900 text-blue-600" />
                      <span className="text-sm text-zinc-300">{g.title}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Manual goal rows */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-zinc-200">Manual Goal Rows</h3>
              <Button type="button" size="sm" variant="outline" onClick={addGoalRow}>
                <Plus className="w-4 h-4 mr-1" />Add Goal
              </Button>
            </div>
            {goalRows.filter(r => !r.goalId).map((row, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <Input value={row.goalTitle} onChange={e => updateGoalRow(i, 'goalTitle', e.target.value)} placeholder="Goal title" />
                <Button type="button" size="sm" variant="ghost" onClick={() => removeGoalRow(i)}>
                  <Trash2 className="w-4 h-4 text-red-400" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create Review'}</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </main>
    </>
  )
}
