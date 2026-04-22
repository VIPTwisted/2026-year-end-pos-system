'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency } from '@/lib/utils'
import { Mail, Phone, FileText, X, Send } from 'lucide-react'

type BucketKey = 'b0_30' | 'b31_60' | 'b61_90' | 'b91_120' | 'b120plus'

interface AgingRow {
  id: string
  invoiceNumber: string
  customerId: string
  customerName: string
  customerEmail: string | null
  dueDate: string
  totalAmount: number
  paidAmount: number
  outstanding: number
  daysOverdue: number
  bucket: BucketKey
}

interface CollectionCase {
  id: string
  invoiceId: string
  invoiceNumber: string
  customerId: string
  customerName: string
  customerEmail: string | null
  outstanding: number
  daysOverdue: number
  bucket: BucketKey
  status: 'open' | 'promised' | 'disputed' | 'written-off'
  collector: string
  nextActionDate: string
}

interface BucketInfo {
  label: string
  total: number
  count: number
}

interface AgingBuckets {
  b0_30: BucketInfo
  b31_60: BucketInfo
  b61_90: BucketInfo
  b91_120: BucketInfo
  b120plus: BucketInfo
}

interface ReminderModal {
  invoiceId: string
  invoiceNumber: string
  customerName: string
  customerEmail: string | null
}

interface Toast {
  msg: string
  type: 'ok' | 'err'
}

const BUCKET_COLOR: Record<BucketKey, string> = {
  b0_30: 'text-emerald-400',
  b31_60: 'text-amber-400',
  b61_90: 'text-orange-400',
  b91_120: 'text-red-400',
  b120plus: 'text-red-500',
}
const BUCKET_BADGE: Record<BucketKey, string> = {
  b0_30: 'bg-emerald-500/10 text-emerald-400',
  b31_60: 'bg-amber-500/10 text-amber-400',
  b61_90: 'bg-orange-500/10 text-orange-400',
  b91_120: 'bg-red-500/10 text-red-400',
  b120plus: 'bg-red-800/30 text-red-300',
}
const CASE_BADGE: Record<string, string> = {
  open: 'bg-blue-500/10 text-blue-400',
  promised: 'bg-emerald-500/10 text-emerald-400',
  disputed: 'bg-amber-500/10 text-amber-400',
  'written-off': 'bg-zinc-700 text-zinc-500',
}

function fmtDate(d: string) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(d))
}

