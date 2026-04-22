'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Plus, Trash2 } from 'lucide-react'

interface MemoLine {
  description: string
  documentType: string
  documentNo: string
  dueDate: string
  remainingAmount: number
  interestAmount: number
}

const EMPTY_LINE: MemoLine = {
  description: '',
  documentType: 'Invoice',
  documentNo: '',
  dueDate: '',
  remainingAmount: 0,
  interestAmount: 0,
}

const FIELD = 'w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500'
const LABEL = 'block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5'

export default function NewFinanceChargeMemoPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    customerNo: '',
    customerName: '',
    postingDate: new Date().toISOString().slice(0, 10),
    dueDate: '',
    currency: 'USD',
    financeChargeFee: 0,
    notes: '',
  })
  const [lines, setLines] = useState<MemoLine[]>([{ ...EMPTY_LINE }])
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2600)
  }

  const updateLine = (i: number, k: keyof MemoLine, v: string | number) =>
    setLines(ls => ls.map((l, idx) => idx === i ? { ...l, [k]: v } : l))

  const totalAmount = lines.reduce((s, l) => s + Number(l.remainingAmount) + Number(l.interestAmount), 0)

  const save = async () => {
    if (!form.customerName) { notify('Customer Name is required', 'err'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/finance/finance-charges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          amount: totalAmount,
          interestAmount: lines.reduce((s, l) => s + Number(l.interestAmount), 0),
          status: 'Draft',
          lines,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? 'Failed')
      }
      notify('Finance charge memo created')
      setTimeout(() => router.push('/finance/finance-charges'), 700)
    } catch (e) {
      notify(String(e), 'err')
      setSaving(false)
    }
  }

  const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="New Finance Charge Memo"
        breadcrumb={[{ label: 'Finance', href: '/finance' }, { label: 'Finance Charges', href: '/finance/finance-charges' }]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/finance/finance-charges" className="px-3 py-1.5 rounded text-xs font-medium bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors">Cancel</Link>
            <button onClick={save} disabled={saving}
              className="px-3 py-1.5 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors">
              {saving ? 'Saving…' : 'Create Memo'}
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
        {/* General FastTab */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800/50"><h2 className="text-sm font-semibold text-zinc-100">General</h2></div>
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className={LABEL}>Customer No.</label>
              <input type="text" value={form.customerNo} onChange={e => setForm(f => ({ ...f, customerNo: e.target.value }))}
                placeholder="C-001" className={FIELD} />
            </div>
            <div className="md:col-span-2">
              <label className={LABEL}>Customer Name <span className="text-red-400">*</span></label>
              <input type="text" value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
                placeholder="Customer name" className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Currency</label>
              <input type="text" value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                placeholder="USD" className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Posting Date</label>
              <input type="date" value={form.postingDate} onChange={e => setForm(f => ({ ...f, postingDate: e.target.value }))} className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Finance Charge Fee</label>
              <input type="number" step="0.01" min="0" value={form.financeChargeFee} onChange={e => setForm(f => ({ ...f, financeChargeFee: Number(e.target.value) }))} className={FIELD} />
            </div>
            <div className="md:col-span-4">
              <label className={LABEL}>Notes</label>
              <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Internal notes…" className={FIELD} />
            </div>
          </div>
        </div>

        {/* Lines FastTab */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-100">Finance Charge Lines</h2>
            <button onClick={() => setLines(ls => [...ls, { ...EMPTY_LINE }])}
              className="flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add Line
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/50">
                  {['Description', 'Doc Type', 'Document No.', 'Due Date', 'Remaining Amount', 'Interest Amount', ''].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {lines.map((l, i) => (
                  <tr key={i} className="hover:bg-zinc-800/10 transition-colors">
                    <td className="px-3 py-2">
                      <input type="text" value={l.description} onChange={e => updateLine(i, 'description', e.target.value)} placeholder="Description"
                        className="w-40 px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:border-blue-500" />
                    </td>
                    <td className="px-3 py-2">
                      <select value={l.documentType} onChange={e => updateLine(i, 'documentType', e.target.value)}
                        className="px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:border-blue-500">
                        <option>Invoice</option><option>Credit Memo</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input type="text" value={l.documentNo} onChange={e => updateLine(i, 'documentNo', e.target.value)} placeholder="INV-001"
                        className="w-28 px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 font-mono focus:outline-none focus:border-blue-500" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="date" value={l.dueDate} onChange={e => updateLine(i, 'dueDate', e.target.value)}
                        className="px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:border-blue-500" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" step="0.01" min="0" value={l.remainingAmount} onChange={e => updateLine(i, 'remainingAmount', Number(e.target.value))}
                        className="w-28 px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 text-right font-mono focus:outline-none focus:border-blue-500" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" step="0.01" min="0" value={l.interestAmount} onChange={e => updateLine(i, 'interestAmount', Number(e.target.value))}
                        className="w-24 px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 text-right font-mono focus:outline-none focus:border-blue-500" />
                    </td>
                    <td className="px-3 py-2">
                      {lines.length > 1 && (
                        <button onClick={() => setLines(ls => ls.filter((_, idx) => idx !== i))} className="text-zinc-600 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-zinc-800/40 flex items-center justify-end gap-8">
            <div className="text-xs text-zinc-500">Finance Charge Fee: <span className="text-zinc-100 font-mono font-bold tabular-nums">{fmt(form.financeChargeFee)}</span></div>
            <div className="text-sm font-bold text-zinc-500">Total Amount: <span className="text-red-400 font-mono tabular-nums text-base">{fmt(totalAmount)}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
