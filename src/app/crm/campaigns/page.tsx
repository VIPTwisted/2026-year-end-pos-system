'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Send, Plus, Play, Pause, CheckCircle, Trash2, Copy, Pencil, Users, DollarSign } from 'lucide-react'

interface Segment { id: string; name: string; memberCount: number }
interface Campaign {
  id: string
  name: string
  campaignType: string
  status: string
  segmentId?: string
  segment?: Segment
  totalRecipients: number
  delivered: number
  opened: number
  clicked: number
  converted: number
  revenue: number
  scheduledAt?: string
  startedAt?: string
  budget: number
  spend: number
}

const STATUS_TABS = ['all', 'draft', 'scheduled', 'active', 'paused', 'completed']
const TYPE_FILTERS = ['all', 'email', 'sms', 'multi-channel', 'in-store', 'social', 'push']

const TYPE_COLORS: Record<string, string> = {
  email: 'bg-blue-500/20 text-blue-400',
  sms: 'bg-green-500/20 text-green-400',
  push: 'bg-purple-500/20 text-purple-400',
  'in-store': 'bg-orange-500/20 text-orange-400',
  social: 'bg-pink-500/20 text-pink-400',
  'multi-channel': 'bg-cyan-500/20 text-cyan-400',
}
const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-zinc-700 text-zinc-300',
  scheduled: 'bg-yellow-500/20 text-yellow-400',
  active: 'bg-green-500/20 text-green-400',
  paused: 'bg-orange-500/20 text-orange-400',
  completed: 'bg-blue-500/20 text-blue-400',
  cancelled: 'bg-red-500/20 text-red-400',
}
function pct(a: number, b: number) { return b > 0 ? ((a / b) * 100).toFixed(1) : '0.0' }

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [statusTab, setStatusTab] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    const params = new URLSearchParams()
    if (statusTab !== 'all') params.set('status', statusTab)
    if (typeFilter !== 'all') params.set('type', typeFilter)
    fetch(`/api/crm/campaigns?${params}`)
      .then(r => r.json())
      .then(d => { setCampaigns(Array.isArray(d) ? d : []); setLoading(false) })
  }, [statusTab, typeFilter])

  useEffect(() => { load() }, [load])

  async function action(id: string, endpoint: string) {
    await fetch(`/api/crm/campaigns/${id}/${endpoint}`, { method: 'POST' })
    load()
  }

  async function del(id: string) {
    if (!confirm('Delete this campaign?')) return
    await fetch(`/api/crm/campaigns/${id}`, { method: 'DELETE' })
    load()
  }

  async function duplicate(c: Campaign) {
    await fetch('/api/crm/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...c, name: `${c.name} (Copy)`, status: 'draft', id: undefined }),
    })
    load()
  }

  return (
    <div className="p-6 space-y-6 min-h-[100dvh] bg-zinc-950">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Send className="w-6 h-6 text-blue-400" /> Campaigns
          </h1>
          <p className="text-zinc-500 text-sm">{campaigns.length} total</p>
        </div>
        <Link href="/crm/campaigns/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Campaign
        </Link>
      </div>
      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit flex-wrap">
        {STATUS_TABS.map(t => (
          <button key={t} onClick={() => setStatusTab(t)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${statusTab === t ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-100'}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="flex gap-2 flex-wrap">
        {TYPE_FILTERS.map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize border ${typeFilter === t ? 'bg-zinc-700 text-zinc-100 border-zinc-600' : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}>
            {t}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="text-center text-zinc-600 py-16">Loading...</div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 text-zinc-600">No campaigns found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {campaigns.map(c => (
            <div key={c.id} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 flex flex-col gap-4 transition-all">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <Link href={`/crm/campaigns/${c.id}`} className="font-semibold text-zinc-100 hover:text-blue-400 block truncate">{c.name}</Link>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${TYPE_COLORS[c.campaignType] ?? 'bg-zinc-700 text-zinc-300'}`}>{c.campaignType}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[c.status] ?? 'bg-zinc-700 text-zinc-300'}`}>{c.status}</span>
                  </div>
                </div>
              </div>
              {c.segment && (
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Users className="w-3 h-3" />
                  <span>{c.segment.name}</span>
                  <span className="text-zinc-600">·</span>
                  <span>{c.totalRecipients.toLocaleString()} recipients</span>
                </div>
              )}
              {(c.status === 'active' || c.status === 'completed') && c.delivered > 0 && (
                <div className="grid grid-cols-4 gap-2 bg-zinc-800/50 rounded-lg p-3">
                  {[
                    { label: 'Delivered', value: `${pct(c.delivered, c.totalRecipients)}%` },
                    { label: 'Open Rate', value: `${pct(c.opened, c.delivered)}%` },
                    { label: 'Click Rate', value: `${pct(c.clicked, c.opened)}%` },
                    { label: 'Revenue', value: `$${c.revenue >= 1000 ? (c.revenue / 1000).toFixed(1) + 'k' : c.revenue}` },
                  ].map(m => (
                    <div key={m.label} className="text-center">
                      <div className="text-sm font-bold text-zinc-100">{m.value}</div>
                      <div className="text-xs text-zinc-500">{m.label}</div>
                    </div>
                  ))}
                </div>
              )}
              {c.scheduledAt && c.status === 'scheduled' && (
                <div className="text-xs text-yellow-400">Scheduled: {new Date(c.scheduledAt).toLocaleString()}</div>
              )}
              <div className="flex items-center gap-1 flex-wrap border-t border-zinc-800 pt-3 mt-auto">
                {(c.status === 'draft' || c.status === 'paused') && (
                  <button onClick={() => action(c.id, 'launch')}
                    className="flex items-center gap-1 px-2 py-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded text-xs transition-colors">
                    <Play className="w-3 h-3" /> Launch
                  </button>
                )}
                {c.status === 'active' && (
                  <button onClick={() => action(c.id, 'pause')}
                    className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded text-xs transition-colors">
                    <Pause className="w-3 h-3" /> Pause
                  </button>
                )}
                {(c.status === 'active' || c.status === 'paused') && (
                  <button onClick={() => action(c.id, 'complete')}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded text-xs transition-colors">
                    <CheckCircle className="w-3 h-3" /> Complete
                  </button>
                )}
                <Link href={`/crm/campaigns/${c.id}`}
                  className="flex items-center gap-1 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded text-xs transition-colors">
                  <Pencil className="w-3 h-3" /> Edit
                </Link>
                <button onClick={() => duplicate(c)}
                  className="flex items-center gap-1 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded text-xs transition-colors">
                  <Copy className="w-3 h-3" /> Duplicate
                </button>
                <button onClick={() => del(c.id)}
                  className="flex items-center gap-1 px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded text-xs transition-colors ml-auto">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
