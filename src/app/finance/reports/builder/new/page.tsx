'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Plus, Trash2 } from 'lucide-react'

type ReportRow = {
  rowType: string
  label: string
  accountFrom: string
  accountTo: string
  formula: string
  indent: number
}

type ReportColumn = {
  periodType: string
  label: string
}

const DEFAULT_ROW: ReportRow = {
  rowType: 'account_range', label: '', accountFrom: '', accountTo: '', formula: '', indent: 0,
}
const DEFAULT_COL: ReportColumn = { periodType: 'current_month', label: 'Current Month' }

export default function NewReportPage() {
  const router = useRouter()
  const [saving, setSaving] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', reportType: 'income_statement', description: '',
  })
  const [rows, setRows] = useState<ReportRow[]>([{ ...DEFAULT_ROW }])
  const [columns, setColumns] = useState<ReportColumn[]>([{ ...DEFAULT_COL }])

  function setField(k: keyof typeof form, v: string) {
    setForm(f => ({ ...f, [k]: v }))
  }
  function setRow(i: number, k: keyof ReportRow, v: string | number) {
    setRows(rs => rs.map((r, idx) => idx === i ? { ...r, [k]: v } : r))
  }
  function setCol(i: number, k: keyof ReportColumn, v: string) {
    setColumns(cs => cs.map((c, idx) => idx === i ? { ...c, [k]: v } : c))
  }

  async function handleSubmit(publish: boolean) {
    setSaving(publish ? 'publish' : 'draft')
    try {
      const res = await fetch('/api/finance/reports/builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          rowsJson: JSON.stringify(rows),
          columnsJson: JSON.stringify(columns),
          isPublished: publish,
        }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      router.push(`/finance/reports/builder/${data.id}`)
    } catch {
      setSaving(null)
    }
  }

  const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 placeholder:text-zinc-600'
  const selectCls = 'bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-zinc-200 text-xs focus:outline-none focus:border-blue-500'
  const labelCls = 'block text-[11px] uppercase tracking-wide text-zinc-500 mb-1'

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="New Financial Report" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Report Header */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-200 mb-2">Report Definition</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Report Name *</label>
                <input required value={form.name} onChange={e => setField('name', e.target.value)}
                  className={inputCls} placeholder="Monthly P&L" />
              </div>
              <div>
                <label className={labelCls}>Report Type</label>
                <select value={form.reportType} onChange={e => setField('reportType', e.target.value)}
                  className={inputCls}>
                  <option value="income_statement">Income Statement</option>
                  <option value="balance_sheet">Balance Sheet</option>
                  <option value="cash_flow">Cash Flow</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={labelCls}>Description</label>
                <input value={form.description} onChange={e => setField('description', e.target.value)}
                  className={inputCls} placeholder="Optional description" />
              </div>
            </div>
          </div>

          {/* Column Definitions */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-zinc-200">Column Definitions</h2>
              <button type="button" onClick={() => setColumns(c => [...c, { ...DEFAULT_COL }])}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add Column
              </button>
            </div>
            <div className="space-y-2">
              {columns.map((col, i) => (
                <div key={i} className="flex items-center gap-3">
                  <select value={col.periodType} onChange={e => setCol(i, 'periodType', e.target.value)} className={selectCls}>
                    <option value="current_month">Current Month</option>
                    <option value="ytd">Year-to-Date</option>
                    <option value="prior_year">Prior Year</option>
                    <option value="budget">Budget</option>
                  </select>
                  <input value={col.label} onChange={e => setCol(i, 'label', e.target.value)}
                    placeholder="Column label" className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-zinc-200 text-xs focus:outline-none focus:border-blue-500 placeholder:text-zinc-600" />
                  <button type="button" onClick={() => setColumns(cs => cs.filter((_, idx) => idx !== i))}
                    disabled={columns.length === 1} className="text-zinc-600 hover:text-red-400 disabled:opacity-30 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Row Definitions */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-zinc-200">Row Definitions</h2>
              <button type="button" onClick={() => setRows(rs => [...rs, { ...DEFAULT_ROW }])}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add Row
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-zinc-800/30">
                    {['Row Type', 'Label', 'Acct From', 'Acct To', 'Formula', 'Indent', ''].map(h => (
                      <th key={h} className="text-left px-2 py-1 text-[10px] uppercase text-zinc-500 font-medium tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className="border-b border-zinc-800/20">
                      <td className="px-2 py-1.5">
                        <select value={row.rowType} onChange={e => setRow(i, 'rowType', e.target.value)} className={selectCls}>
                          <option value="header">Header</option>
                          <option value="account_range">Account Range</option>
                          <option value="formula">Formula</option>
                          <option value="total">Total</option>
                          <option value="spacer">Spacer</option>
                        </select>
                      </td>
                      <td className="px-2 py-1.5">
                        <input value={row.label} onChange={e => setRow(i, 'label', e.target.value)}
                          className="w-32 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-zinc-200 text-xs focus:outline-none focus:border-blue-500 placeholder:text-zinc-600" placeholder="Row label" />
                      </td>
                      <td className="px-2 py-1.5">
                        <input value={row.accountFrom} onChange={e => setRow(i, 'accountFrom', e.target.value)}
                          disabled={row.rowType !== 'account_range'}
                          className="w-20 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-zinc-200 text-xs focus:outline-none focus:border-blue-500 placeholder:text-zinc-600 disabled:opacity-30" placeholder="4000" />
                      </td>
                      <td className="px-2 py-1.5">
                        <input value={row.accountTo} onChange={e => setRow(i, 'accountTo', e.target.value)}
                          disabled={row.rowType !== 'account_range'}
                          className="w-20 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-zinc-200 text-xs focus:outline-none focus:border-blue-500 placeholder:text-zinc-600 disabled:opacity-30" placeholder="4999" />
                      </td>
                      <td className="px-2 py-1.5">
                        <input value={row.formula} onChange={e => setRow(i, 'formula', e.target.value)}
                          disabled={row.rowType !== 'formula'}
                          className="w-32 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-zinc-200 text-xs focus:outline-none focus:border-blue-500 placeholder:text-zinc-600 disabled:opacity-30 font-mono" placeholder="R1+R2-R3" />
                      </td>
                      <td className="px-2 py-1.5">
                        <input type="number" value={row.indent} onChange={e => setRow(i, 'indent', parseInt(e.target.value) || 0)}
                          min="0" max="4"
                          className="w-12 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-zinc-200 text-xs focus:outline-none focus:border-blue-500" />
                      </td>
                      <td className="px-2 py-1.5">
                        <button type="button" onClick={() => setRows(rs => rs.filter((_, idx) => idx !== i))}
                          disabled={rows.length === 1} className="text-zinc-600 hover:text-red-400 disabled:opacity-30 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={() => router.push('/finance/reports/builder')}
              className="px-4 py-2 rounded-md text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors">
              Cancel
            </button>
            <button type="button" onClick={() => handleSubmit(false)} disabled={!form.name || !!saving}
              className="px-4 py-2 rounded-md text-sm font-medium bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors disabled:opacity-50">
              {saving === 'draft' ? 'Saving...' : 'Save Draft'}
            </button>
            <button type="button" onClick={() => handleSubmit(true)} disabled={!form.name || !!saving}
              className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50">
              {saving === 'publish' ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
