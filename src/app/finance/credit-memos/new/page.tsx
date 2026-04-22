'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { ArrowLeft, FileText } from 'lucide-react'
import Link from 'next/link'

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string | null
}

export default function NewCreditMemoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerSearch, setCustomerSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const [form, setForm] = useState({
    amount: '',
    reason: '',
    expiresAt: '',
  })

  useEffect(() => {
    if (customerSearch.length < 2) {
      setCustomers([])
      return
    }
    const ctrl = new AbortController()
    fetch(`/api/customers?search=${encodeURIComponent(customerSearch)}`, { signal: ctrl.signal })
      .then(r => r.json())
      .then((d: Customer[] | { items?: Customer[] }) => {
        const list = Array.isArray(d) ? d : ((d as { customers?: Customer[] }).customers ?? [])
        setCustomers(list)
        setShowDropdown(true)
      })
      .catch(() => {/* aborted */})
    return () => ctrl.abort()
  }, [customerSearch])

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  const notify = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2800)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustomer) {
      setError('Please select a customer')
      return
    }
    const amount = parseFloat(form.amount)
    if (!form.amount || isNaN(amount) || amount <= 0) {
      setError('Please enter a valid positive amount')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/finance/credit-memos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          amount,
          reason: form.reason.trim() || undefined,
          expiresAt: form.expiresAt || undefined,
        }),
      })
      const data = (await res.json()) as { id?: string; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Failed to create credit memo')
      notify('Credit memo created')
      router.push(`/finance/credit-memos/${data.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const inputCls =
    'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors'
  const labelCls =
    'block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5'

  return (
    <>
      <TopBar
        title="Issue Credit Memo"
        breadcrumb={[
          { label: 'Finance', href: '/finance' },
          { label: 'Credit Memos', href: '/finance/credit-memos' },
        ]}
        showBack
      />

      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white text-[13px] px-4 py-2.5 rounded shadow-lg">
          {toast}
        </div>
      )}

      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-xl mx-auto">
          <Link
            href="/finance/credit-memos"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Credit Memos
          </Link>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-zinc-800/60">
              <FileText className="w-4 h-4 text-zinc-400" />
              <h2 className="text-[14px] font-semibold text-zinc-100">New Credit Memo</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-5">

              {/* Customer search */}
              <div>
                <label className={labelCls}>
                  Customer <span className="text-red-400">*</span>
                </label>
                {selectedCustomer ? (
                  <div className="flex items-center justify-between bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2">
                    <div>
                      <span className="text-sm text-zinc-100">
                        {selectedCustomer.firstName} {selectedCustomer.lastName}
                      </span>
                      {selectedCustomer.email && (
                        <span className="ml-2 text-[11px] text-zinc-500">{selectedCustomer.email}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCustomer(null)
                        setCustomerSearch('')
                      }}
                      className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      value={customerSearch}
                      onChange={e => {
                        setCustomerSearch(e.target.value)
                        setShowDropdown(true)
                      }}
                      onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                      placeholder="Search by name or email…"
                      className={inputCls}
                      autoComplete="off"
                    />
                    {showDropdown && customers.length > 0 && (
                      <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-[#16213e] border border-zinc-700 rounded-lg shadow-xl overflow-hidden">
                        {customers.slice(0, 8).map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onMouseDown={() => {
                              setSelectedCustomer(c)
                              setCustomerSearch('')
                              setShowDropdown(false)
                            }}
                            className="w-full flex items-start gap-2 px-3 py-2.5 text-left hover:bg-zinc-800/60 transition-colors"
                          >
                            <div>
                              <div className="text-[13px] text-zinc-200">
                                {c.firstName} {c.lastName}
                              </div>
                              {c.email && (
                                <div className="text-[11px] text-zinc-500">{c.email}</div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {showDropdown && customerSearch.length >= 2 && customers.length === 0 && (
                      <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-[#16213e] border border-zinc-700 rounded-lg shadow-xl px-3 py-3 text-[12px] text-zinc-500">
                        No customers found
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Amount */}
              <div>
                <label className={labelCls}>
                  Amount ($) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={set('amount')}
                  placeholder="0.00"
                  className={inputCls}
                  required
                />
              </div>

              {/* Reason */}
              <div>
                <label className={labelCls}>Reason / Notes</label>
                <textarea
                  value={form.reason}
                  onChange={set('reason')}
                  placeholder="Reason for issuing this credit memo…"
                  rows={3}
                  className={inputCls + ' resize-none'}
                />
              </div>

              {/* Expires At */}
              <div>
                <label className={labelCls}>Expires At (optional)</label>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={set('expiresAt')}
                  className={inputCls}
                />
              </div>

              {error && (
                <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-1">
                <Link
                  href="/finance/credit-memos"
                  className="px-3 py-1.5 rounded border border-zinc-700 text-[12px] text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-[12px] font-medium text-white transition-colors"
                >
                  {loading ? 'Creating…' : 'Issue Credit Memo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}
