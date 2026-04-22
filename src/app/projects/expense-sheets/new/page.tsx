'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Save, Plus, Trash2, ArrowLeft, Toggle } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const EXPENSE_TYPES = ['Transport', 'Accommodation', 'Meals', 'Other']

interface ExpLine {
  id: string
  expenseDate: string
  expenseType: string
  description: string
  amount: string
  currency: string
  projectNo: string
  taskNo: string
  receiptAttached: boolean
}

function newLine(): ExpLine {
  return {
    id: String(Date.now() + Math.random()),
    expenseDate: new Date().toISOString().split('T')[0],
    expenseType: 'Other',
    description: '',
    amount: '0',
    currency: 'USD',
    projectNo: '',
    taskNo: '',
    receiptAttached: false,
  }
}

export default function NewExpenseSheetPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fmt = (d: Date) => d.toISOString().split('T')[0]
  const today = new Date()
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

  const [employeeName, setEmployeeName] = useState('')
  const [periodStart, setPeriodStart] = useState(fmt(monthStart))
  const [periodEnd, setPeriodEnd] = useState(fmt(today))
  const [lines, setLines] = useState<ExpLine[]>([newLine()])

  const updateLine = (id: string, field: keyof ExpLine, value: string | boolean) => {
    setLines(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l))
  }

  const removeLine = (id: string) => setLines(prev => prev.filter(l => l.id !== id))

  const totalAmount = lines.reduce((s, l) => s + (parseFloat(l.amount) || 0), 0)

  const handleSubmit = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/projects/expense-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeName: employeeName || null,
          periodStart,
          periodEnd,
          lines: lines.map(l => ({
            expenseDate: l.expenseDate,
            expenseType: l.expenseType,
            description: l.description || null,
            amount: parseFloat(l.amount) || 0,
            currency: l.currency,
            projectNo: l.projectNo || null,
            taskNo: l.taskNo || null,
            receiptAttached: l.receiptAttached,
          })),
        }),
      })
      if (!res.ok) throw new Error('Failed to create expense sheet')
      const data = await res.json()
      router.push(`/projects/expense-sheets/${data.id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error')
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Expense Sheet" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-5 max-w-6xl">

          <Link href="/projects/expense-sheets" className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-300">
            <ArrowLeft className="w-3 h-3" /> Back to Expense Sheets
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Projects</p>
              <h2 className="text-[18px] font-semibold text-zinc-100">New Expense Sheet</h2>
            </div>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-medium"
            >
              <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save'}
            </button>
          </div>

          {error && <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">{error}</div>}

          {/* General */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-zinc-800/40 border-b border-zinc-800/60">
              <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-widest">General</span>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Employee Name</label>
                <input value={employeeName} onChange={e => setEmployeeName(e.target.value)} placeholder="Employee name" className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-md px-3 py-2 text-[13px] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500/60" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Period Start</label>
                <input type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)} className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-md px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500/60" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Period End</label>
                <input type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-md px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500/60" />
              </div>
            </div>
          </div>

          {/* Lines */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-zinc-800/40 border-b border-zinc-800/60 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-widest">Expense Lines</span>
              <button onClick={() => setLines(prev => [...prev, newLine()])} className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300">
                <Plus className="w-3 h-3" /> Add Line
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-zinc-800/60">
                  <tr>
                    {['Date', 'Type', 'Description', 'Amount', 'Currency', 'Project No.', 'Task No.', 'Receipt', ''].map(h => (
                      <th key={h} className={`px-3 py-2 text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap ${h === 'Amount' ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {lines.map(line => (
                    <tr key={line.id} className="hover:bg-zinc-800/20">
                      <td className="px-3 py-2">
                        <input type="date" value={line.expenseDate} onChange={e => updateLine(line.id, 'expenseDate', e.target.value)} className="bg-zinc-900/60 border border-zinc-700/50 rounded px-2 py-1 text-[12px] text-zinc-100 focus:outline-none focus:border-blue-500/60 w-32" />
                      </td>
                      <td className="px-3 py-2">
                        <select value={line.expenseType} onChange={e => updateLine(line.id, 'expenseType', e.target.value)} className="bg-zinc-900/60 border border-zinc-700/50 rounded px-2 py-1 text-[12px] text-zinc-100 focus:outline-none focus:border-blue-500/60">
                          {EXPENSE_TYPES.map(t => <option key={t}>{t}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input value={line.description} onChange={e => updateLine(line.id, 'description', e.target.value)} placeholder="Description" className="w-36 bg-zinc-900/60 border border-zinc-700/50 rounded px-2 py-1 text-[12px] text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-blue-500/60" />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <input type="number" min="0" step="0.01" value={line.amount} onChange={e => updateLine(line.id, 'amount', e.target.value)} className="w-20 text-right bg-zinc-900/60 border border-zinc-700/50 rounded px-2 py-1 text-[12px] text-zinc-100 focus:outline-none focus:border-blue-500/60" />
                      </td>
                      <td className="px-3 py-2">
                        <select value={line.currency} onChange={e => updateLine(line.id, 'currency', e.target.value)} className="bg-zinc-900/60 border border-zinc-700/50 rounded px-2 py-1 text-[12px] text-zinc-100 focus:outline-none focus:border-blue-500/60 w-16">
                          {['USD','EUR','GBP','CAD'].map(c => <option key={c}>{c}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input value={line.projectNo} onChange={e => updateLine(line.id, 'projectNo', e.target.value)} placeholder="PROJ-001" className="w-24 bg-zinc-900/60 border border-zinc-700/50 rounded px-2 py-1 text-[12px] text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-blue-500/60" />
                      </td>
                      <td className="px-3 py-2">
                        <input value={line.taskNo} onChange={e => updateLine(line.id, 'taskNo', e.target.value)} placeholder="TASK-01" className="w-20 bg-zinc-900/60 border border-zinc-700/50 rounded px-2 py-1 text-[12px] text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-blue-500/60" />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <input type="checkbox" checked={line.receiptAttached} onChange={e => updateLine(line.id, 'receiptAttached', e.target.checked)} className="w-4 h-4 accent-blue-500" />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button onClick={() => removeLine(line.id)} className="text-zinc-600 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-zinc-800/60">
                  <tr>
                    <td colSpan={3} className="px-3 py-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-widest text-right">Total</td>
                    <td className="px-3 py-2 text-right text-[13px] font-bold text-zinc-100 tabular-nums">${totalAmount.toFixed(2)}</td>
                    <td colSpan={5} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

        </div>
      </main>
    </>
  )
}
