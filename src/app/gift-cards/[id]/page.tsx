'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ChevronLeft, RefreshCw, Ban, DollarSign, X, Check } from 'lucide-react'

interface GiftCardTx { id: string; txType: string; amount: number; balanceBefore: number; balanceAfter: number; reference: string | null; note: string | null; createdAt: string }
interface GiftCard {
  id: string; cardNumber: string; status: string; balance: number; initialAmt: number
  expiresAt: string | null; customerName: string | null; customerId: string | null
  program: { name: string; prefix: string } | null
  transactions: GiftCardTx[]
}

function statusVariant(s: string): 'success' | 'secondary' | 'destructive' | 'default' {
  switch (s) {
    case 'active': return 'success'
    case 'inactive': return 'secondary'
    case 'voided': return 'destructive'
    default: return 'default'
  }
}

function txColor(t: string) {
  switch (t) {
    case 'issue': return 'text-blue-400'
    case 'reload': return 'text-emerald-400'
    case 'redeem': return 'text-amber-400'
    case 'void': return 'text-red-400'
    default: return 'text-zinc-400'
  }
}

export default function GiftCardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [card, setCard] = useState<GiftCard | null>(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'reload' | 'redeem' | null>(null)
  const [amount, setAmount] = useState('')
  const [reference, setReference] = useState('')
  const [acting, setActing] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    const res = await fetch(`/api/gift-cards/v2/${id}`)
    if (res.ok) setCard(await res.json())
    setLoading(false)
  }
  useEffect(() => { load() }, [id])

  async function act(endpoint: string) {
    setActing(true); setError('')
    const res = await fetch(`/api/gift-cards/v2/${id}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: parseFloat(amount || '0'), reference: reference || null }),
    })
    if (!res.ok) { const d = await res.json(); setError(d.error || 'Failed') }
    else { setModal(null); setAmount(''); setReference(''); load() }
    setActing(false)
  }

  async function voidCard() {
    if (!confirm('Void this gift card? This cannot be undone.')) return
    setActing(true)
    const res = await fetch(`/api/gift-cards/v2/${id}/void`, { method: 'POST' })
    if (!res.ok) { const d = await res.json(); setError(d.error || 'Failed') }
    else load()
    setActing(false)
  }

  if (loading) {
    return (<><TopBar title="Gift Card" /><main className="flex-1 p-6"><div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-zinc-800 animate-pulse rounded-xl" />)}</div></main></>)
  }
  if (!card) {
    return (<><TopBar title="Gift Card" /><main className="flex-1 p-6 flex items-center justify-center text-zinc-500">Card not found</main></>)
  }

  const usedAmt = card.initialAmt - card.balance
  const usedPct = card.initialAmt > 0 ? (usedAmt / card.initialAmt) * 100 : 0
  const now = new Date()
  const expired = card.expiresAt ? new Date(card.expiresAt) < now : false

  return (
    <>
      <TopBar title={`Gift Card ${card.cardNumber}`} />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300">
          <ChevronLeft className="w-4 h-4" />Back
        </button>

        <Card>
          <CardContent className="pt-6 pb-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-lg font-bold text-zinc-100 tracking-widest">{card.cardNumber}</p>
                <p className="text-xs text-zinc-500 mt-1">{card.program?.name ?? 'No program'}</p>
                {card.customerName && <p className="text-sm text-zinc-400 mt-0.5">{card.customerName}</p>}
              </div>
              <div className="flex gap-2">
                <Badge variant={statusVariant(card.status)}>{card.status}</Badge>
                {expired && <Badge variant="destructive">Expired</Badge>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Initial</p>
                <p className="text-lg font-semibold text-zinc-300">${card.initialAmt.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Used</p>
                <p className="text-lg font-semibold text-amber-400">${usedAmt.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Remaining</p>
                <p className="text-2xl font-bold text-emerald-400">${card.balance.toFixed(2)}</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-zinc-500 mb-1">
                <span>Balance remaining</span>
                <span>{(100 - usedPct).toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.max(0, 100 - usedPct)}%` }} />
              </div>
            </div>

            {card.expiresAt && (
              <p className="text-xs text-zinc-500">
                Expires: <span className={expired ? 'text-red-400 font-medium' : 'text-zinc-300'}>
                  {new Date(card.expiresAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                  {expired && ' — EXPIRED'}
                </span>
              </p>
            )}

            {card.status === 'active' && (
              <div className="flex gap-2 pt-2 border-t border-zinc-800">
                <Button size="sm" onClick={() => { setModal('reload'); setError('') }}>
                  <RefreshCw className="w-4 h-4 mr-1" />Reload
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setModal('redeem'); setError('') }}>
                  <DollarSign className="w-4 h-4 mr-1" />Redeem
                </Button>
                <Button size="sm" variant="outline" onClick={voidCard} disabled={acting} className="text-red-400 border-red-400/30 hover:bg-red-400/10 ml-auto">
                  <Ban className="w-4 h-4 mr-1" />Void
                </Button>
              </div>
            )}
            {error && <p className="text-sm text-red-400">{error}</p>}
          </CardContent>
        </Card>

        <div>
          <h3 className="text-sm font-medium text-zinc-400 mb-3">Transaction History ({card.transactions.length})</h3>
          {card.transactions.length === 0 ? (
            <p className="text-sm text-zinc-600">No transactions.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-3 font-medium">Date</th>
                    <th className="text-left pb-3 font-medium">Type</th>
                    <th className="text-right pb-3 font-medium">Amount</th>
                    <th className="text-right pb-3 font-medium">Before</th>
                    <th className="text-right pb-3 font-medium">After</th>
                    <th className="text-left pb-3 font-medium">Reference</th>
                    <th className="text-left pb-3 font-medium">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {card.transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-zinc-900/50">
                      <td className="py-2.5 pr-4 text-zinc-400 text-xs">{new Date(tx.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</td>
                      <td className="py-2.5 pr-4"><span className={cn('capitalize text-xs font-semibold', txColor(tx.txType))}>{tx.txType}</span></td>
                      <td className="py-2.5 pr-4 text-right font-mono text-xs text-emerald-400">${tx.amount.toFixed(2)}</td>
                      <td className="py-2.5 pr-4 text-right font-mono text-xs text-zinc-400">${tx.balanceBefore.toFixed(2)}</td>
                      <td className="py-2.5 pr-4 text-right font-mono text-xs text-zinc-200">${tx.balanceAfter.toFixed(2)}</td>
                      <td className="py-2.5 pr-4 text-xs text-zinc-400">{tx.reference || '—'}</td>
                      <td className="py-2.5 text-xs text-zinc-500">{tx.note || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-zinc-100 capitalize">{modal} Gift Card</h3>
              <button onClick={() => setModal(null)} className="text-zinc-500 hover:text-zinc-300"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Amount *</label>
                <input type="number" min="0.01" step="0.01"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                  value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" autoFocus />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Reference</label>
                <input className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                  value={reference} onChange={e => setReference(e.target.value)} placeholder="Optional" />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={() => act(modal)} disabled={acting || !amount}>
                <Check className="w-4 h-4 mr-1" />{acting ? 'Processing…' : modal === 'reload' ? 'Reload' : 'Redeem'}
              </Button>
              <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
