'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Plus, Trash2, GripVertical } from 'lucide-react'

type RowType    = 'posting' | 'heading' | 'total' | 'begin_total' | 'end_total'
type AmountType = 'net_change' | 'balance_at_date' | 'budget'

interface ScheduleRow { rowNo: string; description: string; totaling: string; rowType: RowType; amountType: AmountType }

const REPORT_TYPES = [
  { value: 'income_statement', label: 'Income Statement' },
  { value: 'balance_sheet', label: 'Balance Sheet' },
  { value: 'cash_flow', label: 'Cash Flow' },
  { value: 'trial_balance', label: 'Trial Balance' },
  { value: 'custom', label: 'Custom' },
]

const ROW_TYPES: { value: RowType; label: string }[] = [
  { value: 'posting', label: 'Posting Accounts' },
  { value: 'heading', label: 'Heading' },
  { value: 'total', label: 'Total' },
  { value: 'begin_total', label: 'Begin-Total' },
  { value: 'end_total', label: 'End-Total' },
]

const AMOUNT_TYPES: { value: AmountType; label: string }[] = [
  { value: 'net_change', label: 'Net Change' },
  { value: 'balance_at_date', label: 'Balance at Date' },
  { value: 'budget', label: 'Budget' },
]

function emptyRow(): ScheduleRow {
  return { rowNo: '', description: '', totaling: '', rowType: 'posting', amountType: 'net_change' }
}

export default function NewAccountSchedulePage() {
  const router = useRouter()
  const [name,        setName]        = useState('')
  const [description, setDescription] = useState('')
  const [reportType,  setReportType]  = useState('income_statement')
  const [rows,        setRows]        = useState<ScheduleRow[]>([emptyRow()])
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')

  const addRow    = () => setRows(prev => [...prev, emptyRow()])
  const removeRow = (i: number) => setRows(prev => prev.filter((_, idx) => idx !== i))
  const updateRow = (i: number, field: keyof ScheduleRow, value: string) =>
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r))

  const save = async () => {
    if (!name.trim()) { setError('Name is required'); return }
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/finance/account-schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description, reportType, rowsJson: rows }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      router.push(`/finance/account-schedules/${data.id}`)
    } catch (e) {
      setError(String(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar
        title="New Account Schedule"
        breadcrumb={[{ label: 'Finance', href: '/finance' }, { label: 'Account Schedules', href: '/finance/account-schedules' }]}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="px-3 py-1.5 text-[12px] font-medium rounded text-zinc-400 hover:text-zinc-200 transition-colors">Cancel</button>
            <button onClick={save} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-medium rounded transition-colors disabled:opacity-60">
              {saving ? 'Saving…' : 'Save Schedule'}
            </button>
          </div>
        }
      />
      <div className="min-h-[100dvh] bg-[#0f0f1a] p-6 space-y-5">
        {error && <div className="bg-red-900/20 border border-red-500/30 rounded-lg px-4 py-3 text-[13px] text-red-400">{error}</div>}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-4">Schedule Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[11px] text-zinc-500 mb-1">Name <span className="text-red-400">*</span></label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Standard P&L" className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-[13px] text-zinc-200 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-500 mb-1">Report Type</label>
              <select value={reportType} onChange={e => setReportType(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-[13px] text-zinc-200 focus:outline-none focus:border-indigo-500">
                {REPORT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-[11px] text-zinc-500 mb-1">Description</label>
              <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description" className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-[13px] text-zinc-200 focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
        </div>

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800/60 flex items-center justify-between">
            <span className="text-[13px] font-semibold text-zinc-200">Schedule Rows</span>
            <button onClick={addRow} className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium rounded transition-colors" style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}>
              <Plus className="w-3 h-3" /> Add Row
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-900/40">
                  <th className="w-8 px-2 py-2"></th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 w-24">Row No.</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Description</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 w-36">Totaling</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 w-36">Row Type</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 w-36">Amount Type</th>
                  <th className="w-10 px-2 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-b border-zinc-800/30 hover:bg-[rgba(99,102,241,0.03)]">
                    <td className="px-2 py-1.5 text-zinc-700 cursor-grab"><GripVertical className="w-3.5 h-3.5" /></td>
                    <td className="px-3 py-1.5"><input value={row.rowNo} onChange={e => updateRow(i, 'rowNo', e.target.value)} placeholder="10" className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-[12px] text-zinc-200 focus:outline-none focus:border-indigo-500" /></td>
                    <td className="px-3 py-1.5"><input value={row.description} onChange={e => updateRow(i, 'description', e.target.value)} placeholder="e.g., Sales Revenue" className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-[12px] text-zinc-200 focus:outline-none focus:border-indigo-500" /></td>
                    <td className="px-3 py-1.5"><input value={row.totaling} onChange={e => updateRow(i, 'totaling', e.target.value)} placeholder="4000..4999" className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-[12px] text-zinc-200 focus:outline-none focus:border-indigo-500" /></td>
                    <td className="px-3 py-1.5"><select value={row.rowType} onChange={e => updateRow(i, 'rowType', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-[12px] text-zinc-200 focus:outline-none focus:border-indigo-500">{ROW_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></td>
                    <td className="px-3 py-1.5"><select value={row.amountType} onChange={e => updateRow(i, 'amountType', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-[12px] text-zinc-200 focus:outline-none focus:border-indigo-500">{AMOUNT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></td>
                    <td className="px-2 py-1.5"><button onClick={() => removeRow(i)} className="text-zinc-600 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
