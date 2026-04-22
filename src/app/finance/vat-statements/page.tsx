'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Plus, Trash2, FileText } from 'lucide-react'

interface VatStatementLine {
  id: string
  statementName: string
  rowNo: string
  description: string | null
  rowType: string
  amountType: string
  accountFilter: string | null
  calculatedAmount: number
  printOnPage: boolean
}

const ROW_TYPE_CLS: Record<string, string> = {
  AccountTotaling: 'bg-blue-500/10 text-blue-400',
  RowTotaling: 'bg-violet-500/10 text-violet-400',
  Description: 'bg-zinc-700/50 text-zinc-400',
}

const SEED_LINES: Omit<VatStatementLine, 'id' | 'calculatedAmount'>[] = [
  { statementName: 'Default', rowNo: '10', description: 'Box 1 — Output VAT on sales', rowType: 'AccountTotaling', amountType: 'Amount', accountFilter: '2200..2299', printOnPage: true },
  { statementName: 'Default', rowNo: '20', description: 'Box 2 — Acquisitions VAT', rowType: 'AccountTotaling', amountType: 'Amount', accountFilter: '2300..2399', printOnPage: true },
  { statementName: 'Default', rowNo: '30', description: 'Box 3 — Net VAT (1+2)', rowType: 'RowTotaling', amountType: 'Amount', accountFilter: '10..20', printOnPage: true },
  { statementName: 'Default', rowNo: '40', description: 'Box 4 — Input VAT reclaimable', rowType: 'AccountTotaling', amountType: 'Amount', accountFilter: '2400..2499', printOnPage: true },
  { statementName: 'Default', rowNo: '50', description: 'Box 5 — Net VAT Payable (3-4)', rowType: 'RowTotaling', amountType: 'Amount', accountFilter: '30..40', printOnPage: true },
  { statementName: 'Default', rowNo: '60', description: 'Box 6 — Total value of sales', rowType: 'AccountTotaling', amountType: 'BaseAmount', accountFilter: '4000..4999', printOnPage: true },
  { statementName: 'Default', rowNo: '70', description: 'Box 7 — Total value of purchases', rowType: 'AccountTotaling', amountType: 'BaseAmount', accountFilter: '5000..5999', printOnPage: true },
]

const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

export default function VatStatementsPage() {
  const [lines, setLines] = useState<VatStatementLine[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ rowNo: '', description: '', rowType: 'AccountTotaling', amountType: 'Amount', accountFilter: '' })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/finance/vat-statements')
      .then(r => r.json())
      .then(d => setLines(d.lines ?? []))
      .catch(() => {
        // Fallback to seed data for display
        setLines(SEED_LINES.map((l, i) => ({ ...l, id: `seed-${i}`, calculatedAmount: 0 })))
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const addLine = async () => {
    if (!form.rowNo) { notify('Row No. is required', 'err'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/finance/vat-statements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed')
      notify('Line added')
      setForm({ rowNo: '', description: '', rowType: 'AccountTotaling', amountType: 'Amount', accountFilter: '' })
      setShowAdd(false)
      load()
    } catch {
      notify('Failed to add line', 'err')
    } finally {
      setSaving(false)
    }
  }

  const deleteLine = async (id: string) => {
    try {
      await fetch(`/api/finance/vat-statements?id=${id}`, { method: 'DELETE' })
      notify('Line deleted')
      load()
    } catch {
      notify('Failed to delete', 'err')
    }
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="VAT Statements"
        breadcrumb={[{ label: 'Finance', href: '/finance' }, { label: 'VAT Returns', href: '/finance/vat-returns' }]}
        actions={
          <button onClick={() => setShowAdd(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Line
          </button>
        }
      />

      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded shadow-lg text-sm font-medium ${toast.type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#16213e] border border-zinc-800/50">
          <FileText className="w-4 h-4 text-blue-400 shrink-0" />
          <p className="text-xs text-zinc-400">
            VAT Statement defines how VAT return boxes are calculated. Each row maps to a VAT return box. Row types: Account Totaling sums G/L account ranges; Row Totaling references other row numbers.
          </p>
        </div>

        {showAdd && (
          <div className="bg-[#16213e] border border-blue-600/30 rounded-lg p-5 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-100">New Statement Line</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Row No.</label>
                <input type="text" value={form.rowNo} onChange={e => setForm(f => ({ ...f, rowNo: e.target.value }))} placeholder="10"
                  className="w-full px-2 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Description</label>
                <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Box 1 — Output VAT"
                  className="w-full px-2 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Row Type</label>
                <select value={form.rowType} onChange={e => setForm(f => ({ ...f, rowType: e.target.value }))}
                  className="w-full px-2 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                  <option value="AccountTotaling">Account Totaling</option>
                  <option value="RowTotaling">Row Totaling</option>
                  <option value="Description">Description</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Amount Type</label>
                <select value={form.amountType} onChange={e => setForm(f => ({ ...f, amountType: e.target.value }))}
                  className="w-full px-2 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                  <option value="Amount">Amount</option>
                  <option value="BaseAmount">Base Amount</option>
                  <option value="Unrealized">Unrealized</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Account Filter</label>
                <input type="text" value={form.accountFilter} onChange={e => setForm(f => ({ ...f, accountFilter: e.target.value }))} placeholder="2200..2299"
                  className="w-full px-2 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={addLine} disabled={saving}
                className="px-4 py-1.5 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors">
                {saving ? 'Saving…' : 'Add Line'}
              </button>
              <button onClick={() => setShowAdd(false)}
                className="px-3 py-1.5 rounded text-xs font-medium bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-100">VAT Statement — Default</h2>
            <span className="text-xs text-zinc-500">{lines.length} lines</span>
          </div>

          {loading ? (
            <div className="py-16 text-center"><p className="text-sm text-zinc-500">Loading…</p></div>
          ) : lines.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-zinc-500 mb-2">No statement lines configured.</p>
              <button onClick={() => setShowAdd(true)} className="text-xs text-blue-400 hover:text-blue-300">Add first line →</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    {['Row No.', 'Description', 'Row Type', 'Amount Type', 'Account Filter', 'Calculated Amount', 'Print', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {lines.map(l => (
                    <tr key={l.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-4 py-2.5 font-mono text-xs text-zinc-200 font-bold">{l.rowNo}</td>
                      <td className="px-4 py-2.5 text-sm text-zinc-300">{l.description ?? '—'}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${ROW_TYPE_CLS[l.rowType] ?? 'bg-zinc-700 text-zinc-400'}`}>
                          {l.rowType}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-zinc-400">{l.amountType}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-zinc-500">{l.accountFilter ?? '—'}</td>
                      <td className="px-4 py-2.5 tabular-nums text-sm text-right text-zinc-300">{fmt(l.calculatedAmount)}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`text-[11px] font-medium ${l.printOnPage ? 'text-emerald-400' : 'text-zinc-600'}`}>
                          {l.printOnPage ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        {!l.id.startsWith('seed-') && (
                          <button onClick={() => deleteLine(l.id)} className="text-zinc-600 hover:text-red-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
