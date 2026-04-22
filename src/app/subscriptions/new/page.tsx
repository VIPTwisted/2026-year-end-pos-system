'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, CreditCard, Search } from 'lucide-react'

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string | null
}

interface Plan {
  id: string
  name: string
  description: string | null
  price: number
  billingCycle: string
  trialDays: number
  isActive: boolean
}

const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors'
const labelCls = 'block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5'

function cycleLabel(c: string) {
  return ({ weekly: 'Weekly', monthly: 'Monthly', quarterly: 'Quarterly', annual: 'Annual' })[c] ?? c
}

export default function NewSubscriptionPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<Plan[]>([])
  const [customerSearch, setCustomerSearch] = useState('')
  const [customerResults, setCustomerResults] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [trialDaysOverride, setTrialDaysOverride] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)

  useEffect(() => {
    fetch('/api/subscriptions/plans')
      .then(r => r.json())
      .then((data: Plan[]) => setPlans(data.filter(p => p.isActive)))
      .catch(() => setPlans([]))
  }, [])

  useEffect(() => {
    const q = customerSearch.trim()
    if (q.length < 2) { setCustomerResults([]); return }
    setSearchLoading(true)
    const timeout = setTimeout(() => {
      fetch(`/api/customers?search=${encodeURIComponent(q)}&limit=8`)
        .then(r => r.json())
        .then(d => setCustomerResults(d.customers ?? d))
        .catch(() => setCustomerResults([]))
        .finally(() => setSearchLoading(false))
    }, 300)
    return () => clearTimeout(timeout)
  }, [customerSearch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustomer) { setError('Select a customer'); return }
    if (!selectedPlan) { setError('Select a subscription plan'); return }
    setLoading(true)
    setError('')
    try {
      const body: Record<string, unknown> = {
        customerId: selectedCustomer.id,
        planId: selectedPlan.id,
        startDate: new Date(startDate).toISOString(),
        notes: notes.trim() || undefined,
      }
      if (trialDaysOverride !== '') {
        body.trialDays = parseInt(trialDaysOverride) || 0
      }
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push('/subscriptions')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const effectiveTrialDays = trialDaysOverride !== ''
    ? parseInt(trialDaysOverride) || 0
    : selectedPlan?.trialDays ?? 0

  return (
    <>
      <TopBar
        title="New Subscription"
        breadcrumb={[{ label: 'Subscriptions', href: '/subscriptions' }]}
        showBack
      />

      <main className="flex-1 p-6 overflow-auto min-h-[100dvh]">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/subscriptions"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Subscriptions
          </Link>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl shadow-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-zinc-800/50 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-zinc-400" />
              <h2 className="text-sm font-semibold text-zinc-100">Create Subscription</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              {/* Customer Search */}
              <div>
                <label className={labelCls}>Customer <span className="text-red-400">*</span></label>
                {selectedCustomer ? (
                  <div className="flex items-center justify-between bg-zinc-900 border border-emerald-700/60 rounded-lg px-3 py-2.5">
                    <div>
                      <div className="text-sm font-medium text-zinc-100">
                        {selectedCustomer.firstName} {selectedCustomer.lastName}
                      </div>
                      {selectedCustomer.email && (
                        <div className="text-xs text-zinc-500">{selectedCustomer.email}</div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => { setSelectedCustomer(null); setCustomerSearch('') }}
                      className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                      <input
                        type="text"
                        value={customerSearch}
                        onChange={e => setCustomerSearch(e.target.value)}
                        placeholder="Search by name or email…"
                        className={inputCls + ' pl-9'}
                      />
                    </div>
                    {(customerResults.length > 0 || searchLoading) && (
                      <div className="absolute z-20 w-full mt-1 bg-[#16213e] border border-zinc-700 rounded-lg shadow-xl overflow-hidden">
                        {searchLoading ? (
                          <div className="px-3 py-2 text-xs text-zinc-500">Searching…</div>
                        ) : (
                          customerResults.map(c => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => { setSelectedCustomer(c); setCustomerSearch(''); setCustomerResults([]) }}
                              className="w-full text-left px-3 py-2.5 hover:bg-zinc-800/60 transition-colors border-b border-zinc-800/50 last:border-0"
                            >
                              <div className="text-sm text-zinc-100">{c.firstName} {c.lastName}</div>
                              {c.email && <div className="text-xs text-zinc-500">{c.email}</div>}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Plan Select */}
              <div>
                <label className={labelCls}>Subscription Plan <span className="text-red-400">*</span></label>
                {plans.length === 0 ? (
                  <p className="text-xs text-zinc-600">
                    No active plans.{' '}
                    <Link href="/subscriptions" className="text-blue-400 hover:underline">Create one first.</Link>
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {plans.map(plan => (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setSelectedPlan(plan)}
                        className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                          selectedPlan?.id === plan.id
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-zinc-700 bg-zinc-900 hover:border-zinc-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-zinc-100">{plan.name}</div>
                            {plan.description && <div className="text-xs text-zinc-500 mt-0.5">{plan.description}</div>}
                          </div>
                          <div className="text-right shrink-0 ml-4">
                            <div className="text-sm font-bold text-zinc-100 tabular-nums">
                              {formatCurrency(plan.price)}
                            </div>
                            <div className="text-[11px] text-zinc-500">/ {cycleLabel(plan.billingCycle).toLowerCase()}</div>
                            {plan.trialDays > 0 && (
                              <div className="text-[11px] text-blue-400">{plan.trialDays}d trial</div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Trial Days Override</label>
                  <input
                    type="number"
                    min="0"
                    value={trialDaysOverride}
                    onChange={e => setTrialDaysOverride(e.target.value)}
                    placeholder={`Plan default: ${selectedPlan?.trialDays ?? 0}`}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Preview */}
              {selectedPlan && (
                <div className="bg-zinc-900/60 rounded-lg px-4 py-3 border border-zinc-800/50 space-y-1">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Summary</div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Plan</span>
                    <span className="text-zinc-200">{selectedPlan.name}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Amount</span>
                    <span className="text-zinc-200 font-semibold tabular-nums">{formatCurrency(selectedPlan.price)} / {cycleLabel(selectedPlan.billingCycle).toLowerCase()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Status</span>
                    <span className={effectiveTrialDays > 0 ? 'text-blue-400' : 'text-emerald-400'}>
                      {effectiveTrialDays > 0 ? `Trial (${effectiveTrialDays} days)` : 'Active'}
                    </span>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className={labelCls}>Notes</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Internal notes…"
                  className={inputCls + ' resize-none'}
                />
              </div>

              {error && (
                <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
              )}

              <div className="flex items-center justify-end gap-3 pt-1 border-t border-zinc-800/50">
                <Link href="/subscriptions" className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading || !selectedCustomer || !selectedPlan}
                  className="px-4 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded transition-colors"
                >
                  {loading ? 'Creating…' : 'Create Subscription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}
