'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Send, CreditCard } from 'lucide-react'

interface ARInvoiceActionsProps {
  invoiceId: string
  status: string
  totalAmount: number
  paidAmount: number
}

export function ARInvoiceActions({
  invoiceId,
  status,
  totalAmount,
  paidAmount,
}: ARInvoiceActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPayForm, setShowPayForm] = useState(false)
  const [payAmount, setPayAmount] = useState(
    Math.max(0, totalAmount - paidAmount).toFixed(2)
  )
  const [paymentRef, setPaymentRef] = useState('')
  const [discountTaken, setDiscountTaken] = useState('0')
  const [error, setError] = useState('')

  async function handlePost() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/ar/invoices/${invoiceId}/post`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to post invoice.')
      } else {
        router.refresh()
      }
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }

  async function handleRecordPayment(e: React.FormEvent) {
    e.preventDefault()
    if (!payAmount || parseFloat(payAmount) <= 0) {
      setError('Enter a valid payment amount.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/ar/invoices/${invoiceId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(payAmount),
          paymentRef: paymentRef.trim() || undefined,
          discountTaken: parseFloat(discountTaken) || 0,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to record payment.')
      } else {
        setShowPayForm(false)
        router.refresh()
      }
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }

  const canPost = status === 'draft'
  const canPay = ['posted', 'partial'].includes(status)

  if (!canPost && !canPay) return null

  return (
    <Card>
      <CardContent className="pt-5 pb-5 space-y-4">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">Actions</h3>

        {error && (
          <div className="rounded-lg border border-red-800 bg-red-950/40 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          {canPost && (
            <Button onClick={handlePost} disabled={loading}>
              <Send className="w-4 h-4 mr-1" />
              {loading ? 'Posting…' : 'Post Invoice'}
            </Button>
          )}
          {canPay && !showPayForm && (
            <Button onClick={() => setShowPayForm(true)} disabled={loading}>
              <CreditCard className="w-4 h-4 mr-1" />Record Payment
            </Button>
          )}
        </div>

        {showPayForm && canPay && (
          <form onSubmit={handleRecordPayment} className="border border-zinc-800 rounded-lg p-4 space-y-4 bg-zinc-900/50">
            <h4 className="text-sm font-semibold text-zinc-200">Record Payment</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">
                  Amount *
                </label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                  max={totalAmount - paidAmount}
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">
                  Payment Ref
                </label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={e => setPaymentRef(e.target.value)}
                  placeholder="Check #, ACH ref..."
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">
                  Discount Taken
                </label>
                <input
                  type="number"
                  value={discountTaken}
                  onChange={e => setDiscountTaken(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                <CreditCard className="w-4 h-4 mr-1" />
                {loading ? 'Saving…' : 'Apply Payment'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setShowPayForm(false); setError('') }}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
