'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency } from '@/lib/utils'
import { Plus, Trash2 } from 'lucide-react'

type Employee = {
  id: string
  firstName: string
  lastName: string
  position: string
}

type Line = {
  category: string
  description: string
  amount: string
  expenseDate: string
  receiptRef: string
  notes: string
}

const CATEGORIES = [
  { value: 'meals', label: 'Meals' },
  { value: 'travel', label: 'Travel' },
  { value: 'supplies', label: 'Supplies' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'other', label: 'Other' },
]

const emptyLine = (): Line => ({
  category: 'meals',
  description: '',
  amount: '',
  expenseDate: new Date().toISOString().split('T')[0],
  receiptRef: '',
  notes: '',
})

export default function NewExpenseReportPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)
  const [form, setForm] = useState({ employeeId: '', title: '', notes: '' })
  const [lines, setLines] = useState<Line[]>([emptyLine()])

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  useEffect(() => {
    fetch('/api/hr/employees')
      .then(r => r.json())
      .then((data: Employee[]) => setEmployees(data))
      .catch(() => setError('Failed to load employees'))
  }, [])

  const total = lines.reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0)

  const updateLine = (idx: number, field: keyof Line, value: string) => {
    setLines(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.employeeId) { notify('Please select an employee', 'err'); return }
    if (!form.title.trim()) { notify('Report title is required', 'err'); return }
    const validLines = lines.filter(l => l.description.trim() && parseFloat(l.amount) > 0)
    if (validLines.length === 0) { notify('Add at least one expense line', 'err'); return }

    setSaving(true)
    try {
      const res = await fetch('/api/hr/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: form.employeeId,
          title: form.title,
          notes: form.notes || undefined,
          lines: validLines.map(l => ({
            category: l.category,
            description: l.description,
            amount: parseFloat(l.amount),
            expenseDate: l.expenseDate,
            receiptRef: l.receiptRef || undefined,
            notes: l.notes || undefined,
          })),
        }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        notify(data.error ?? 'Failed to create report', 'err')
        return
      }
      const report = await res.json() as { id: string }
      router.push(`/hr/expenses/${report.id}`)
    } catch {
      notify('Network error', 'err')
    } finally {
      setSaving(false)
    }
  }

  const inp = 'w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500'
  const sel = 'w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500'

  return (
    <>
      <TopBar title="New Expense Report" />
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm font-medium shadow-lg ${
          toast.type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.msg}
        </div>
      )}
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-5xl mx-auto p-6 space-y-6">

          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-zinc-100">New Expense Report</h1>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Report Details */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6 space-y-4">
              <h2 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Report Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                    Employee *
                  </label>
                  <select
                    className={sel}
                    value={form.employeeId}
                    onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))}
                    required
                  >
                    <option value="">Select employee…</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} — {emp.position}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                    Report Title *
                  </label>
                  <input
                    className={inp}
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Q2 Sales Trip"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                    Notes
                  </label>
                  <textarea
                    className={`${inp} resize-none h-16`}
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Additional context…"
                  />
                </div>
              </div>
            </div>

            {/* Expense Lines */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Expense Lines</h2>
                <button
                  type="button"
                  onClick={() => setLines(l => [...l, emptyLine()])}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-xs font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Line
                </button>
              </div>

              <div className="space-y-3">
                {lines.map((line, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-end p-3 bg-zinc-800/40 rounded-lg border border-zinc-700/30">
                    {/* Category */}
                    <div className="col-span-2">
                      <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Category</label>
                      <select
                        className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-zinc-100 text-xs focus:outline-none focus:border-blue-500"
                        value={line.category}
                        onChange={e => updateLine(idx, 'category', e.target.value)}
                      >
                        {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                    {/* Description */}
                    <div className="col-span-3">
                      <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Description *</label>
                      <input
                        className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-zinc-100 text-xs focus:outline-none focus:border-blue-500"
                        value={line.description}
                        onChange={e => updateLine(idx, 'description', e.target.value)}
                        placeholder="Describe expense"
                      />
                    </div>
                    {/* Amount */}
                    <div className="col-span-2">
                      <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Amount *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-zinc-100 text-xs focus:outline-none focus:border-blue-500"
                        value={line.amount}
                        onChange={e => updateLine(idx, 'amount', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    {/* Date */}
                    <div className="col-span-2">
                      <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Date</label>
                      <input
                        type="date"
                        className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-zinc-100 text-xs focus:outline-none focus:border-blue-500"
                        value={line.expenseDate}
                        onChange={e => updateLine(idx, 'expenseDate', e.target.value)}
                      />
                    </div>
                    {/* Receipt Ref */}
                    <div className="col-span-2">
                      <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Receipt Ref</label>
                      <input
                        className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-zinc-100 text-xs focus:outline-none focus:border-blue-500"
                        value={line.receiptRef}
                        onChange={e => updateLine(idx, 'receiptRef', e.target.value)}
                        placeholder="RCP-001"
                      />
                    </div>
                    {/* Remove */}
                    <div className="col-span-1 flex justify-center">
                      <button
                        type="button"
                        onClick={() => setLines(l => l.filter((_, i) => i !== idx))}
                        className="p-1.5 rounded hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"
                        title="Remove line"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4 flex items-center justify-between">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                {lines.filter(l => l.description && parseFloat(l.amount) > 0).length} valid line(s)
              </div>
              <div className="flex items-center gap-2 text-zinc-500 text-sm">
                Total:
                <span className="text-2xl font-bold text-zinc-100 tabular-nums">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
              >
                {saving ? 'Saving…' : 'Create Report'}
              </button>
            </div>
          </form>

        </div>
      </main>
    </>
  )
}
