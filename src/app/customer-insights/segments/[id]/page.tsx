'use client'
import { useEffect, useState, use } from 'react'
import { PieChart, RefreshCw, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Member { id: string; profileId: string; addedAt: string }
interface Segment {
  id: string
  segmentName: string
  description: string | null
  segmentType: string
  queryJson: string | null
  memberCount: number
  lastRefreshedAt: string | null
  isActive: boolean
  refreshSchedule: string | null
  _count: { members: number }
  members: Member[]
}

export default function SegmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [segment, setSegment] = useState<Segment | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = () => {
    fetch(`/api/customer-insights/segments/${id}`)
      .then(r => r.json())
      .then(setSegment)
  }

  useEffect(() => { load() }, [id])

  async function refresh() {
    setRefreshing(true)
    await fetch(`/api/customer-insights/segments/${id}/refresh`, { method: 'POST' })
    setRefreshing(false)
    load()
  }

  if (!segment) return <div className="min-h-[100dvh] bg-zinc-950 flex items-center justify-center text-zinc-400">Loading...</div>

  const memberCount = segment._count?.members ?? segment.memberCount

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PieChart className="w-5 h-5 text-purple-400" />
          <h1 className="text-xl font-bold">{segment.segmentName}</h1>
          <span className={cn('text-xs px-2 py-0.5 rounded border',
            segment.segmentType === 'dynamic' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-zinc-700/50 text-zinc-400 border-zinc-600/30'
          )}>{segment.segmentType}</span>
          <span className="flex items-center gap-1 bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs px-2.5 py-0.5 rounded-full">
            <Users className="w-3 h-3" /> {memberCount.toLocaleString()} members
          </span>
        </div>
        <button onClick={refresh} disabled={refreshing} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors">
          <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Segment Info */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300">Segment Details</h2>
          <div className="space-y-3 text-sm">
            {[
              ['Description', segment.description],
              ['Type', segment.segmentType],
              ['Last Refreshed', segment.lastRefreshedAt ? new Date(segment.lastRefreshedAt).toLocaleString() : 'Never'],
              ['Refresh Schedule', segment.refreshSchedule ?? 'Manual'],
              ['Status', segment.isActive ? 'Active' : 'Inactive'],
            ].map(([label, value]) => (
              <div key={label as string} className="flex justify-between">
                <span className="text-zinc-400">{label}</span>
                <span className={cn('text-zinc-200', label === 'Status' && (segment.isActive ? 'text-emerald-400' : 'text-zinc-500'))}>{value ?? '—'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Query JSON */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-300">Segment Query</h2>
          <pre className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-xs text-zinc-300 font-mono overflow-auto max-h-48 whitespace-pre-wrap">
            {segment.queryJson
              ? (() => { try { return JSON.stringify(JSON.parse(segment.queryJson), null, 2) } catch { return segment.queryJson } })()
              : 'No query defined (static segment)'}
          </pre>
        </div>
      </div>

      {/* Member Preview */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-300">Member Preview</h2>
          <span className="text-xs text-zinc-500">Showing first {Math.min(segment.members.length, 10)} of {memberCount.toLocaleString()}</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left text-zinc-400 font-medium px-4 py-2">#</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-2">Profile ID</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-2">Added At</th>
            </tr>
          </thead>
          <tbody>
            {segment.members.length === 0 ? (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-zinc-500 text-sm">No members yet</td></tr>
            ) : segment.members.map((m, i) => (
              <tr key={m.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/20 transition-colors">
                <td className="px-4 py-2.5 text-zinc-500 font-mono text-xs">{i + 1}</td>
                <td className="px-4 py-2.5 text-zinc-300 font-mono text-xs">{m.profileId}</td>
                <td className="px-4 py-2.5 text-zinc-400 text-xs">{new Date(m.addedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
