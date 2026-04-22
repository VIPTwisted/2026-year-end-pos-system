'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Plus, ChevronRight, Send } from 'lucide-react'

interface FinanceChargeMemo {
  id: string
  memoNo: string
  customerId: string | null
  customerName: string | null
  postingDate: string
  dueDate: string | null
  amount: number
  interestRate: number
  status: string
  issuedAt: string | null
}

const STATUS_CLS: Record<string, string> = {
  Open: 'bg-amber-500/10 text-amber-400',
  Issued: 'bg-blue-500/10 text-blue-400',
  Canceled: 'bg-zinc-700/50 text-zinc-500',
}

const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
const fmtDate = (d: string | null) => d ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(d)) : '—'

export default function FinanceChargeMemosPage() {
  const [memos, setMemos] = useState<FinanceChargeMemo[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ customerName: '', postingDate: new Date().toISOString().slice(0, 10), amount: '', interestRate: '' })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/finance/finance-charge-memos')
      .then(r => r.json())
      .then(d => setMemos(d.memos ?? []))
      .catch(() => setMemos([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const createMemo = async () => {
    if (!form.customerName) { notify('Customer Name is required', 'err'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/finance/finance-charge-memos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          amount: parseFloat(form.amount) || 0,
          interestRate: parseFloat(form.interestRate) || 0,
          status: 'Open',
        }),
      })
      if (!res.ok) throw new Error('Failed')
      notify('Memo created')
      setForm({ customerName: '', postingDate: new Date().toISOString().slice(0, 10), amount: '', interestRate: '' })
      setShowNew(false)
      load()
    } catch {
      notify('Failed to create memo', 'err')
    } finally {
      setSaving(false)
    }
  }

  const issueMemo = async (id: string) => {
    try {
      await fetch(`/api/finance/finance-charge-memos?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Issued' }),
      })
      notify('Memo issued')
      load()
    } catch {
      notify('Failed to issue', 'err')
    }
  }

  const openCount = memos.filter(m => m.status === 'Open').length
  const totalAmount = memos.reduce((s, m) => s + m.amount, 0)

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="Finance Charge Memos"
        breadcrumb={[{ label: 'Finance', href: '/finance' }]}
        actions={
          <button onClick={() => setShowNew(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            <Plus className="w-3.5 h-3.5" /> New Memo
          </button>
        }
      />

      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded shadow-lg text-sm font-medium ${toast.type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Open Memos</div>
            <div className="text-2xl font-bold text-amber-400 tabular-nums">{openCount}</div>
            <div className="text-xs text-zinc-500 mt-1">awaiting issue</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Memos</div>
            <div className="text-2xl font-bold text-zinc-100 tabular-nums">{memos.length}</div>
            <div className="text-xs text-zinc-500 mt-1">all statuses</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Amount</div>
            <div className="text-xl font-bold text-zinc-100 tabular-nums">{fmt(totalAmount)}</div>
            <div className="text-xs text-zinc-500 mt-1">finance charges</div>
          </div>
        </div>

        {showNew && (
          <div className="bg-[#16213e] border border-blue-600/30 rounded-lg p-5 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-100">New Finance Charge Memo</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Customer Name <span className="text-red-400">*</span></label>
                <input type="text" value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} placeholder="Customer name"
                  className="w-full px-2 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Posting Date</label>
                <input type="date" value={form.postingDate} onChange={e => setForm(f => ({ ...f, postingDate: e.target.value }))}
                  className="w-full px-2 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Amount</label>
                <input type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00"
                  className="w-full px-2 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Interest Rate (%)</label>
                <input type="number" step="0.01" value={form.interestRate} onChange={e => setForm(f => ({ ...f, interestRate: e.target.value }))} placeholder="1.50"
                  className="w-full px-2 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={createMemo} disabled={saving}
                className="px-4 py-1.5 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors">
                {saving ? 'Creating…' : 'Create Memo'}
              </button>
              <button onClick={() => setShowNew(false)}
                className="px-3 py-1.5 rounded text-xs font-medium bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-100">Finance Charge Memos</h2>
            <span className="text-xs text-zinc-500">{memos.length} records</span>
          </div>

          {loading ? (
            <div className="py-20 text-center"><p className="text-sm text-zinc-500">Loading…</p></div>
          ) : memos.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-sm text-zinc-500 mb-3">No finance charge memos yet.</p>
              <button onClick={() => setShowNew(true)} className="text-xs text-blue-400 hover:text-blue-300">Create first memo →</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    {['No.', 'Customer', 'Posting Date', 'Due Date', 'Amount', 'Interest Rate', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {memos.map(m => (
                    <tr key={m.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-blue-400 bg-blue-400/5 rounded">{m.memoNo.slice(-8)}</td>
                      <td className="px-4 py-3 text-sm text-zinc-200 font-medium">{m.customerName ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-zinc-400">{fmtDate(m.postingDate)}</td>
                      <td className="px-4 py-3 text-sm text-zinc-400">{fmtDate(m.dueDate)}</td>
                      <td className="px-4 py-3 tabular-nums text-sm font-bold text-zinc-100">{fmt(m.amount)}</td>
                      <td className="px-4 py-3 tabular-nums text-sm text-zinc-400">{m.interestRate}%</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_CLS[m.status] ?? 'bg-zinc-700 text-zinc-400'}`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {m.status === 'Open' && (
                          <button onClick={() => issueMemo(m.id)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors">
                            <Send className="w-3 h-3" /> Issue
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
