'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'

// Wired to existing CompensationPlan model via /api/hr/compensation/plans
// Grade table maps to CompensationGrade (min/mid/max per grade label)

type GradeRow = {
  id: string
  label: string
  min: string
  mid: string
  max: string
}

const PLAN_TYPES = [
  { value: 'band', label: 'Pay Band' },
  { value: 'grade', label: 'Pay Grade' },
  { value: 'step', label: 'Step Structure' },
  { value: 'fixed', label: 'Fixed Rate' },
]

const PAY_FREQUENCIES = ['annual', 'monthly', 'semimonthly', 'biweekly', 'weekly', 'hourly']
const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'MXN']

export default function NewFixedPlanPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    code: '',
    description: '',
    type: 'grade',
    payFrequency: 'annual',
    currency: 'USD',
    effectiveDate: '',
  })
  const [grades, setGrades] = useState<GradeRow[]>([
    { id: '1', label: 'Grade 1', min: '', mid: '', max: '' },
    { id: '2', label: 'Grade 2', min: '', mid: '', max: '' },
    { id: '3', label: 'Grade 3', min: '', mid: '', max: '' },
  ])

  function setField(key: string, val: string) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  function updateGrade(id: string, field: keyof GradeRow, val: string) {
    setGrades(prev => prev.map(g => g.id === id ? { ...g, [field]: val } : g))
  }

  function addGrade() {
    const n = grades.length + 1
    setGrades(prev => [...prev, { id: String(Date.now()), label: `Grade ${n}`, min: '', mid: '', max: '' }])
  }

  function removeGrade(id: string) {
    setGrades(prev => prev.filter(g => g.id !== id))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/hr/compensation/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, grades }),
      })
      if (res.ok) router.push('/hr/compensation/fixed-plans')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Fixed Compensation Plan" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a]">
        <div className="max-w-2xl mx-auto space-y-6">

          <div>
            <Link href="/hr/compensation/fixed-plans" className="inline-flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-zinc-100 mb-3 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Fixed Plans
            </Link>
            <h1 className="text-[18px] font-semibold text-zinc-100">New Fixed Compensation Plan</h1>
            <p className="text-[13px] text-zinc-500">Define pay bands, grades, or step structures</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Plan details */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
              <h2 className="text-[11px] uppercase tracking-widest text-zinc-500 font-medium">Plan Details</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] text-zinc-400 mb-1.5">Plan Code <span className="text-red-400">*</span></label>
                  <input
                    required
                    value={form.code}
                    onChange={e => setField('code', e.target.value.toUpperCase())}
                    placeholder="e.g. GRADE-A"
                    className="w-full bg-zinc-900/60 border border-zinc-700 rounded-md px-3 py-2 text-[13px] font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[12px] text-zinc-400 mb-1.5">Type <span className="text-red-400">*</span></label>
                  <select
                    required
                    value={form.type}
                    onChange={e => setField('type', e.target.value)}
                    className="w-full bg-zinc-900/60 border border-zinc-700 rounded-md px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    {PLAN_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] text-zinc-400 mb-1.5">Description</label>
                <input
                  value={form.description}
                  onChange={e => setField('description', e.target.value)}
                  placeholder="e.g. Retail Sales Pay Grades 2026"
                  className="w-full bg-zinc-900/60 border border-zinc-700 rounded-md px-3 py-2 text-[13px] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[12px] text-zinc-400 mb-1.5">Pay Frequency</label>
                  <select
                    value={form.payFrequency}
                    onChange={e => setField('payFrequency', e.target.value)}
                    className="w-full bg-zinc-900/60 border border-zinc-700 rounded-md px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors capitalize"
                  >
                    {PAY_FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] text-zinc-400 mb-1.5">Currency</label>
                  <select
                    value={form.currency}
                    onChange={e => setField('currency', e.target.value)}
                    className="w-full bg-zinc-900/60 border border-zinc-700 rounded-md px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] text-zinc-400 mb-1.5">Effective Date</label>
                  <input
                    type="date"
                    value={form.effectiveDate}
                    onChange={e => setField('effectiveDate', e.target.value)}
                    className="w-full bg-zinc-900/60 border border-zinc-700 rounded-md px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Grade table */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[11px] uppercase tracking-widest text-zinc-500 font-medium">Grade Table</h2>
                <button
                  type="button"
                  onClick={addGrade}
                  className="inline-flex items-center gap-1 text-[12px] text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add Grade
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-zinc-800/50">
                      <th className="text-left pb-2 text-[10px] uppercase tracking-widest text-zinc-500 font-medium w-32">Grade</th>
                      <th className="text-right pb-2 pr-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Minimum</th>
                      <th className="text-right pb-2 pr-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Midpoint</th>
                      <th className="text-right pb-2 pr-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Maximum</th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/30">
                    {grades.map(g => (
                      <tr key={g.id}>
                        <td className="py-2 pr-3">
                          <input
                            value={g.label}
                            onChange={e => updateGrade(g.id, 'label', e.target.value)}
                            className="w-full bg-zinc-900/60 border border-zinc-700/60 rounded px-2 py-1 text-[12px] text-zinc-100 focus:outline-none focus:border-blue-500"
                          />
                        </td>
                        <td className="py-2 pr-3">
                          <input
                            type="number"
                            value={g.min}
                            onChange={e => updateGrade(g.id, 'min', e.target.value)}
                            placeholder="0"
                            className="w-full bg-zinc-900/60 border border-zinc-700/60 rounded px-2 py-1 text-[12px] text-zinc-100 text-right focus:outline-none focus:border-blue-500"
                          />
                        </td>
                        <td className="py-2 pr-3">
                          <input
                            type="number"
                            value={g.mid}
                            onChange={e => updateGrade(g.id, 'mid', e.target.value)}
                            placeholder="0"
                            className="w-full bg-zinc-900/60 border border-zinc-700/60 rounded px-2 py-1 text-[12px] text-zinc-100 text-right focus:outline-none focus:border-blue-500"
                          />
                        </td>
                        <td className="py-2 pr-3">
                          <input
                            type="number"
                            value={g.max}
                            onChange={e => updateGrade(g.id, 'max', e.target.value)}
                            placeholder="0"
                            className="w-full bg-zinc-900/60 border border-zinc-700/60 rounded px-2 py-1 text-[12px] text-zinc-100 text-right focus:outline-none focus:border-blue-500"
                          />
                        </td>
                        <td className="py-2">
                          <button
                            type="button"
                            onClick={() => removeGrade(g.id)}
                            className="text-zinc-700 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Link
                href="/hr/compensation/fixed-plans"
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
                {saving ? 'Saving...' : 'Create Plan'}
              </button>
            </div>

          </form>
        </div>
      </main>
    </>
  )
}
