'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, ChevronLeft, Check, X } from 'lucide-react'

interface Tier { id: string; name: string; minPoints: number; multiplier: number; colorHex: string | null }
interface Tx { id: string; txType: string; points: number; balanceAfter: number; description: string | null; createdAt: string }
interface Member {
  id: string; customerName: string | null; customerEmail: string | null
  pointsBalance: number; pointsLifetime: number; pointsRedeemed: number
  tier: Tier | null; tierId: string | null; enrolledAt: string; lastActivityAt: string | null
  transactions: Tx[]
}

type ModalType = 'earn' | 'redeem' | null

export default function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [member, setMember] = useState<Member | null>(null)
  const [tiers, setTiers] = useState<Tier[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<ModalType>(null)
  const [pts, setPts] = useState('')
  const [desc, setDesc] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    const [mRes, tRes] = await Promise.all([fetch(`/api/loyalty/members/${id}`), fetch('/api/loyalty/tiers')])
    if (mRes.ok) setMember(await mRes.json())
    if (tRes.ok) setTiers(await tRes.json())
    setLoading(false)
  }
  useEffect(() => { load() }, [id])

  async function doTransaction() {
    if (!pts || parseInt(pts) <= 0) { setError('Enter valid points'); return }
    setSaving(true); setError('')
    const endpoint = modal === 'earn' ? 'earn' : 'redeem'
    const res = await fetch(`/api/loyalty/members/${id}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ points: parseInt(pts), description: desc || null }),
    })
    if (res.ok) { setModal(null); setPts(''); setDesc(''); load() }
    else { const d = await res.json(); setError(d.error || 'Failed') }
    setSaving(false)
  }

  if (loading) {
    return (
      <>
        <TopBar title="Member" />
        <main className="flex-1 p-6"><div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-zinc-800 animate-pulse rounded-xl" />)}</div></main>
      </>
    )
  }

  if (!member) {
    return (<><TopBar title="Member" /><main className="flex-1 p-6 flex items-center justify-center text-zinc-500">Member not found</main></>)
  }

  const sortedTiers = [...tiers].sort((a, b) => a.minPoints - b.minPoints)
  const currentTierIdx = sortedTiers.findIndex(t => t.id === member.tierId)
  const nextTier = sortedTiers[currentTierIdx + 1]
  const tierProgress = nextTier
    ? Math.min(100, ((member.pointsLifetime - (member.tier?.minPoints || 0)) / (nextTier.minPoints - (member.tier?.minPoints || 0))) * 100)
    : 100

  return (
    <>
      <TopBar title={member.customerName || 'Member'} />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300">
          <ChevronLeft className="w-4 h-4" />Back
        </button>

        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-3xl font-bold text-emerald-400 tabular-nums">{member.pointsBalance.toLocaleString()}<span className="text-lg ml-1 text-zinc-400">pts</span></p>
                <p className="text-sm text-zinc-500 mt-1">Available balance</p>
                {member.customerEmail && <p className="text-xs text-zinc-500 mt-1">{member.customerEmail}</p>}
              </div>
              <div className="text-right">
                {member.tier && (
                  <div className="flex items-center gap-2 justify-end mb-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: member.tier.colorHex || '#6366f1' }} />
                    <span className="text-sm font-medium text-zinc-200">{member.tier.name}</span>
                  </div>
                )}
                <p className="text-xs text-zinc-500">{member.pointsLifetime.toLocaleString()} lifetime pts</p>
                <p className="text-xs text-zinc-500">{member.pointsRedeemed.toLocaleString()} redeemed</p>
              </div>
            </div>
            {nextTier && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-zinc-500 mb-1">
                  <span>{member.tier?.name || 'Base'}</span>
                  <span>{nextTier.name} at {nextTier.minPoints.toLocaleString()} pts</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${tierProgress}%` }} />
                </div>
                <p className="text-xs text-zinc-500 mt-1">{(nextTier.minPoints - member.pointsLifetime).toLocaleString()} pts to {nextTier.name}</p>
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <Button size="sm" onClick={() => { setModal('earn'); setPts(''); setDesc(''); setError('') }}>
                <TrendingUp className="w-4 h-4 mr-1" />Earn Points
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setModal('redeem'); setPts(''); setDesc(''); setError('') }}>
                <TrendingDown className="w-4 h-4 mr-1" />Redeem Points
              </Button>
            </div>
          </CardContent>
        </Card>

        <div>
          <h3 className="text-sm font-medium text-zinc-400 mb-3">Recent Transactions</h3>
          {member.transactions.length === 0 ? (
            <p className="text-sm text-zinc-600">No transactions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-3 font-medium">Type</th>
                    <th className="text-right pb-3 font-medium">Points</th>
                    <th className="text-right pb-3 font-medium">Balance After</th>
                    <th className="text-left pb-3 font-medium">Description</th>
                    <th className="text-left pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {member.transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-zinc-900/50">
                      <td className="py-3 pr-4">
                        <Badge variant={tx.txType === 'earn' ? 'success' : tx.txType === 'redeem' ? 'warning' : 'secondary'}>{tx.txType}</Badge>
                      </td>
                      <td className={cn('py-3 pr-4 text-right font-mono font-semibold', tx.points > 0 ? 'text-emerald-400' : 'text-red-400')}>
                        {tx.points > 0 ? '+' : ''}{tx.points.toLocaleString()}
                      </td>
                      <td className="py-3 pr-4 text-right text-zinc-400 font-mono text-xs">{tx.balanceAfter.toLocaleString()}</td>
                      <td className="py-3 pr-4 text-zinc-400 text-xs">{tx.description || '—'}</td>
                      <td className="py-3 text-zinc-500 text-xs">{new Date(tx.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</td>
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
              <h3 className="font-semibold text-zinc-100">{modal === 'earn' ? 'Earn Points' : 'Redeem Points'}</h3>
              <button onClick={() => setModal(null)} className="text-zinc-500 hover:text-zinc-300"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Points *</label>
                <input type="number" min="1" autoFocus
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                  value={pts} onChange={e => setPts(e.target.value)} placeholder="0" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Description</label>
                <input className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                  value={desc} onChange={e => setDesc(e.target.value)} placeholder="Optional" />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={doTransaction} disabled={saving}>
                <Check className="w-4 h-4 mr-1" />{saving ? 'Processing…' : modal === 'earn' ? 'Earn' : 'Redeem'}
              </Button>
              <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
