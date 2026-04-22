'use client'

import { useEffect, useState, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency } from '@/lib/utils'
import { Calculator, X, ChevronRight } from 'lucide-react'

interface InterestRule {
  id: string
  code: string
  description: string
  graceDays: number
  interestRate: number
  feePerDoc: number
  method: 'daily' | 'monthly'
  basis: 'outstanding' | 'original'
  isActive: boolean
}

interface PreviewLine {
  customerId: string
  customerName: string
  invoiceId: string
  invoiceNumber: string
  dueDate: string
  outstanding: number
  daysOverdue: number
  interestAmount: number
  docFee: number
  totalCharge: number
}

interface Preview {
  rule: InterestRule
  fromDate: string
  toDate: string
  lineCount: number
  totalInterest: number
  totalFees: number
  grandTotal: number
  lines: PreviewLine[]
}

interface Toast {
  msg: string
  type: 'ok' | 'err'
}

function fmtDate(d: string) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(d))
}

export default function InterestPage() {
  const [rules, setRules] = useState<InterestRule[]>([])
  const [loading, setLoading] = useState(true)
  const [showCalc, setShowCalc] = useState(false)
  const [selRule, setSelRule] = useState('')
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 1)
    return d.toISOString().split('T')[0]
  })
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0])
  const [calculating, setCalculating] = useState(false)
  const [preview, setPreview] = useState<Preview | null>(null)
  const [toast, setToast] = useState<Toast | null>(null)

  const notify = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }, [])

  useEffect(() => {
    fetch('/api/finance/interest')
      .then((r) => r.json())
      .then((d: { rules: InterestRule[] }) => {
        setRules(d.rules)
        if (d.rules.length > 0) setSelRule(d.rules[0].id)
      })
      .catch(() => notify('Failed to load rules', 'err'))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const runCalculation = useCallback(async () => {
    if (!selRule) return
    setCalculating(true)
    setPreview(null)
    try {
      const res = await fetch('/api/finance/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruleId: selRule, fromDate, toDate }),
      })
      if (!res.ok) throw new Error('Calculation failed')
      const d = await res.json() as { preview: Preview }
      setPreview(d.preview)
      setShowCalc(false)
    } catch {
      notify('Calculation failed', 'err')
    } finally {
      setCalculating(false)
    }
  }, [selRule, fromDate, toDate, notify])

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="Interest Calculation"
        breadcrumb={[{ label: 'Finance', href: '/finance' }]}
        actions={
          <button
            onClick={() => { setShowCalc(true); setPreview(null) }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
          >
            <Calculator className="w-3.5 h-3.5" />
            Run Calculation
          </button>
        }
      />

      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded shadow-lg text-sm font-medium ${toast.type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Run calculation modal */}
      {showCalc && (
        <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-100">Run Interest Calculation</h2>
              <button onClick={() => setShowCalc(false)}><X className="w-4 h-4 text-zinc-500" /></button>
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1">Interest Rule</label>
              <select
                value={selRule}
                onChange={(e) => setSelRule(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
              >
                {rules.filter((r) => r.isActive).map((r) => (
                  <option key={r.id} value={r.id}>{r.code} — {r.description}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1">From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1">To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={runCalculation}
                disabled={calculating || !selRule}
                className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded px-4 py-2 transition-colors"
              >
                <Calculator className="w-3.5 h-3.5" />
                {calculating ? 'Calculating…' : 'Calculate'}
              </button>
              <button onClick={() => setShowCalc(false)} className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 text-sm font-medium rounded px-4 py-2 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Interest Rules */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-100">Interest Rules</h2>
            <span className="text-xs text-zinc-500">{rules.length} rules</span>
          </div>

          {loading ? (
            <div className="py-16 text-center"><p className="text-sm text-zinc-500">Loading…</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Code</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Description</th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Grace Days</th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Interest %</th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Fee / Doc</th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Method</th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {rules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-5 py-3">
                        <span className="font-mono text-xs text-blue-400 bg-blue-400/5 px-2 py-0.5 rounded">{rule.code}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-300">{rule.description}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-mono text-sm text-zinc-400">{rule.graceDays}d</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-mono text-sm text-amber-400">{rule.interestRate}%</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-mono text-sm text-zinc-400">
                          {rule.feePerDoc > 0 ? formatCurrency(rule.feePerDoc) : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${rule.method === 'daily' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                          {rule.method}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${rule.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700 text-zinc-500'}`}>
                          {rule.isActive ? 'active' : 'inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => { setSelRule(rule.id); setShowCalc(true) }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors"
                        >
                          <Calculator className="w-3 h-3" />
                          Run
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Interest journal preview */}
        {preview && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-zinc-100">Interest Journal Preview</h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Rule: <span className="text-zinc-300">{preview.rule.code}</span> · {fmtDate(preview.fromDate)} – {fmtDate(preview.toDate)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Total Interest</div>
                  <div className="font-mono text-sm font-bold text-amber-400 tabular-nums">{formatCurrency(preview.totalInterest)}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Total Fees</div>
                  <div className="font-mono text-sm font-bold text-zinc-300 tabular-nums">{formatCurrency(preview.totalFees)}</div>
                </div>
                <div className="text-right bg-zinc-900/60 rounded px-3 py-2">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Grand Total</div>
                  <div className="font-mono text-sm font-bold text-zinc-100 tabular-nums">{formatCurrency(preview.grandTotal)}</div>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-amber-500/5 border-b border-amber-500/10 flex items-center gap-2">
              <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-amber-400 font-medium">Preview only — no journal entries have been posted.</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Customer</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Invoice #</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Due Date</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Outstanding</th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Days</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Interest</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Doc Fee</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {preview.lines.map((line) => (
                    <tr key={line.invoiceId} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-5 py-3 text-sm text-zinc-200 font-medium">{line.customerName}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-blue-400 bg-blue-400/5 px-2 py-0.5 rounded">{line.invoiceNumber}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-400">{fmtDate(line.dueDate)}</td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-zinc-300 tabular-nums">{formatCurrency(line.outstanding)}</td>
                      <td className="px-4 py-3 text-center font-mono text-xs text-red-400 tabular-nums">{line.daysOverdue}d</td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-amber-400 tabular-nums">{formatCurrency(line.interestAmount)}</td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-zinc-400 tabular-nums">
                        {line.docFee > 0 ? formatCurrency(line.docFee) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono text-sm font-bold text-zinc-100 tabular-nums">{formatCurrency(line.totalCharge)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-zinc-700 bg-zinc-900/40">
                    <td colSpan={5} className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">{preview.lineCount} lines</td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-bold text-amber-400 tabular-nums">{formatCurrency(preview.totalInterest)}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-bold text-zinc-300 tabular-nums">{formatCurrency(preview.totalFees)}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-bold text-zinc-100 tabular-nums">{formatCurrency(preview.grandTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