export default function CollectionsPage() {
  const [view, setView] = useState<'aging' | 'cases'>('aging')
  const [agingRows, setAgingRows] = useState<AgingRow[]>([])
  const [cases, setCases] = useState<CollectionCase[]>([])
  const [buckets, setBuckets] = useState<AgingBuckets | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reminder, setReminder] = useState<ReminderModal | null>(null)
  const [channel, setChannel] = useState<'email' | 'letter' | 'call'>('email')
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)

  const notify = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }, [])

  const load = useCallback(() => {
    setLoading(true)
    const url = view === 'cases'
      ? '/api/finance/collections?view=cases'
      : '/api/finance/collections'
    fetch(url)
      .then((r) => { if (!r.ok) throw new Error('Failed'); return r.json() })
      .then((d: { rows?: AgingRow[]; cases?: CollectionCase[]; agingBuckets: AgingBuckets }) => {
        setBuckets(d.agingBuckets)
        if (view === 'cases') setCases(d.cases ?? [])
        else setAgingRows(d.rows ?? [])
      })
      .catch(() => setError('Failed to load collections'))
      .finally(() => setLoading(false))
  }, [view])

  useEffect(() => { load() }, [load])

  const sendReminder = useCallback(async () => {
    if (!reminder) return
    setSending(true)
    try {
      const res = await fetch('/api/finance/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_reminder', invoiceId: reminder.invoiceId, channel }),
      })
      if (!res.ok) throw new Error('Failed')
      notify(`Reminder sent via ${channel}`, 'ok')
      setReminder(null)
    } catch {
      notify('Failed to send reminder', 'err')
    } finally {
      setSending(false)
    }
  }, [reminder, channel, notify])

  const grandTotal = buckets
    ? Object.values(buckets).reduce((s, b) => s + b.total, 0)
    : 0

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="Collections"
        breadcrumb={[{ label: 'Finance', href: '/finance' }]}
      />

      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded shadow-lg text-sm font-medium ${toast.type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {reminder && (
        <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-100">Send Reminder</h2>
              <button onClick={() => setReminder(null)}><X className="w-4 h-4 text-zinc-500" /></button>
            </div>
            <p className="text-xs text-zinc-400">Invoice <span className="font-mono text-zinc-300">{reminder.invoiceNumber}</span> — {reminder.customerName}</p>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-2">Channel</label>
              <div className="flex gap-2">
                {(['email', 'letter', 'call'] as const).map((ch) => (
                  <button
                    key={ch}
                    onClick={() => setChannel(ch)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-xs font-medium border transition-colors ${channel === ch ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'}`}
                  >
                    {ch === 'email' ? <Mail className="w-3.5 h-3.5" /> : ch === 'call' ? <Phone className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                    {ch}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={sendReminder}
                disabled={sending}
                className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded px-4 py-2 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                {sending ? 'Sending…' : 'Send'}
              </button>
              <button onClick={() => setReminder(null)} className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 text-sm font-medium rounded px-4 py-2 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* AR Aging Buckets */}
        {buckets && (
          <div className="grid grid-cols-6 gap-4">
            {(Object.entries(buckets) as [BucketKey, BucketInfo][]).map(([key, b]) => (
              <div key={key} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">{b.label}</div>
                <div className={`text-lg font-bold font-mono tabular-nums ${BUCKET_COLOR[key]}`}>{formatCurrency(b.total)}</div>
                <div className="text-xs text-zinc-500 mt-1">{b.count} invoices</div>
              </div>
            ))}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total AR</div>
              <div className="text-lg font-bold font-mono tabular-nums text-zinc-100">{formatCurrency(grandTotal)}</div>
              <div className="text-xs text-zinc-500 mt-1">outstanding</div>
            </div>
          </div>
        )}

        {/* View toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('aging')}
            className={`px-4 py-1.5 rounded text-xs font-medium transition-colors ${view === 'aging' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
          >
            AR Aging
          </button>
          <button
            onClick={() => setView('cases')}
            className={`px-4 py-1.5 rounded text-xs font-medium transition-colors ${view === 'cases' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
          >
            Collection Cases
          </button>
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-100">
              {view === 'aging' ? 'Open Invoices by Aging' : 'Collection Cases'}
            </h2>
            <span className="text-xs text-zinc-500">
              {view === 'aging' ? agingRows.length : cases.length} records
            </span>
          </div>

          {loading ? (
            <div className="py-20 text-center"><p className="text-sm text-zinc-500">Loading…</p></div>
          ) : error ? (
            <div className="py-20 text-center"><p className="text-sm text-red-400">{error}</p></div>
          ) : view === 'aging' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Customer</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Invoice #</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Due Date</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Outstanding</th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Days</th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Bucket</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {agingRows.map((row) => (
                    <tr key={row.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-5 py-3">
                        <Link href={`/finance/collections/${row.customerId}`} className="text-sm text-zinc-200 font-medium hover:text-blue-400 transition-colors">
                          {row.customerName}
                        </Link>
                        {row.customerEmail && <div className="text-xs text-zinc-500">{row.customerEmail}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-blue-400 bg-blue-400/5 px-2 py-0.5 rounded">{row.invoiceNumber}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-400">{fmtDate(row.dueDate)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-mono text-sm font-bold tabular-nums ${BUCKET_COLOR[row.bucket]}`}>{formatCurrency(row.outstanding)}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-mono text-xs font-semibold tabular-nums ${BUCKET_COLOR[row.bucket]}`}>{row.daysOverdue}d</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${BUCKET_BADGE[row.bucket]}`}>
                          {buckets?.[row.bucket].label ?? row.bucket}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setReminder({ invoiceId: row.id, invoiceNumber: row.invoiceNumber, customerName: row.customerName, customerEmail: row.customerEmail })}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors"
                        >
                          <Send className="w-3 h-3" />
                          Remind
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Customer</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Invoice #</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Outstanding</th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Days</th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Collector</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Next Action</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {cases.map((c) => (
                    <tr key={c.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-5 py-3">
                        <Link href={`/finance/collections/${c.customerId}`} className="text-sm text-zinc-200 font-medium hover:text-blue-400 transition-colors">
                          {c.customerName}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-blue-400 bg-blue-400/5 px-2 py-0.5 rounded">{c.invoiceNumber}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-mono text-sm font-bold tabular-nums ${BUCKET_COLOR[c.bucket]}`}>{formatCurrency(c.outstanding)}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-mono text-xs font-semibold ${BUCKET_COLOR[c.bucket]}`}>{c.daysOverdue}d</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${CASE_BADGE[c.status] ?? 'bg-zinc-700 text-zinc-400'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-400">{c.collector}</td>
                      <td className="px-4 py-3 text-sm text-zinc-400">{fmtDate(c.nextActionDate)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/finance/collections/${c.customerId}`}
                            className="px-2.5 py-1 rounded text-[11px] font-medium bg-zinc-700/50 text-zinc-300 hover:bg-zinc-700 transition-colors"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => setReminder({ invoiceId: c.invoiceId, invoiceNumber: c.invoiceNumber, customerName: c.customerName, customerEmail: c.customerEmail })}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors"
                          >
                            <Send className="w-3 h-3" />
                            Remind
                          </button>
                        </div>
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
