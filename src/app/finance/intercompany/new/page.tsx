'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowLeftRight } from 'lucide-react'

interface Partner { id: string; partnerCode: string; partnerName: string }

const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-colors'
const labelCls = 'block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide'

export default function NewIntercompanyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [partners, setPartners] = useState<Partner[]>([])

  const [form, setForm] = useState({
    partnerId: '',
    direction: 'sending',
    type: 'sale',
    amount: '',
    currency: 'USD',
    exchangeRate: '1',
    description: '',
    documentNo: '',
    postingDate: new Date().toISOString().slice(0, 10),
    eliminationNeeded: true,
  })

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  useEffect(() => {
    fetch('/api/intercompany/partners').then(r => r.json()).then(d => {
      setPartners(Array.isArray(d) ? d : [])
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.partnerId || !form.amount || !form.description) {
      setError('Partner, amount, and description are required')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/intercompany/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerId: form.partnerId,
          direction: form.direction,
          type: form.type,
          amount: parseFloat(form.amount),
          currency: form.currency,
          exchangeRate: parseFloat(form.exchangeRate) || 1,
          description: form.description,
          documentNo: form.documentNo || undefined,
          postingDate: form.postingDate,
          eliminationNeeded: form.eliminationNeeded,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push(`/finance/intercompany/${data.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <TopBar title="New Intercompany Transaction" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/finance/intercompany"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Intercompany
          </Link>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-zinc-400" />
                Create Intercompany Transaction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">

                <div>
                  <label className={labelCls}>Partner <span className="text-red-400">*</span></label>
                  <select value={form.partnerId} onChange={set('partnerId')} className={inputCls} required>
                    <option value="">Select partner…</option>
                    {partners.map(p => (
                      <option key={p.id} value={p.id}>{p.partnerCode} — {p.partnerName}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Direction</label>
                    <select value={form.direction} onChange={set('direction')} className={inputCls}>
                      <option value="sending">Sending (we pay / sell to them)</option>
                      <option value="receiving">Receiving (they pay / sell to us)</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Type</label>
                    <select value={form.type} onChange={set('type')} className={inputCls}>
                      <option value="sale">Sale</option>
                      <option value="purchase">Purchase</option>
                      <option value="expense">Expense</option>
                      <option value="dividend">Dividend</option>
                      <option value="loan">Loan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Description <span className="text-red-400">*</span></label>
                  <input type="text" value={form.description} onChange={set('description')} placeholder="Intercompany service charge Q1 2026…" className={inputCls} required />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Amount <span className="text-red-400">*</span></label>
                    <input type="number" min="0.01" step="0.01" value={form.amount} onChange={set('amount')} placeholder="0.00" className={inputCls} required />
                  </div>
                  <div>
                    <label className={labelCls}>Currency</label>
                    <input type="text" value={form.currency} onChange={set('currency')} placeholder="USD" maxLength={3} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Exchange Rate</label>
                    <input type="number" min="0.0001" step="any" value={form.exchangeRate} onChange={set('exchangeRate')} placeholder="1.0000" className={inputCls} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Document No.</label>
                    <input type="text" value={form.documentNo} onChange={set('documentNo')} placeholder="INV-001" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Posting Date</label>
                    <input type="date" value={form.postingDate} onChange={set('postingDate')} className={inputCls} />
                  </div>
                </div>

                <div className="flex items-center gap-3 py-1">
                  <input
                    type="checkbox"
                    id="elimNeeded"
                    checked={form.eliminationNeeded}
                    onChange={e => setForm(prev => ({ ...prev, eliminationNeeded: e.target.checked }))}
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 accent-blue-500"
                  />
                  <label htmlFor="elimNeeded" className="text-sm text-zinc-400">
                    Elimination needed for consolidation
                  </label>
                </div>

                {error && (
                  <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
                )}

                <div className="flex items-center justify-end gap-3 pt-1">
                  <Link href="/finance/intercompany">
                    <Button type="button" variant="outline" size="sm">Cancel</Button>
                  </Link>
                  <Button type="submit" size="sm" disabled={loading}>
                    {loading ? 'Creating…' : 'Create Transaction'}
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
