'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Gift, RefreshCw, Save } from 'lucide-react'

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string | null
}

function generateCardNumber(): string {
  const seg = () => Math.random().toString(36).toUpperCase().slice(2, 6).padEnd(4, '0').slice(0, 4)
  return `GC-${seg()}-${seg()}-${seg()}`
}

export default function NewGiftCardPage() {
  const router = useRouter()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [manualNumber, setManualNumber] = useState(false)
  const [cardNumber, setCardNumber] = useState(generateCardNumber)
  const [initialBalance, setInitialBalance] = useState('25.00')
  const [expiresAt, setExpiresAt] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [issuedBy, setIssuedBy] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/customers')
      .then(r => r.json())
      .then(data => setCustomers(Array.isArray(data) ? data : data.customers ?? []))
      .catch(() => setCustomers([]))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const balance = parseFloat(initialBalance)
    if (!balance || balance <= 0) {
      setError('Initial balance must be greater than $0.00')
      return
    }
    if (!cardNumber.trim()) {
      setError('Card number is required')
      return
    }
    setError('')
    setSaving(true)
    try {
      const res = await fetch('/api/gift-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardNumber: cardNumber.trim(),
          initialBalance: balance,
          expiresAt: expiresAt || undefined,
          customerId: customerId || undefined,
          issuedBy: issuedBy.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to issue gift card')
        setSaving(false)
        return
      }
      const card = await res.json()
      router.push(`/gift-cards/${card.id}`)
    } catch {
      setError('Network error. Please try again.')
      setSaving(false)
    }
  }

  const QUICK_AMOUNTS = [10, 25, 50, 100, 150, 200]

  return (
    <>
      <TopBar title="Issue Gift Card" />
      <main className="flex-1 p-6 overflow-auto space-y-6 max-w-2xl">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Issue New Gift Card</h2>
            <p className="text-sm text-zinc-500">Fill in the details below to create a gift card</p>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-800 bg-red-950/40 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Card Number */}
          <Card>
            <CardContent className="pt-5 pb-5 space-y-4">
              <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide flex items-center gap-2">
                <Gift className="w-4 h-4" />Card Number
              </h3>

              <div className="flex items-center gap-3 mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="numberMode"
                    checked={!manualNumber}
                    onChange={() => {
                      setManualNumber(false)
                      setCardNumber(generateCardNumber())
                    }}
                    className="accent-blue-500"
                  />
                  <span className="text-sm text-zinc-300">Auto-generate</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="numberMode"
                    checked={manualNumber}
                    onChange={() => setManualNumber(true)}
                    className="accent-blue-500"
                  />
                  <span className="text-sm text-zinc-300">Enter manually</span>
                </label>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                  readOnly={!manualNumber}
                  placeholder="GC-XXXX-XXXX-XXXX"
                  className="flex-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-3 py-2 font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                />
                {!manualNumber && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCardNumber(generateCardNumber())}
                    title="Regenerate"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Balance */}
          <Card>
            <CardContent className="pt-5 pb-5 space-y-4">
              <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">Initial Balance</h3>

              {/* Quick select */}
              <div className="flex flex-wrap gap-2">
                {QUICK_AMOUNTS.map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setInitialBalance(amt.toFixed(2))}
                    className={`px-3 py-1.5 rounded text-xs font-semibold border transition-colors ${
                      initialBalance === amt.toFixed(2)
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">
                  Custom Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                  <input
                    type="number"
                    value={initialBalance}
                    onChange={e => setInitialBalance(e.target.value)}
                    min="0.01"
                    step="0.01"
                    required
                    className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm pl-7 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Optional Details */}
          <Card>
            <CardContent className="pt-5 pb-5 space-y-4">
              <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">Optional Details</h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Expiry */}
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={e => setExpiresAt(e.target.value)}
                    min={new Date().toISOString().slice(0, 10)}
                    className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <p className="text-xs text-zinc-600 mt-1">Leave blank for no expiry</p>
                </div>

                {/* Issued By */}
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">
                    Issued By
                  </label>
                  <input
                    type="text"
                    value={issuedBy}
                    onChange={e => setIssuedBy(e.target.value)}
                    placeholder="Staff name or ID"
                    className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Customer Link */}
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">
                  Link to Customer (optional)
                </label>
                <select
                  value={customerId}
                  onChange={e => setCustomerId(e.target.value)}
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">— No customer link —</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName}{c.email ? ` (${c.email})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Optional internal notes..."
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3 pb-4">
            <Button type="button" variant="outline" onClick={() => router.push('/gift-cards')} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              <Save className="w-4 h-4 mr-1" />
              {saving ? 'Issuing…' : 'Issue Gift Card'}
            </Button>
          </div>

        </form>
      </main>
    </>
  )
}
