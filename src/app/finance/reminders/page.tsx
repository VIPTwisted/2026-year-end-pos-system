'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Plus, ChevronRight, Printer, Send } from 'lucide-react'

interface Reminder {
  id: string
  reminderNo: string
  customerId: string | null
  customerNo: string | null
  customerName: string | null
  reminderLevel: number
  postingDate: string
  dueDate: string | null
  amountLCY: number
  reminderFee: number
  status: string
  issuedAt: string | null
}

const LEVEL_CLS: Record<number, string> = {
  1: 'bg-blue-500/10 text-blue-400',
  2: 'bg-amber-500/10 text-amber-400',
  3: 'bg-red-500/10 text-red-400',
}

const STATUS_CLS: Record<string, string> = {
  Open: 'bg-amber-500/10 text-amber-400',
  Issued: 'bg-blue-500/10 text-blue-400',
  Canceled: 'bg-zinc-700/50 text-zinc-500',
}

const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
const fmtDate = (d: string | null) => d ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(d)) : '—'

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/finance/reminders')
      .then(r => r.json())
      .then(d => setReminders(d.reminders ?? []))
      .catch(() => setReminders([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const issueReminder = async (id: string) => {
    try {
      const res = await fetch(`/api/finance/reminders?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Issued' }),
      })
      if (!res.ok) throw new Error('Failed')
      notify('Reminder issued')
      load()
    } catch {
      notify('Failed to issue reminder', 'err')
    }
  }

  const openCount = reminders.filter(r => r.status === 'Open').length
  const issuedCount = reminders.filter(r => r.status === 'Issued').length
  const totalAmount = reminders.reduce((s, r) => s + r.amountLCY, 0)
  const totalFees = reminders.reduce((s, r) => s + r.reminderFee, 0)

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="Reminders"
        breadcrumb={[{ label: 'Finance', href: '/finance' }]}
        actions={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700 transition-colors">
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <Link href="/finance/reminders/new"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors">
              <Plus className="w-3.5 h-3.5" /> New
            </Link>
          </div>
        }
      />

      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded shadow-lg text-sm font-medium ${toast.type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Open</div>
            <div className="text-2xl font-bold text-amber-400 tabular-nums">{openCount}</div>
            <div className="text-xs text-zinc-500 mt-1">awaiting issue</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Issued</div>
            <div className="text-2xl font-bold text-blue-400 tabular-nums">{issuedCount}</div>
            <div className="text-xs text-zinc-500 mt-1">sent to customers</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Amount (LCY)</div>
            <div className="text-xl font-bold text-red-400 tabular-nums">{fmt(totalAmount)}</div>
            <div className="text-xs text-zinc-500 mt-1">outstanding overdue</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Reminder Fees</div>
            <div className="text-xl font-bold text-zinc-100 tabular-nums">{fmt(totalFees)}</div>
            <div className="text-xs text-zinc-500 mt-1">total fees charged</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-100">All Reminders</h2>
            <span className="text-xs text-zinc-500">{reminders.length} records</span>
          </div>

          {loading ? (
            <div className="py-20 text-center"><p className="text-sm text-zinc-500">Loading…</p></div>
          ) : reminders.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-sm text-zinc-500 mb-3">No reminders yet.</p>
              <Link href="/finance/reminders/new" className="text-xs text-blue-400 hover:text-blue-300">Create first reminder →</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    {['No.', 'Customer No.', 'Customer Name', 'Level', 'Posting Date', 'Due Date', 'Amount (LCY)', 'Reminder Fee', 'Status', 'Actions', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {reminders.map(r => (
                    <tr key={r.id} className="hover:bg-zinc-800/20 transition-colors group">
                      <td className="px-4 py-3">
                        <Link href={`/finance/reminders/${r.id}`} className="font-mono text-xs text-blue-400 bg-blue-400/5 px-2 py-0.5 rounded hover:text-blue-300">
                          {r.reminderNo.slice(-8)}
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-400">{r.customerNo ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-zinc-200 font-medium">{r.customerName ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${LEVEL_CLS[r.reminderLevel] ?? 'bg-zinc-700 text-zinc-400'}`}>
                          Level {r.reminderLevel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-400">{fmtDate(r.postingDate)}</td>
                      <td className="px-4 py-3 text-sm text-zinc-400">{fmtDate(r.dueDate)}</td>
                      <td className="px-4 py-3 tabular-nums text-sm font-bold text-right text-red-400">{fmt(r.amountLCY)}</td>
                      <td className="px-4 py-3 tabular-nums text-sm text-right text-zinc-300">{fmt(r.reminderFee)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_CLS[r.status] ?? 'bg-zinc-700 text-zinc-400'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {r.status === 'Open' && (
                          <button onClick={() => issueReminder(r.id)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors">
                            <Send className="w-3 h-3" /> Issue
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/finance/reminders/${r.id}`}>
                          <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                        </Link>
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
