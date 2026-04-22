'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency } from '@/lib/utils'

interface CustomerOption {
  id: string
  firstName: string
  lastName: string
  email: string | null
}

interface Invoice {
  id: string
  invoiceNumber: string
  dueDate: string
  totalAmount: number
  paidAmount: number
}

interface CreditDetail {
  arInvoices: Invoice[]
}

interface Toast {
  msg: string
  type: 'ok' | 'err'
}

const LEVEL_CONFIG = [
  {
    level: 1,
    label: 'Level 1 — Friendly Reminder',
    description: 'Polite first notice. Payment may have been overlooked.',
    color: 'border-blue-500/40 bg-blue-500/5 text-blue-300',
    badge: 'bg-blue-500/10 text-blue-400',
  },
  {
    level: 2,
    label: 'Level 2 — Firm Notice',
    description: 'Second notice. Payment is significantly overdue.',
    color: 'border-amber-500/40 bg-amber-500/5 text-amber-300',
    badge: 'bg-amber-500/10 text-amber-400',
  },
  {
    level: 3,
    label: 'Level 3 — Final Notice',
    description: 'Final demand before collections. Urgent action required.',
    color: 'border-red-500/40 bg-red-500/5 text-red-300',
    badge: 'bg-red-500/10 text-red-400',
  },
]

function fmtDate(d: string) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(
    new Date(d)
  )
}

