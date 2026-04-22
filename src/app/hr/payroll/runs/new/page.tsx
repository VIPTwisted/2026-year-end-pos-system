'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const PAYMENT_METHODS = ['Direct Deposit', 'Check', 'Cash']
const SELECTION_MODES = [
  { value: 'all_active',    label: 'All Active Employees' },
  { value: 'by_department', label: 'By Department' },
  { value: 'manual',        label: 'Manual Selection' },
]

export default function NewPayrollRunPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fmt = (d: Date) => d.toISOString().split('T')[0]
  const today = new Date()
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  const [periodStart, setPeriodStart] = useState(fmt(monthStart))
  const [periodEnd, setPeriodEnd] = useState(fmt(monthEnd))
  const [payDate, setPayDate] = useState(fmt(today))
  const [paymentMethod, setPaymentMethod] = useState('Direct Deposit')
  const [description, setDescription] = useState('')
  const [selectionMode, setSelectionMode] = useState('all_active')
  const [selectionFilter, setSelectionFilter] = useState('')

  const handleSubmit = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/hr/payroll/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          periodStart,
          periodEnd,
          payDate,
          paymentMethod,
          description: description || null,
          selectionMode,
          selectionFilter: selectionFilter || null,
        }),
      })
      if (!res.ok) throw new Error('Failed to create payroll run')
      const data = await res.json()
      router.push(`/hr/payroll/runs/${data.id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error')
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Payroll Run" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-5 max-w-3xl">

          <Link href="/hr/payroll/runs" className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-300">
            <ArrowLeft className="w-3 h-3" /> Back to Payroll Runs
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">HR / Payroll</p>
              <h2 className="text-[18px] font-semibold text-zinc-100">New Payroll Run</h2>
            </div>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-medium"
            >
              <Save className="w-3.5 h-3.5" /> {saving ? 'Creating…' : 'Create Run'}
            </button>
          </div>

          {error && <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">{error}</div>}

          {/* Header FastTab */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-zinc-800/40 border-b border-zinc-800/60">
              <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-widest">Run Header</span>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Period Start</label>
                <input type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)} className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-md px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500/60" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Period End</label>
                <input type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-md px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500/60" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Pay Date</label>
                <input type="date" value={payDate} onChange={e => setPayDate(e.target.value)} className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-md px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500/60" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Payment Method</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-md px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500/60">
                  {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Description</label>
                <input value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. April 2026 Bi-Weekly Payroll" className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-md px-3 py-2 text-[13px] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500/60" />
              </div>
            </div>
          </div>

          {/* Employee Selection FastTab */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-zinc-800/40 border-b border-zinc-800/60">
              <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-widest">Employee Selection</span>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex gap-4 flex-wrap">
                {SELECTION_MODES.map(({ value, label }) => (
                  <label key={value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="selectionMode"
                      value={value}
                      checked={selectionMode === value}
                      onChange={() => setSelectionMode(value)}
                      className="accent-blue-500 w-4 h-4"
                    />
                    <span className="text-[13px] text-zinc-200">{label}</span>
                  </label>
                ))}
              </div>
              {selectionMode === 'by_department' && (
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Department</label>
                  <input value={selectionFilter} onChange={e => setSelectionFilter(e.target.value)} placeholder="e.g. Sales, Engineering" className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-md px-3 py-2 text-[13px] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500/60" />
                </div>
              )}
              {selectionMode === 'manual' && (
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Employee IDs (comma-separated)</label>
                  <input value={selectionFilter} onChange={e => setSelectionFilter(e.target.value)} placeholder="EMP-001, EMP-002, EMP-003" className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-md px-3 py-2 text-[13px] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500/60" />
                </div>
              )}
              {selectionMode === 'all_active' && (
                <p className="text-[12px] text-zinc-500">All active employees will be included in this payroll run.</p>
              )}
            </div>
          </div>

        </div>
      </main>
    </>
  )
}
