'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Plus, Trash2 } from 'lucide-react'

interface ReminderLine {
  lineNo: number
  documentType: string
  documentNo: string
  postingDate: string
  dueDate: string
  originalAmount: number
  remainingAmount: number
  interestAmount: number
  description: string
}

const EMPTY_LINE: ReminderLine = {
  lineNo: 1,
  documentType: 'Invoice',
  documentNo: '',
  postingDate: new Date().toISOString().slice(0, 10),
  dueDate: new Date().toISOString().slice(0, 10),
  originalAmount: 0,
  remainingAmount: 0,
  interestAmount: 0,
  description: '',
}

export default function NewReminderPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    customerNo: '',
    customerName: '',
    reminderLevel: 1,
    postingDate: new Date().toISOString().slice(0, 10),
    dueDate: '',
    reminderFee: 0,
    notes: '',
  })
  const [lines, setLines] = useState<ReminderLine[]>([{ ...EMPTY_LINE }])
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  const addLine = () => {
    setLines(ls => [...ls, { ...EMPTY_LINE, lineNo: ls.length + 1 }])
  }

  const removeLine = (idx: number) => {
    setLines(ls => ls.filter((_, i) => i !== idx).map((l, i) => ({ ...l, lineNo: i + 1 })))
  }

  const updateLine = (idx: number, field: keyof ReminderLine, value: string | number) => {
    setLines(ls => ls.map((l, i) => i === idx ? { ...l, [field]: value } : l))
  }

  const amountLCY = lines.reduce((s, l) => s + Number(l.remainingAmount), 0)

  const save = async () => {
    if (!form.customerName) { notify('Customer Name is required', 'err'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/finance/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amountLCY, lines, status: 'Open' }),
      })
      if (!res.ok) throw new Error('Failed')
      notify('Reminder created')
      setTimeout(() => router.push('/finance/reminders'), 800)
    } catch {
      notify('Failed to create reminder', 'err')
      setSaving(false)
    }
  }

  const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="New Reminder"
        breadcrumb={[
          { label: 'Finance', href: '/finance' },
          { label: 'Reminders', href: '/finance/reminders' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/finance/reminders" className="px-3 py-1.5 rounded text-xs font-medium bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors">
              Cancel
            </Link>
            <button onClick={save} disabled={saving}
              className="px-3 py-1.5 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors">
              {saving ? 'Saving…' : 'Create Reminder'}
            </button>
          </div>
        }
      />

      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded shadow-lg text-sm font-medium ${toast.type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-100">Reminder Header</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Customer No.</label>
              <input type="text" value={form.customerNo} onChange={e => setForm(f => ({ ...f, customerNo: e.target.value }))} placeholder="C-001"
                className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Customer Name <span className="text-red-400">*</span></label>
              <input type="text" value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} placeholder="Customer name"
                className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Reminder Level</label>
              <select value={form.reminderLevel} onChange={e => setForm(f => ({ ...f, reminderLevel: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                <option value={1}>Level 1 — Friendly</option>
                <option value={2}>Level 2 — Firm</option>
                <option value={3}>Level 3 — Final Notice</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Posting Date</label>
              <input type="date" value={form.postingDate} onChange={e => setForm(f => ({ ...f, postingDate: e.target.value }))}
                className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Reminder Fee</label>
              <input type="number" step="0.01" value={form.reminderFee} onChange={e => setForm(f => ({ ...f, reminderFee: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Notes</label>
              <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Internal notes…"
                className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500" />
            </div>
          </div>
        </div>

        {/* Lines */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-100">Overdue Invoice Lines</h2>
            <button onClick={addLine}
              className="flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add Line
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/50">
                  {['#', 'Doc Type', 'Document No.', 'Posting Date', 'Due Date', 'Original Amount', 'Remaining Amount', 'Interest', 'Description', ''].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {lines.map((l, idx) => (
                  <tr key={idx} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-3 py-2 text-xs text-zinc-500 tabular-nums">{l.lineNo}</td>
                    <td className="px-3 py-2">
                      <select value={l.documentType} onChange={e => updateLine(idx, 'documentType', e.target.value)}
                        className="px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:border-blue-500">
                        <option>Invoice</option>
                        <option>Credit Memo</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input type="text" value={l.documentNo} onChange={e => updateLine(idx, 'documentNo', e.target.value)} placeholder="INV-001"
                        className="w-28 px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 font-mono" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="date" value={l.postingDate} onChange={e => updateLine(idx, 'postingDate', e.target.value)}
                        className="px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:border-blue-500" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="date" value={l.dueDate} onChange={e => updateLine(idx, 'dueDate', e.target.value)}
                        className="px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:border-blue-500" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" step="0.01" value={l.originalAmount} onChange={e => updateLine(idx, 'originalAmount', e.target.value)}
                        className="w-28 px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:border-blue-500 text-right font-mono" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" step="0.01" value={l.remainingAmount} onChange={e => updateLine(idx, 'remainingAmount', e.target.value)}
                        className="w-28 px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:border-blue-500 text-right font-mono" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" step="0.01" value={l.interestAmount} onChange={e => updateLine(idx, 'interestAmount', e.target.value)}
                        className="w-24 px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:border-blue-500 text-right font-mono" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="text" value={l.description} onChange={e => updateLine(idx, 'description', e.target.value)} placeholder="Description"
                        className="w-40 px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500" />
                    </td>
                    <td className="px-3 py-2">
                      {lines.length > 1 && (
                        <button onClick={() => removeLine(idx)} className="text-zinc-600 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals footer */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 flex items-center justify-end gap-8">
          <div className="text-xs text-zinc-500">Reminder Fee: <span className="text-zinc-100 font-mono font-bold tabular-nums">{fmt(form.reminderFee)}</span></div>
          <div className="text-xs text-zinc-500">Total Interest: <span className="text-zinc-100 font-mono tabular-nums">{fmt(lines.reduce((s, l) => s + Number(l.interestAmount), 0))}</span></div>
          <div className="text-sm font-bold text-zinc-500">Amount (LCY): <span className="text-red-400 font-mono tabular-nums text-base">{fmt(amountLCY)}</span></div>
        </div>
      </div>
    </div>
  )
}
