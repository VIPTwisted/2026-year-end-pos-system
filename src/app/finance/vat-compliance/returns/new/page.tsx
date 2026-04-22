'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { ArrowLeft, Calculator, FileText } from 'lucide-react'

const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors'
const labelCls = 'block text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5'

const PERIODS = [
  'Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026',
  'Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025',
]

export default function NewVatReturnPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    period: 'Q2 2026',
    fromDate: '2026-04-01',
    toDate: '2026-06-30',
    outputVat: '',
    inputVat: '',
    adjustments: '0',
    notes: '',
  })

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  const outputNum = parseFloat(form.outputVat) || 0
  const inputNum = parseFloat(form.inputVat) || 0
  const adjNum = parseFloat(form.adjustments) || 0
  const netPayable = outputNum - inputNum + adjNum

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.period || !form.fromDate || !form.toDate) {
      setError('Period and date range are required')
      return
    }
    setSaving(true)
    setError('')
    // Would POST to /api/finance/vat-returns in production
    await new Promise(r => setTimeout(r, 600))
    router.push('/finance/vat-compliance/returns')
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="New VAT Return" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto space-y-6">

          <div className="flex items-center gap-3">
            <Link
              href="/finance/vat-compliance/returns"
              className="inline-flex items-center gap-1.5 text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Returns
            </Link>
          </div>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="text-[14px] font-semibold text-zinc-100">Create VAT Return</span>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              {/* Period + Dates */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Filing Period <span className="text-red-400">*</span></label>
                  <select value={form.period} onChange={set('period')} className={inputCls}>
                    {PERIODS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>From Date <span className="text-red-400">*</span></label>
                  <input type="date" value={form.fromDate} onChange={set('fromDate')} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>To Date <span className="text-red-400">*</span></label>
                  <input type="date" value={form.toDate} onChange={set('toDate')} className={inputCls} />
                </div>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Calculator className="w-4 h-4 text-amber-400" />
                  <span className="text-[12px] font-semibold text-zinc-400 uppercase tracking-widest">VAT Calculations</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Output VAT (collected)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.outputVat}
                      onChange={set('outputVat')}
                      placeholder="0.00"
                      className={inputCls}
                    />
                    <p className="text-[11px] text-zinc-600 mt-1">Auto-calculated from customer transactions</p>
                  </div>
                  <div>
                    <label className={labelCls}>Input VAT (reclaimable)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.inputVat}
                      onChange={set('inputVat')}
                      placeholder="0.00"
                      className={inputCls}
                    />
                    <p className="text-[11px] text-zinc-600 mt-1">Auto-calculated from vendor invoices</p>
                  </div>
                </div>
                <div className="mt-4">
                  <label className={labelCls}>Adjustments</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.adjustments}
                    onChange={set('adjustments')}
                    placeholder="0.00"
                    className={inputCls}
                  />
                </div>

                {/* Net payable summary */}
                <div className="mt-4 pt-4 border-t border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-zinc-400">Net VAT Payable</span>
                    <span className={`text-[20px] font-bold tabular-nums ${netPayable >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      ${netPayable.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-600 mt-1">
                    {netPayable >= 0 ? 'Amount due to tax authority' : 'Refund due from tax authority'}
                  </p>
                </div>
              </div>

              <div>
                <label className={labelCls}>Notes</label>
                <textarea
                  value={form.notes}
                  onChange={set('notes')}
                  rows={3}
                  placeholder="Internal notes for this filing…"
                  className={inputCls + ' resize-none'}
                />
              </div>

              {error && (
                <div className="text-[12px] text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <Link
                  href="/finance/vat-compliance/returns"
                  className="px-4 py-2 text-[13px] text-zinc-400 hover:text-zinc-200 border border-zinc-700 rounded-lg transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-[13px] font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  {saving ? 'Creating…' : 'Create VAT Return'}
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
