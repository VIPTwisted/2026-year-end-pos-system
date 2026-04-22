'use client'
import { useEffect, useState, use } from 'react'
import { Users, ShoppingBag, Mail, UserPlus, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Profile {
  id: string
  profileId: string
  firstName: string | null
  lastName: string | null
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  gender: string | null
  loyaltyStatus: string | null
  totalSpend: number
  transactionCount: number
  lastActivityAt: string | null
  predictedChurnScore: number | null
  predictedCLV: number | null
  segmentIds: string | null
  sourceIds: string | null
  enrichmentData: string | null
  createdAt: string
}

const MOCK_TIMELINE = [
  { icon: ShoppingBag, label: 'Recent purchase', detail: 'Order #ORD-7A2X — $124.99', time: '2 days ago', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { icon: Mail, label: 'Email opened', detail: 'Spring Sale Campaign', time: '4 days ago', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { icon: Tag, label: 'Segment joined', detail: 'VIP Repeat Buyers', time: '1 week ago', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { icon: ShoppingBag, label: 'Purchase', detail: 'Order #ORD-5C9Z — $89.00', time: '2 weeks ago', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { icon: UserPlus, label: 'Profile created', detail: 'Unified from 2 sources', time: '1 month ago', color: 'text-zinc-400', bg: 'bg-zinc-700/30' },
]

function segIds(s: string | null): string[] {
  if (!s) return []
  try { return JSON.parse(s) as string[] } catch { return s.split(',').filter(Boolean) }
}

function ChurnGauge({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score))
  const color = pct < 30 ? '#34d399' : pct < 60 ? '#fbbf24' : '#f87171'
  const rotate = -90 + (pct / 100) * 180

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-32 h-16 overflow-hidden">
        <div className="absolute inset-0 w-32 h-32 rounded-full border-8 border-zinc-700" style={{ clipPath: 'inset(0 0 50% 0)' }} />
        <div
          className="absolute inset-0 w-32 h-32 rounded-full border-8 transition-all duration-700"
          style={{
            borderColor: color,
            clipPath: 'inset(0 0 50% 0)',
            transform: `rotate(${rotate}deg)`,
            transformOrigin: '50% 100%',
            opacity: 0.9,
          }}
        />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-lg font-bold" style={{ color }}>
          {pct.toFixed(0)}%
        </div>
      </div>
      <div className="text-xs text-zinc-400">Churn Risk Score</div>
    </div>
  )
}

export default function ProfileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [tab, setTab] = useState<'overview' | 'predictions' | 'timeline'>('overview')

  useEffect(() => {
    fetch(`/api/customer-insights/profiles/${id}`)
      .then(r => r.json())
      .then(setProfile)
  }, [id])

  if (!profile) return <div className="min-h-[100dvh] bg-zinc-950 flex items-center justify-center text-zinc-400">Loading...</div>

  const name = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Unknown Profile'
  const segs = segIds(profile.segmentIds)
  const srcIds = segIds(profile.sourceIds)

  const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'predictions', label: 'Predictions' },
    { key: 'timeline', label: 'Timeline' },
  ] as const

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <Users className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{name}</h1>
          <div className="text-xs text-zinc-500">{profile.email ?? 'No email'} · ID: {profile.profileId}</div>
        </div>
        {profile.loyaltyStatus && (
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs px-2 py-0.5 rounded-full capitalize">{profile.loyaltyStatus}</span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn('px-4 py-1.5 text-sm rounded-md transition-colors', tab === t.key ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-zinc-300">Profile Details</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {[
                ['First Name', profile.firstName],
                ['Last Name', profile.lastName],
                ['Email', profile.email],
                ['Phone', profile.phone],
                ['Address', profile.address],
                ['City', profile.city],
                ['State', profile.state],
                ['Country', profile.country],
                ['Gender', profile.gender],
                ['Total Spend', profile.totalSpend != null ? `$${profile.totalSpend.toFixed(2)}` : null],
                ['Transactions', profile.transactionCount.toString()],
                ['Last Activity', profile.lastActivityAt ? new Date(profile.lastActivityAt).toLocaleDateString() : null],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <div className="text-xs text-zinc-500">{label}</div>
                  <div className="text-zinc-200">{value ?? '—'}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
              <h2 className="text-sm font-semibold text-zinc-300">Segment Membership</h2>
              {segs.length === 0 ? (
                <p className="text-xs text-zinc-500">No segments</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {segs.map((s, i) => (
                    <span key={i} className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs px-2.5 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
              <h2 className="text-sm font-semibold text-zinc-300">Source IDs</h2>
              {srcIds.length === 0 ? (
                <p className="text-xs text-zinc-500">No source IDs</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {srcIds.map((s, i) => (
                    <span key={i} className="bg-zinc-800 text-zinc-400 border border-zinc-700 text-xs px-2 py-0.5 rounded font-mono">{s}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Predictions */}
      {tab === 'predictions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center gap-4">
            {profile.predictedChurnScore != null ? (
              <ChurnGauge score={profile.predictedChurnScore} />
            ) : (
              <div className="text-zinc-500 text-sm">No churn score</div>
            )}
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-3">
            <div className="text-xs text-zinc-400">Predicted Customer Lifetime Value</div>
            <div className="text-4xl font-bold text-emerald-400 font-mono">
              {profile.predictedCLV != null ? `$${profile.predictedCLV.toFixed(0)}` : '—'}
            </div>
            <div className="text-xs text-zinc-500">12-month forward projection</div>
            <div className="pt-2 border-t border-zinc-800 text-xs text-zinc-400">
              Actual spend to date: <span className="text-zinc-200 font-mono">${profile.totalSpend.toFixed(2)}</span>
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-3">
            <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wide">Buying Pattern</div>
            <div className="space-y-2 text-sm text-zinc-300">
              <div>Avg order value: <span className="text-zinc-100 font-mono">${profile.transactionCount > 0 ? (profile.totalSpend / profile.transactionCount).toFixed(2) : '0.00'}</span></div>
              <div>Total transactions: <span className="text-zinc-100">{profile.transactionCount}</span></div>
              <div>Purchase frequency: <span className="text-zinc-100">
                {profile.transactionCount > 0 ? (profile.transactionCount >= 10 ? 'High' : profile.transactionCount >= 3 ? 'Moderate' : 'Low') : 'N/A'}
              </span></div>
              <div>Segment affinity: <span className="text-zinc-100">{segs.length > 0 ? segs[0] : 'Unclassified'}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Timeline */}
      {tab === 'timeline' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-1">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">Activity Timeline</h2>
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-zinc-800" />
            <div className="space-y-4">
              {MOCK_TIMELINE.map((entry, i) => (
                <div key={i} className="flex items-start gap-4 pl-2">
                  <div className={cn('w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 z-10', entry.bg)}>
                    <entry.icon className={cn('w-3.5 h-3.5', entry.color)} />
                  </div>
                  <div className="flex-1 min-w-0 pb-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="text-sm font-medium text-zinc-200">{entry.label}</div>
                      <div className="text-xs text-zinc-500 flex-shrink-0">{entry.time}</div>
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5">{entry.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
