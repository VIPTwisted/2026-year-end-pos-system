'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Users, ChevronRight, Plus } from 'lucide-react'

interface Tier { id: string; name: string; colorHex: string | null }
interface Member {
  id: string; customerName: string | null; customerEmail: string | null
  pointsBalance: number; pointsLifetime: number
  tier: Tier | null; enrolledAt: string
}

export default function LoyaltyMembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [tiers, setTiers] = useState<Tier[]>([])
  const [loading, setLoading] = useState(true)
  const [filterTier, setFilterTier] = useState('')

  useEffect(() => {
    fetch('/api/loyalty/tiers').then(r => r.json()).then(setTiers)
  }, [])

  useEffect(() => {
    setLoading(true)
    const url = filterTier ? `/api/loyalty/members?tierId=${filterTier}` : '/api/loyalty/members'
    fetch(url).then(r => r.json()).then(data => { setMembers(data); setLoading(false) })
  }, [filterTier])

  return (
    <>
      <TopBar title="Loyalty Members" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Members</h2>
            <p className="text-sm text-zinc-500">{members.length} enrolled</p>
          </div>
          <div className="flex gap-2">
            <select className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 focus:outline-none"
              value={filterTier} onChange={e => setFilterTier(e.target.value)}>
              <option value="">All Tiers</option>
              {tiers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <Link href="/loyalty/members/new"><Button><Plus className="w-4 h-4 mr-1" />Enroll Member</Button></Link>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-zinc-800 animate-pulse rounded-lg" />)}</div>
        ) : members.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <Users className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm">No members found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3 font-medium">Member</th>
                  <th className="text-left pb-3 font-medium">Tier</th>
                  <th className="text-right pb-3 font-medium">Balance</th>
                  <th className="text-right pb-3 font-medium">Lifetime</th>
                  <th className="text-left pb-3 font-medium">Enrolled</th>
                  <th className="text-center pb-3 font-medium">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {members.map(m => (
                  <tr key={m.id} className="hover:bg-zinc-900/50">
                    <td className="py-3 pr-4">
                      <p className="text-zinc-100 font-medium">{m.customerName || 'Unnamed'}</p>
                      {m.customerEmail && <p className="text-xs text-zinc-500">{m.customerEmail}</p>}
                    </td>
                    <td className="py-3 pr-4">
                      {m.tier ? (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.tier.colorHex || '#6366f1' }} />
                          <span className="text-zinc-300 text-xs">{m.tier.name}</span>
                        </div>
                      ) : <span className="text-zinc-600 text-xs">No tier</span>}
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <span className="font-semibold text-emerald-400 tabular-nums">{m.pointsBalance.toLocaleString()}</span>
                      <span className="text-xs text-zinc-500 ml-1">pts</span>
                    </td>
                    <td className="py-3 pr-4 text-right text-zinc-400 text-xs tabular-nums">{m.pointsLifetime.toLocaleString()} pts</td>
                    <td className="py-3 pr-4 text-zinc-400 text-xs">{new Date(m.enrolledAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</td>
                    <td className="py-3 text-center">
                      <Link href={`/loyalty/members/${m.id}`} className="text-blue-400 hover:text-blue-300">
                        <ChevronRight className="w-4 h-4 inline" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  )
}
