'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, RefreshCw, Download, Send, Zap, List, Users2, Loader2 } from 'lucide-react'

type Member = {
  id: string
  customerId: string | null
  addedAt: string
  customer: {
    id: string
    firstName: string
    lastName: string
    email: string | null
    loyaltyPoints: number
    totalSpent: number
    createdAt: string
  } | null
}

type Segment = {
  id: string
  name: string
  description: string | null
  segmentType: string
  criteriaJson: string | null
  memberCount: number
  lastRefreshed: string | null
  isActive: boolean
  memberships: Member[]
}

export default function SegmentDetailPage() {
  const params = useParams<{ id: string }>()
  const [segment, setSegment] = useState<Segment | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    try {
      const res = await fetch(`/api/contacts/segments/${params.id}`)
      if (!res.ok) throw new Error('Not found')
      setSegment(await res.json())
    } catch {
      setError('Failed to load segment.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [params.id])

  async function handleRefresh() {
    setRefreshing(true)
    await fetch(`/api/contacts/segments/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'refresh' }),
    })
    await load()
    setRefreshing(false)
  }

  if (loading) {
    return (
      <>
        <TopBar title="Segment" />
        <main className="flex-1 p-6 bg-[#0f0f1a] min-h-screen flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
        </main>
      </>
    )
  }

  if (error || !segment) {
    return (
      <>
        <TopBar title="Segment" />
        <main className="flex-1 p-6 bg-[#0f0f1a] min-h-screen">
          <p className="text-xs text-red-400">{error || 'Segment not found'}</p>
          <Link href="/contacts/segments" className="text-xs text-blue-400 hover:underline mt-2 block">← Back</Link>
        </main>
      </>
    )
  }

  let criteria: Array<{ field: string; operator: string; value: string }> = []
  try { if (segment.criteriaJson) criteria = JSON.parse(segment.criteriaJson) } catch { /* ignore */ }

  const members = segment.memberships.filter(m => m.customer)

  return (
    <>
      <TopBar
        title={segment.name}
        breadcrumb={[
          { label: 'Contacts', href: '/crm/contacts' },
          { label: 'Segments', href: '/contacts/segments' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              Refresh
            </Button>
            <Link href="/crm/campaigns/new">
              <Button size="sm" className="h-8 text-xs gap-1.5">
                <Send className="w-3.5 h-3.5" /> Create Campaign
              </Button>
            </Link>
          </div>
        }
      />
      <main className="flex-1 p-6 bg-[#0f0f1a] min-h-screen space-y-6">
        <Link href="/contacts/segments" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Segments
        </Link>

        {/* Header */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {segment.segmentType === 'dynamic'
                  ? <Zap className="w-4 h-4 text-violet-400" />
                  : <List className="w-4 h-4 text-zinc-400" />
                }
                <h2 className="text-base font-semibold text-zinc-100">{segment.name}</h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                  segment.segmentType === 'dynamic' ? 'bg-violet-500/10 text-violet-400' : 'bg-zinc-700 text-zinc-400'
                }`}>{segment.segmentType}</span>
              </div>
              {segment.description && <p className="text-xs text-zinc-500">{segment.description}</p>}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-zinc-100">{segment.memberCount.toLocaleString()}</p>
              <p className="text-xs text-zinc-500">members</p>
            </div>
          </div>

          {segment.lastRefreshed && (
            <p className="text-[11px] text-zinc-600 mt-3">
              Last refreshed: {new Date(segment.lastRefreshed).toLocaleString()}
            </p>
          )}

          {/* Dynamic criteria display */}
          {segment.segmentType === 'dynamic' && criteria.length > 0 && (
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <p className="text-xs text-zinc-500 mb-2 font-medium">Criteria</p>
              <div className="flex flex-wrap gap-2">
                {criteria.map((c, i) => (
                  <span key={i} className="bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded text-xs font-mono">
                    {c.field} {c.operator} {c.value}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Members table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
            <Users2 className="w-4 h-4 text-zinc-400" />
            <h3 className="text-sm font-semibold text-zinc-200">Members</h3>
            <span className="ml-auto text-xs text-zinc-500">{members.length} shown</span>
            <button className="text-xs text-zinc-500 hover:text-zinc-300 gap-1.5 flex items-center ml-2">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
          {members.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs text-zinc-600">No members in this segment yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  {['Name', 'Email', 'Loyalty Pts', 'Total Spent', 'Added'].map(h => (
                    <th key={h} className={`px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide ${h === 'Name' ? 'text-left' : 'text-right'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map(m => {
                  const c = m.customer!
                  return (
                    <tr key={m.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/customers/${c.id}`} className="text-blue-400 hover:text-blue-300">
                          {c.firstName} {c.lastName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-zinc-400">{c.email ?? '—'}</td>
                      <td className="px-4 py-3 text-right text-xs text-amber-400 font-semibold">
                        {c.loyaltyPoints.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-zinc-300">
                        ${c.totalSpent.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-zinc-500">
                        {new Date(m.addedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

      </main>
    </>
  )
}
