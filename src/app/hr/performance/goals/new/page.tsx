'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'

export default function NewPerformanceGoalPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<{ id: string; firstName: string; lastName: string }[]>([])
  const [form, setForm] = useState({
    employeeId: '',
    title: '',
    description: '',
    category: 'individual',
    priority: 'medium',
    targetDate: '',
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
      const res = await fetch('/api/hr/performance/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Failed to save') }
      router.push('/hr/performance/goals')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-white">
      <TopBar title="New Performance Goal" />
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-6">
          <h2 className="font-semibold text-zinc-200 mb-6">New Performance Goal</h2>
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
              <label className="block text-xs text-zinc-400 mb-1">Goal Title *</label>
              <input required type="text" value={form.title} placeholder="e.g. Increase customer satisfaction score"
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1">Description</label>
              <textarea rows={3} value={form.description} placeholder="Describe the goal and success criteria..."
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Category *</label>
                <select value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                  <option value="individual">Individual</option>
                  <option value="team">Team</option>
                  <option value="company">Company</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Priority *</label>
                <select value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Target Date</label>
                <input type="date" value={form.targetDate}
                  onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-5 py-2 rounded-lg text-sm font-medium transition-colors">
                {saving ? 'Saving...' : 'Create Goal'}
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
