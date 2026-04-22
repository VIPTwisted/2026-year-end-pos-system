'use client'
import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Play, Pause, CheckCircle, Copy, DollarSign, Users, Mail, MousePointer, TrendingUp, BarChart3 } from 'lucide-react'

interface Campaign {
  id: string; name: string; campaignType: string; status: string
  segmentId?: string; segment?: { id: string; name: string; memberCount: number }
  subject?: string; bodyTemplate?: string; previewText?: string
  scheduledAt?: string; startedAt?: string; completedAt?: string
  totalRecipients: number; delivered: number; opened: number; clicked: number
  converted: number; unsubscribed: number; revenue: number; budget: number; spend: number
  utmSource?: string; utmMedium?: string; utmCampaign?: string; createdAt: string
}

const TYPE_COLORS: Record<string, string> = { email: 'bg-blue-500/20 text-blue-400', sms: 'bg-green-500/20 text-green-400', push: 'bg-purple-500/20 text-purple-400', 'in-store': 'bg-orange-500/20 text-orange-400', social: 'bg-pink-500/20 text-pink-400', 'multi-channel': 'bg-cyan-500/20 text-cyan-400' }
const STATUS_COLORS: Record<string, string> = { draft: 'bg-zinc-700 text-zinc-300', scheduled: 'bg-yellow-500/20 text-yellow-400', active: 'bg-green-500/20 text-green-400', paused: 'bg-orange-500/20 text-orange-400', completed: 'bg-blue-500/20 text-blue-400', cancelled: 'bg-red-500/20 text-red-400' }
function pct(a: number, b: number) { return b > 0 ? ((a / b) * 100).toFixed(1) : '0.0' }
function fmtMoney(n: number) { return n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toFixed(0)}` }

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)

  function load() { fetch(`/api/crm/campaigns/${id}`).then(r => r.json()).then(d => { setCampaign(d); setLoading(false) }) }
  useEffect(() => { load() }, [id])

  async function action(endpoint: string) { await fetch(`/api/crm/campaigns/${id}/${endpoint}`, { method: 'POST' }); load() }

  async function duplicate() {
    if (!campaign) return
    const { id: _id, createdAt: _ca, segment: _seg, ...rest } = campaign as Campaign & { updatedAt: string }
    const res = await fetch('/api/crm/campaigns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...rest, name: `${campaign.name} (Copy)`, status: 'draft' }) })
    const dup = await res.json()
    router.push(`/crm/campaigns/${dup.id}`)
  }

  if (loading) return <div className="p-6 text-zinc-600">Loading...</div>
  if (!campaign) return <div className="p-6 text-red-400">Campaign not found</div>

  const showMetrics = (campaign.status === 'active' || campaign.status === 'completed') && campaign.delivered > 0
  const kpis = [
    { label: 'Recipients', value: campaign.totalRecipients.toLocaleString(), icon: Users, color: 'text-zinc-400' },
    { label: 'Delivered', value: campaign.delivered.toLocaleString(), icon: Mail, color: 'text-blue-400' },
    { label: 'Open Rate', value: `${pct(campaign.opened, campaign.delivered)}%`, icon: Mail, color: 'text-green-400' },
    { label: 'Click Rate', value: `${pct(campaign.clicked, campaign.opened)}%`, icon: MousePointer, color: 'text-yellow-400' },
    { label: 'Conversions', value: campaign.converted.toLocaleString(), icon: TrendingUp, color: 'text-purple-400' },
    { label: 'Revenue', value: fmtMoney(campaign.revenue), icon: DollarSign, color: 'text-emerald-400' },
  ]
  const funnelStages = [
    { label: 'Sent', value: campaign.totalRecipients, color: 'bg-zinc-600' },
    { label: 'Delivered', value: campaign.delivered, color: 'bg-blue-600' },
    { label: 'Opened', value: campaign.opened, color: 'bg-green-600' },
    { label: 'Clicked', value: campaign.clicked, color: 'bg-yellow-600' },
    { label: 'Converted', value: campaign.converted, color: 'bg-purple-600' },
  ]

  return (
    <div className="p-6 space-y-6 min-h-[100dvh] bg-zinc-950 max-w-5xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <button onClick={() => router.back()} className="flex items-center gap-1 text-zinc-500 hover:text-zinc-300 text-sm mb-3"><ChevronLeft className="w-4 h-4" /> Back</button>
          <h1 className="text-2xl font-bold text-zinc-100">{campaign.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${TYPE_COLORS[campaign.campaignType] ?? 'bg-zinc-700 text-zinc-300'}`}>{campaign.campaignType}</span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[campaign.status] ?? 'bg-zinc-700 text-zinc-300'}`}>{campaign.status}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(campaign.status === 'draft' || campaign.status === 'paused') && (
            <button onClick={() => action('launch')} className="flex items-center gap-2 px-3 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/30 rounded-lg text-sm transition-colors"><Play className="w-4 h-4" /> Launch</button>
          )}
          {campaign.status === 'active' && (
            <button onClick={() => action('pause')} className="flex items-center gap-2 px-3 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 rounded-lg text-sm transition-colors"><Pause className="w-4 h-4" /> Pause</button>
          )}
          {(campaign.status === 'active' || campaign.status === 'paused') && (
            <button onClick={() => action('complete')} className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-lg text-sm transition-colors"><CheckCircle className="w-4 h-4" /> Complete</button>
          )}
          <button onClick={duplicate} className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg text-sm transition-colors"><Copy className="w-4 h-4" /> Duplicate</button>
        </div>
      </div>
      {showMetrics && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {kpis.map(k => (
              <div key={k.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-center gap-1 mb-1"><k.icon className={`w-3 h-3 ${k.color}`} /><span className="text-xs text-zinc-500">{k.label}</span></div>
                <div className="text-xl font-bold text-zinc-100">{k.value}</div>
              </div>
            ))}
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2 mb-5"><BarChart3 className="w-4 h-4 text-blue-400" /> Conversion Funnel</h2>
            <div className="space-y-3">
              {funnelStages.map((s, i) => {
                const w = campaign.totalRecipients > 0 ? Math.max(5, (s.value / campaign.totalRecipients) * 100) : 0
                return (
                  <div key={s.label} className="flex items-center gap-4">
                    <div className="w-20 text-xs text-zinc-500 text-right">{s.label}</div>
                    <div className="flex-1 bg-zinc-800 rounded-full h-7 relative overflow-hidden">
                      <div className={`h-full ${s.color} rounded-full transition-all`} style={{ width: `${w}%` }} />
                      <div className="absolute inset-0 flex items-center px-3 text-xs font-medium text-white">{s.value.toLocaleString()} ({pct(s.value, campaign.totalRecipients)}%)</div>
                    </div>
                    {i > 0 && <div className="w-16 text-xs text-zinc-500">{pct(s.value, funnelStages[i - 1].value)}% of prev</div>}
                  </div>
                )
              })}
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-zinc-100 mb-4 flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-400" /> Budget vs Spend</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-zinc-400">Budget</span><span className="text-zinc-100 font-medium">{fmtMoney(campaign.budget)}</span></div>
              <div className="w-full bg-zinc-800 rounded-full h-3">
                <div className="bg-emerald-600 h-3 rounded-full transition-all" style={{ width: `${campaign.budget > 0 ? Math.min(100, (campaign.spend / campaign.budget) * 100) : 0}%` }} />
              </div>
              <div className="flex justify-between text-sm"><span className="text-zinc-400">Spent</span><span className="text-emerald-400 font-medium">{fmtMoney(campaign.spend)}</span></div>
            </div>
          </div>
        </>
      )}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-zinc-100 mb-4">Campaign Settings</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            { label: 'Segment', value: campaign.segment?.name ?? '—' },
            { label: 'Recipients', value: campaign.totalRecipients.toLocaleString() },
            { label: 'Subject', value: campaign.subject ?? '—' },
            { label: 'UTM Source', value: campaign.utmSource ?? '—' },
            { label: 'UTM Medium', value: campaign.utmMedium ?? '—' },
            { label: 'UTM Campaign', value: campaign.utmCampaign ?? '—' },
          ].map(f => (
            <div key={f.label}>
              <div className="text-xs text-zinc-500 mb-0.5">{f.label}</div>
              <div className="text-zinc-200">{f.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