export default function NewARReminderPage() {
  const router = useRouter()

  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [search, setSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerOption | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loadingInvoices, setLoadingInvoices] = useState(false)
  const [level, setLevel] = useState(1)
  const [notes, setNotes] = useState('')
  const [dueDate, setDueDate] = useState(
    new Date().toISOString().slice(0, 10)
  )
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)

  const notify = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }, [])

  // Load customers for search
  useEffect(() => {
    fetch('/api/customers?limit=500')
      .then((r) => r.json())
      .then((d: { customers?: CustomerOption[] }) => {
        setCustomers(d.customers ?? [])
      })
      .catch(() => {})
  }, [])

  // Load overdue invoices when customer selected
  useEffect(() => {
    if (!selectedCustomer) {
      setInvoices([])
      return
    }
    setLoadingInvoices(true)
    fetch(`/api/customers/${selectedCustomer.id}/credit`)
      .then((r) => r.json())
      .then((d: CreditDetail) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const overdue = (d.arInvoices ?? []).filter(
          (inv) => new Date(inv.dueDate) < today
        )
        setInvoices(overdue)
      })
      .catch(() => setInvoices([]))
      .finally(() => setLoadingInvoices(false))
  }, [selectedCustomer])

  const filteredCustomers = customers.filter((c) => {
    const q = search.toLowerCase()
    return (
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      (c.email ?? '').toLowerCase().includes(q)
    )
  })

  const totalOverdue = invoices.reduce(
    (sum, inv) => sum + (inv.totalAmount - inv.paidAmount),
    0
  )

  const selectedLevel = LEVEL_CONFIG.find((l) => l.level === level)!

  const reminderPreview = selectedCustomer
    ? `Dear ${selectedCustomer.firstName} ${selectedCustomer.lastName},\n\nThis is a ${selectedLevel.label.toLowerCase()} regarding ${invoices.length} overdue invoice${invoices.length !== 1 ? 's' : ''} totaling ${formatCurrency(totalOverdue)}.\n\nPlease remit payment at your earliest convenience to avoid further action.\n\n${notes ? `Notes: ${notes}\n\n` : ''}Thank you for your prompt attention.`
    : ''

  const handleSubmit = useCallback(async () => {
    if (!selectedCustomer) {
      notify('Please select a customer', 'err')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/finance/ar-reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          level,
          notes: notes || undefined,
          dueDate,
        }),
      })
      if (!res.ok) throw new Error('Failed to create')
      notify('Reminder created', 'ok')
      router.push('/finance/ar-reminders')
    } catch {
      notify('Failed to create reminder', 'err')
    } finally {
      setSubmitting(false)
    }
  }, [selectedCustomer, level, notes, dueDate, router, notify])

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="New AR Reminder"
        showBack
        breadcrumb={[
          { label: 'Finance', href: '/finance' },
          { label: 'AR Reminders', href: '/finance/ar-reminders' },
        ]}
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

      <div className="flex-1 p-6 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-2 gap-6">
          {/* Left: form */}
          <div className="space-y-5">
            {/* Customer search */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-3">
              <h2 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Customer
              </h2>
              <input
                type="text"
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
              />
              {search && !selectedCustomer && (
                <div className="bg-zinc-900 border border-zinc-700 rounded max-h-48 overflow-y-auto divide-y divide-zinc-800/50">
                  {filteredCustomers.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-zinc-500">
                      No customers found
                    </div>
                  ) : (
                    filteredCustomers.slice(0, 10).map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelectedCustomer(c)
                          setSearch(`${c.firstName} ${c.lastName}`)
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-zinc-800 transition-colors"
                      >
                        <div className="text-sm text-zinc-200">
                          {c.firstName} {c.lastName}
                        </div>
                        {c.email && (
                          <div className="text-xs text-zinc-500">{c.email}</div>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
              {selectedCustomer && (
                <div className="flex items-center justify-between p-2.5 bg-zinc-900/50 border border-zinc-700/50 rounded">
                  <div>
                    <div className="text-sm text-zinc-200 font-medium">
                      {selectedCustomer.firstName} {selectedCustomer.lastName}
                    </div>
                    {selectedCustomer.email && (
                      <div className="text-xs text-zinc-500">
                        {selectedCustomer.email}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCustomer(null)
                      setSearch('')
                    }}
                    className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>

            {/* Overdue invoices */}
            {selectedCustomer && (
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-3">
                <h2 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                  Overdue Invoices
                </h2>
                {loadingInvoices ? (
                  <p className="text-sm text-zinc-500">Loading invoices…</p>
                ) : invoices.length === 0 ? (
                  <p className="text-sm text-zinc-500">
                    No overdue invoices found.
                  </p>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      {invoices.map((inv) => (
                        <div
                          key={inv.id}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="font-mono text-blue-400">
                            {inv.invoiceNumber}
                          </span>
                          <span className="text-zinc-500">
                            Due {fmtDate(inv.dueDate)}
                          </span>
                          <span className="font-mono font-semibold text-red-400 tabular-nums">
                            {formatCurrency(
                              inv.totalAmount - inv.paidAmount
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-zinc-800/50 flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                        Total Overdue
                      </span>
                      <span className="font-mono font-bold text-red-400 tabular-nums text-sm">
                        {formatCurrency(totalOverdue)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Level select */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-3">
              <h2 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Reminder Level
              </h2>
              <div className="space-y-2">
                {LEVEL_CONFIG.map((cfg) => (
                  <button
                    key={cfg.level}
                    onClick={() => setLevel(cfg.level)}
                    className={`w-full text-left p-3 rounded border transition-all ${
                      level === cfg.level
                        ? cfg.color
                        : 'border-zinc-700/50 bg-zinc-900/30 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    <div className="font-medium text-sm">{cfg.label}</div>
                    <div className="text-xs mt-0.5 opacity-70">
                      {cfg.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Due date */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-3">
              <h2 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Reminder Due Date
              </h2>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Notes */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-3">
              <h2 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Notes (optional)
              </h2>
              <textarea
                rows={3}
                placeholder="Additional notes or instructions…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || !selectedCustomer}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-medium rounded px-4 py-2.5 transition-colors"
            >
              {submitting ? 'Creating…' : 'Create Reminder'}
            </button>
          </div>

          {/* Right: preview */}
          <div className="space-y-5">
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                  Reminder Preview
                </h2>
                {selectedCustomer && (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${selectedLevel.badge}`}
                  >
                    Level {level} — {selectedLevel.label.split(' — ')[1]}
                  </span>
                )}
              </div>
              {!selectedCustomer ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-zinc-600">
                    Select a customer to preview reminder text
                  </p>
                </div>
              ) : (
                <pre className="whitespace-pre-wrap font-sans text-sm text-zinc-300 leading-relaxed bg-zinc-900/50 rounded p-4 border border-zinc-800/30">
                  {reminderPreview}
                </pre>
              )}
            </div>

            {selectedCustomer && invoices.length > 0 && (
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-3">
                <h2 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                  Summary
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Customer</span>
                    <span className="text-zinc-200 font-medium">
                      {selectedCustomer.firstName} {selectedCustomer.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Overdue invoices</span>
                    <span className="text-zinc-200">{invoices.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Total overdue</span>
                    <span className="font-mono font-bold text-red-400 tabular-nums">
                      {formatCurrency(totalOverdue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Reminder level</span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${selectedLevel.badge}`}
                    >
                      {selectedLevel.label.split(' — ')[1]}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Due date</span>
                    <span className="text-zinc-200">
                      {fmtDate(dueDate + 'T12:00:00')}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
