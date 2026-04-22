'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Settings2, Plus, Star, Trash2, Edit3, Loader2 } from 'lucide-react'

interface Profile {
  id: string
  name: string
  isDefault: boolean
  maxFulfillSplits: number
  costWeight: number
  distanceWeight: number
  inventoryWeight: number
  allowPartialFill: boolean
  _count: { rules: number; fulfillmentGroups: number }
}

export default function DomProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/dom/profiles')
      setProfiles(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function deleteProfile(id: string) {
    if (!confirm('Delete this DOM profile?')) return
    setDeleting(id)
    await fetch(`/api/dom/profiles/${id}`, { method: 'DELETE' })
    setDeleting(null)
    load()
  }

  function WeightBar({ label, value, color }: { label: string; value: number; color: string }) {
    return (
      <div className="space-y-0.5">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-500">{label}</span>
          <span className="text-zinc-400">{Math.round(value * 100)}%</span>
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${color}`} style={{ width: `${value * 100}%` }} />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
            <Settings2 className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">DOM Profiles</h1>
            <p className="text-sm text-zinc-500">Configure order routing strategies</p>
          </div>
        </div>
        <Link href="/dom/profiles/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4" />New Profile
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-zinc-600">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />Loading…
        </div>
      ) : profiles.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <Settings2 className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 mb-4">No DOM profiles yet</p>
          <Link href="/dom/profiles/new" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors">
            Create First Profile
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {profiles.map((p) => (
            <div key={p.id} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 space-y-4 transition-colors">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-zinc-100">{p.name}</h3>
                  {p.isDefault && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-yellow-900/40 text-yellow-400 border border-yellow-800/40">
                      <Star className="w-2.5 h-2.5" />Default
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">Max splits: {p.maxFulfillSplits} · {p.allowPartialFill ? 'Partial OK' : 'No partial'}</p>
              </div>
              <div className="space-y-2">
                <WeightBar label="Cost" value={p.costWeight} color="bg-blue-500" />
                <WeightBar label="Distance" value={p.distanceWeight} color="bg-emerald-500" />
                <WeightBar label="Inventory" value={p.inventoryWeight} color="bg-violet-500" />
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-500">
                <span>{p._count.rules} rules</span>
                <span>·</span>
                <span>{p._count.fulfillmentGroups} groups</span>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/dom/profiles/${p.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-lg transition-colors flex-1 justify-center">
                  <Edit3 className="w-3 h-3" />Edit
                </Link>
                <button onClick={() => deleteProfile(p.id)} disabled={deleting === p.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/40 hover:bg-red-900/40 border border-red-900/40 text-red-400 text-xs rounded-lg transition-colors">
                  {deleting === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
