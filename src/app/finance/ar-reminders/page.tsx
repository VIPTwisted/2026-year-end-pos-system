'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency } from '@/lib/utils'

interface ReminderCustomer {
  id: string
  firstName: string
  lastName: string
  email: string | null
}

interface Reminder {
  id: string
  reminderNo: string
  level: number
  totalOverdue: number
  dueDate: string
  sentAt: string | null
  status: string
  notes: string | null
  createdAt: string
  customer: ReminderCustomer
}

interface Toast {
  msg: string
  type: 'ok' | 'err'
}

const LEVEL_BADGE: Record<number, string> = {
  1: 'bg-blue-500/10 text-blue-400',
  2: 'bg-amber-500/10 text-amber-400',
  3: 'bg-red-500/10 text-red-400',
}

const LEVEL_LABEL: Record<number, string> = {
  1: 'Friendly',
  2: 'Firm',
  3: 'Final Notice',
}

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-zinc-700 text-zinc-400',
  sent: 'bg-blue-500/10 text-blue-400',
  paid: 'bg-emerald-500/10 text-emerald-400',
  cancelled: 'bg-zinc-800 text-zinc-600',
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(
    new Date(d)
  )
}

export default function ARRemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<Toast | null>(null)
  const [sendingAll, setSendingAll] = useState(false)

  const notify = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }, [])

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/finance/ar-reminders')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load')
        return r.json()
      })
      .then((d: { reminders: Reminder[] }) => setReminders(d.reminders))
      .catch(() => setError('Failed to load AR reminders'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const markSent = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/finance/ar-reminders/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'sent' }),
        })
        if (!res.ok) throw new Error('Failed')
        notify('Reminder marked as sent', 'ok')
        load()
      } catch {
        notify('Failed to update reminder', 'err')
      }
    },
    [load, notify]
  )

  const sendAllDraft = useCallback(async () => {
    const drafts = reminders.filter((r) => r.status === 'draft')
    if (drafts.length === 0) {
      notify('No draft reminders to send', 'err')
      return
    }
    setSendingAll(true)
    try {
      await Promise.all(
        drafts.map((r) =>
          fetch(`/api/finance/ar-reminders/${r.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'sent' }),
          })
        )
      )
      notify(`${drafts.length} reminders marked as sent`, 'ok')
      load()
    } catch {
      notify('Some reminders failed to update', 'err')
    } finally {
      setSendingAll(false)
    }
  }, [reminders, load, notify])

  const draftCount = reminders.filter((r) => r.status === 'draft').length
  const sentCount = reminders.filter((r) => r.status === 'sent').length
  const overdueCustomers = new Set(
    reminders
      .filter((r) => r.status === 'sent')
      .map((r) => r.customer.id)
  ).size

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="AR Reminders"
        breadcrumb={[{ label: 'Finance', href: '/finance' }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={sendAllDraft}
              disabled={sendingAll || draftCount === 0}
              className="px-3 py-1.5 rounded text-xs font-medium bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 disabled:opacity-40 transition-colors"
            >
              {sendingAll ? 'Sending…' : `Send All Draft (${draftCount})`}
            </button>
            <Link
              href="/finance/ar-reminders/new"
              className="px-3 py-1.5 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              + Create Reminder
            </Link>
          </div>
        }
      />

      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded shadow-lg text-sm font-medium ${
            toast.type === 'ok'
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
              Draft Reminders
            </div>
            <div className="text-2xl font-bold text-zinc-100 tabular-nums">
              {draftCount}
            </div>
            <div className="text-xs text-zinc-500 mt-1">pending to send</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
              Sent
            </div>
            <div className="text-2xl font-bold text-blue-400 tabular-nums">
              {sentCount}
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              reminders dispatched
            </div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
              Overdue Customers
            </div>
            <div className="text-2xl font-bold text-amber-400 tabular-nums">
              {overdueCustomers}
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              with outstanding notices
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-100">
              All Reminders
            </h2>
            <span className="text-xs text-zinc-500">
              {reminders.length} records
            </span>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <p className="text-sm text-zinc-500">Loading…</p>
            </div>
          ) : error ? (
            <div className="py-20 text-center">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          ) : reminders.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-sm text-zinc-500">No reminders yet.</p>
              <Link
                href="/finance/ar-reminders/new"
                className="mt-3 inline-block text-xs text-blue-400 hover:text-blue-300"
              >
                Create your first reminder →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Reminder #
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Customer
                    </th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Level
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Total Overdue
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Due Date
                    </th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Sent Date
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {reminders.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-zinc-800/20 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <span className="font-mono text-xs text-blue-400 bg-blue-400/5 px-2 py-0.5 rounded">
                          {r.reminderNo}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-zinc-200 font-medium">
                          {r.customer.firstName} {r.customer.lastName}
                        </div>
                        {r.customer.email && (
                          <div className="text-xs text-zinc-500">
                            {r.customer.email}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                            LEVEL_BADGE[r.level] ?? 'bg-zinc-700 text-zinc-400'
                          }`}
                        >
                          {r.level} — {LEVEL_LABEL[r.level] ?? 'Unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono text-sm font-bold text-red-400 tabular-nums">
                          {formatCurrency(r.totalOverdue)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-zinc-400">
                          {fmtDate(r.dueDate)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                            STATUS_BADGE[r.status] ??
                            'bg-zinc-700 text-zinc-400'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-zinc-500">
                          {fmtDate(r.sentAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {r.status === 'draft' && (
                          <button
                            onClick={() => markSent(r.id)}
                            className="px-2.5 py-1 rounded text-[11px] font-medium bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors"
                          >
                            Mark Sent
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
