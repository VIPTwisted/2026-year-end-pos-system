'use client'
import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Tag, Plus, RefreshCw, ChevronRight } from 'lucide-react'

interface PriceGroup {
  id: string
  code: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: string
  _count: { discounts: number }
}

export default function PricingPage() {
  const [groups, setGroups] = useState<PriceGroup[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/commerce/pricing?view=groups')
      const data = await res.json()
      setGroups(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <>
      <TopBar title="Price Groups" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Price Groups</h1>
            <p className="text-sm text-zinc-500">{groups.length} price group(s) configured</p>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link href="/commerce/pricing/rules"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-colors">
              Pricing Rules
            </Link>
            <Link href="/commerce/pricing/new"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> New Price Group
            </Link>
          </div>
        </div>

        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-16 text-zinc-600">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading…
            </CardContent>
          </Card>
        ) : groups.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-600">
              <Tag className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm">No price groups yet.</p>
              <Link href="/commerce/pricing/new" className="text-xs text-indigo-400 hover:text-indigo-300 mt-2">
                Create your first price group
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="px-0 py-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-6 py-3">Code</th>
                    <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-4 py-3">Name</th>
                    <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-4 py-3">Description</th>
                    <th className="text-center text-xs text-zinc-500 uppercase tracking-wide px-4 py-3">Discounts</th>
                    <th className="text-center text-xs text-zinc-500 uppercase tracking-wide px-4 py-3">Status</th>
                    <th className="text-right px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {groups.map(g => (
                    <tr key={g.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-6 py-3">
                        <span className="font-mono text-xs bg-zinc-800 text-indigo-300 px-2 py-0.5 rounded">{g.code}</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-zinc-200">{g.name}</td>
                      <td className="px-4 py-3 text-zinc-500 text-xs">{g.description ?? '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-bold text-zinc-300">{g._count.discounts}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded border ${
                          g.isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-zinc-700/30 text-zinc-500 border-zinc-700/40'
                        }`}>
                          {g.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <ChevronRight className="w-4 h-4 text-zinc-600 ml-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  )
}
