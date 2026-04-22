'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { ArrowLeft, Save, Target } from 'lucide-react'

// TODO: POST to /api/hr/development/goals once EmployeeGoal model is in schema

const CATEGORIES = ['Performance', 'Learning', 'Leadership', 'Operations', 'Compliance', 'Career', 'Wellbeing']

type Employee = { id: string; firstName: string; lastName: string; department?: string | null }

export default function NewGoalPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [form, setForm] = useState({
    employeeId: '',
    title: '',
    description: '',
    category: 'Performance',
    targetDate: '',
    measurement: '',
  })

  useEffect(() => {
    fetch('/api/hr/employees?active=true')
      .then(r => r.ok ? r.json() : [])
      .then(data => setEmployees(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  function set(key: string, val: string) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    // TODO: POST to /api/hr/development/goals
    await new Promise(r => setTimeout(r, 600))
    router.push('/hr/development/goals')
  }

  return (
    <>
      <TopBar title="New Goal" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a]">
        <div className="max-w-xl mx-auto space-y-6">

          <div>
            <Link href="/hr/development/goals" className="inline-flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-zinc-100 mb-3 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Goals
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-blue-600/20 border border-blue-600/30 flex items-center justify-center">
                <Target className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h1 className="text-[18px] font-semibold text-zinc-100">New Employee Goal</h1>
                <p className="text-[13px] text-zinc-500">Set a measurable development or performance goal</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Employee + category */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
              <h2 className="text-[11px] uppercase tracking-widest text-zinc-500 font-medium">Goal Owner</h2>

              <div>
                <label className="block text-[12px] text-zinc-400 mb-1.5">Employee <span className="text-red-400">*</span></label>
                <select
                  required
                  value={form.employeeId}
                  onChange={e => set('employeeId', e.target.value)}
                  className="w-full bg-zinc-900/60 border border-zinc-700 rounded-md px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="">Select employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.lastName}, {emp.firstName}{emp.department ? ` — ${emp.department}` : ''}
                    </option>
                  ))}
                </select>
                {employees.length === 0 && (
                  <p className="text-[11px] text-zinc-600 mt-1">Loading employees or enter manually below</p>
                )}
              </div>

              <div>
                <label className="block text-[12px] text-zinc-400 mb-1.5">Category <span className="text-red-400">*</span></label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => set('category', c)}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                        form.category === c
                          ? 'bg-blue-600 text-white'
                          : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Goal details */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
              <h2 className="text-[11px] uppercase tracking-widest text-zinc-500 font-medium">Goal Details</h2>

              <div>
                <label className="block text-[12px] text-zinc-400 mb-1.5">Title <span className="text-red-400">*</span></label>
                <input
                  required
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  placeholder="e.g. Complete POS Certification by Q2"
                  className="w-full bg-zinc-900/60 border border-zinc-700 rounded-md px-3 py-2 text-[13px] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[12px] text-zinc-400 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="What does success look like? Why is this goal important?"
                  className="w-full bg-zinc-900/60 border border-zinc-700 rounded-md px-3 py-2 text-[13px] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] text-zinc-400 mb-1.5">Target Date <span className="text-red-400">*</span></label>
                  <input
                    required
                    type="date"
                    value={form.targetDate}
                    onChange={e => set('targetDate', e.target.value)}
                    className="w-full bg-zinc-900/60 border border-zinc-700 rounded-md px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[12px] text-zinc-400 mb-1.5">Measurement Criteria</label>
                  <input
                    value={form.measurement}
                    onChange={e => set('measurement', e.target.value)}
                    placeholder="e.g. Certification exam passed"
                    className="w-full bg-zinc-900/60 border border-zinc-700 rounded-md px-3 py-2 text-[13px] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Link
                href="/hr/development/goals"
                className="px-4 py-2 rounded-md border border-zinc-700 text-zinc-300 hover:text-zinc-100 text-[13px] transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[13px] font-medium transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving...' : 'Create Goal'}
              </button>
            </div>

          </form>
        </div>
      </main>
    </>
  )
}
