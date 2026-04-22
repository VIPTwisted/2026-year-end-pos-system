'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { RefreshCw, ArrowRight } from 'lucide-react'
import Link from 'next/link'

type RecommendationList = {
  id: string
  listName: string
  listType: string
  description: string | null
  isActive: boolean
  lastRefreshedAt: string | null
  items: { id: string }[]
}

const LIST_ICONS: Record<string, string> = {
  trending: 'TRD',
  new_arrivals: 'NEW',
  popular: 'POP',
  personalized: 'YOU',
  frequently_bought: 'FBT',
  similar: 'SIM',
}

export default function RecommendationsPage() {
  const [lists, setLists] = useState<RecommendationList[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/recommendations/lists')
      .then((r) => r.json())
      .then(setLists)
      .finally(() => setLoading(false))
  }, [])

  async function handleRefresh(id: string) {
    setRefreshing(id)
    const res = await fetch(`/api/recommendations/lists/${id}/refresh`, { method: 'POST' })
    const updated = await res.json()
    setLists((prev) => prev.map((l) => l.id === id ? { ...l, lastRefreshedAt: updated.lastRefreshedAt } : l))
    setRefreshing(null)
  }

  if (loading) return <div className="p-6 text-zinc-400">Loading...</div>

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-100">Recommendations</h1>
        <p className="text-zinc-400 text-sm mt-1">Manage product recommendation lists</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {lists.length === 0 ? (
          <div className="col-span-3 bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center text-zinc-500">No recommendation lists</div>
        ) : lists.map((list) => (
          <div key={list.id} className={cn('bg-zinc-900 border rounded-lg p-5 space-y-4', list.isActive ? 'border-zinc-800' : 'border-zinc-800/50 opacity-60')}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-400">{LIST_ICONS[list.listType] ?? list.listType.slice(0, 3).toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-100">{list.listName}</p>
                  <p className="text-xs text-zinc-500 capitalize">{list.listType.replace('_', ' ')}</p>
                </div>
              </div>
              <span className={cn('text-xs px-2 py-0.5 rounded-full', list.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500')}>
                {list.isActive ? 'Active' : 'Off'}
              </span>
            </div>

            {list.description && <p className="text-xs text-zinc-500">{list.description}</p>}

            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>{list.items.length} item{list.items.length !== 1 ? 's' : ''}</span>
              <span>{list.lastRefreshedAt ? `Refreshed ${new Date(list.lastRefreshedAt).toLocaleDateString()}` : 'Never refreshed'}</span>
            </div>

            <div className="flex gap-2 pt-1 border-t border-zinc-800">
              <Link href={`/recommendations/lists/${list.id}`}
                className="flex-1 flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs py-2 rounded-lg transition-colors">
                Manage Items <ArrowRight className="w-3 h-3" />
              </Link>
              <button onClick={() => handleRefresh(list.id)} disabled={refreshing === list.id}
                className="flex items-center justify-center gap-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs py-2 px-3 rounded-lg transition-colors disabled:opacity-50">
                <RefreshCw className={cn('w-3 h-3', refreshing === list.id && 'animate-spin')} />
                Refresh
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
