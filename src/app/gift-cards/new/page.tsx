'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Customer { id: string; firstName: string; lastName: string; email: string }

function generateCardNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let num = 'GC-'
  for (let i = 0; i < 10; i++) {
    num += chars[Math.floor(Math.random() * chars.length)]
  }
  return num
}

export default function NewGiftCardPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    cardNumber: generateCardNumber(),
    initialValue: '',
    customerId: '',
    expiresAt: '',
  })

  useEffect(() => {
    fetch('/api/customers').then(r => r.json()).then(setCustomers).catch(() => setCustomers([]))
  }, [])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.initialValue || parseFloat(form.initialValue) <= 0) {
      setError('Initial value must be greater than 0')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/gift-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardNumber: form.cardNumber.trim(),
          initialValue: parseFloat(form.initialValue),
          customerId: form.customerId || undefined,
          expiresAt: form.expiresAt || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push(`/gift-cards/${data.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-colors'
  const labelCls = 'block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide'

  return (
    <>
      <TopBar title="Issue Gift Card" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-xl mx-auto">
          <Link
            href="/gift-cards"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Gift Cards
          </Link>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Issue New Gift Card</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Card Number */}
                <div>
                  <label className={labelCls}>Card Number <span className="text-red-400">*</span></label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.cardNumber}
                      onChange={set('cardNumber')}
                      className={inputCls + ' font-mono'}
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setForm(prev => ({ ...prev, cardNumber: generateCardNumber() }))}
                    >
                      Regenerate
                    </Button>
                  </div>
                </div>

                {/* Initial Value */}
                <div>
                  <label className={labelCls}>Initial Value ($) <span className="text-red-400">*</span></label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.initialValue}
                    onChange={set('initialValue')}
                    placeholder="e.g. 50.00"
                    className={inputCls}
                    required
                  />
                </div>

                {/* Customer (optional) */}
                <div>
                  <label className={labelCls}>Customer (optional)</label>
                  <select value={form.customerId} onChange={set('customerId')} className={inputCls}>
                    <option value="">— Guest / No customer —</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.firstName} {c.lastName} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Expiry */}
                <div>
                  <label className={labelCls}>Expiry Date (optional)</label>
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
                  <Link href="/gift-cards">
                    <Button type="button" variant="outline" size="sm">Cancel</Button>
                  </Link>
                  <Button type="submit" size="sm" disabled={loading}>
                    {loading ? 'Issuing…' : 'Issue Gift Card'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
