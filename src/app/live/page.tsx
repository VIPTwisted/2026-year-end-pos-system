'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Radio, Video, Users2, Zap, Calendar, DollarSign, TrendingUp, Eye, ShoppingBag, ChevronRight } from 'lucide-react'

interface LiveShow {
  id: string
  title: string
  hostName: string | null
  platform: string
  status: string
  scheduledAt: string | null
  startedAt: string | null
  peakViewers: number
  totalOrders: number
  totalRevenue: number
  products: { id: string }[]
}

interface Creator {
  id: string
  status: string
  commissionRate: number
}

interface CreatorPayout {
  id: string
  status: string
  netPayout: number
}

const PLATFORM_COLORS: Record<string, string> = {
  instagram: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  tiktok: 'bg-zinc-700 text-zinc-200 border-zinc-600',
  facebook: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  youtube: 'bg-red-500/20 text-red-400 border-red-500/30',
  custom: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}
function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export default function LiveHubPage() {
  const [shows, setShows] = useState<LiveShow[]>([])
  const [creators, setCreators] = useState<Creator[]>([])
  const [payouts, setPayouts] = useState<CreatorPayout[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/live/shows').then(r => r.json()),
      fetch('/api/live/creators').then(r => r.json()),
    ]).then(([showsData, creatorsData]) => {
      setShows(showsData)
      setCreators(creatorsData)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (creators.length === 0) return
    Promise.all(creators.map(c => fetch(`/api/live/creators/${c.id}/payouts`).then(r => r.json())))
      .then(results => setPayouts(results.flat()))
  }, [creators])

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const scheduled = shows.filter(s => s.status === 'scheduled')
  const liveNow = shows.filter(s => s.status === 'live')
  const monthRevenue = shows
    .filter(s => s.status === 'ended' && s.startedAt && new Date(s.startedAt) >= monthStart)
    .reduce((sum, s) => sum + s.totalRevenue, 0)
  const activeCreators = creators.filter(c => c.status === 'active').length
  const pendingPayouts = payouts.filter(p => p.status === 'pending').length

  const upcoming = shows.filter(s => s.status === 'scheduled').slice(0, 8)
  const recent = shows.filter(s => s.status === 'ended').slice(0, 6)

  const kpis = [
    { label: 'Scheduled Shows', value: scheduled.length.toString(), icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Live Now', value: liveNow.length.toString(), icon: Radio, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Revenue This Month', value: fmt(monthRevenue), icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Active Creators', value: activeCreators.toString(), icon: Users2, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Pending Payouts', value: pendingPayouts.toString(), icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ]

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="text-zinc-500 text-sm">Loading...</div></div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Live Commerce</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Creator-led live shopping · flash sales · real-time commerce</p>
        </div>
        <div className="flex gap-2">
          <Link href="/live/flash-sales" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm hover:bg-amber-500/20 transition-colors">
            <Zap className="w-4 h-4" /> Flash Sales
          </Link>
          <Link href="/live/creators" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm hover:bg-purple-500/20 transition-colors">
            <Users2 className="w-4 h-4" /> Creators
          </Link>
          <Link href="/live/shows" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors">
            <Video className="w-4 h-4" /> Shows
          </Link>
        </div>
      </div>

      {liveNow.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
            <span className="text-red-400 font-semibold text-sm">LIVE NOW</span>
            <div className="flex gap-3 ml-2">
              {liveNow.map(show => (
                <Link key={show.id} href={`/live/shows/${show.id}`}
                  className="text-zinc-100 text-sm hover:text-white underline underline-offset-2">
                  {show.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-5 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className={`${kpi.bg} border border-zinc-800 rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              <span className="text-xs text-zinc-500">{kpi.label}</span>
            </div>
            <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-100">Upcoming Shows</h2>
            <Link href="/live/shows?status=scheduled" className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <div className="p-8 text-center text-zinc-600 text-sm">No scheduled shows</div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {upcoming.map(show => (
                <Link key={show.id} href={`/live/shows/${show.id}`}
                  className="flex items-center gap-3 p-3 hover:bg-zinc-800/50 transition-colors">
                  <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <Video className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-zinc-100 truncate">{show.title}</div>
                    <div className="text-xs text-zinc-500">{show.hostName ?? 'No host'}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded border ${PLATFORM_COLORS[show.platform] ?? PLATFORM_COLORS.custom}`}>
                      {show.platform}
                    </span>
                    <span className="text-xs text-zinc-500">{fmtDate(show.scheduledAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-100">Recent Performance</h2>
            <Link href="/live/shows?status=ended" className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="p-8 text-center text-zinc-600 text-sm">No completed shows</div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {recent.map(show => (
                <Link key={show.id} href={`/live/shows/${show.id}`}
                  className="flex items-center gap-3 p-3 hover:bg-zinc-800/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-zinc-100 truncate">{show.title}</div>
                    <div className="text-xs text-zinc-500">{fmtDate(show.startedAt)}</div>
                  </div>
                  <div className="flex gap-4 text-right">
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                      <Eye className="w-3 h-3" /> {show.peakViewers.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                      <ShoppingBag className="w-3 h-3" /> {show.totalOrders}
                    </div>
                    <div className="text-sm font-semibold text-emerald-400">{fmt(show.totalRevenue)}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Link href="/live/shows" className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-blue-500/50 hover:bg-zinc-800/50 transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
              <Video className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-100 group-hover:text-white">Shows</div>
              <div className="text-xs text-zinc-500">Manage live shows</div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600 ml-auto group-hover:text-zinc-400" />
          </div>
        </Link>
        <Link href="/live/creators" className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-purple-500/50 hover:bg-zinc-800/50 transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center">
              <Users2 className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-100 group-hover:text-white">Creators</div>
              <div className="text-xs text-zinc-500">Payouts & commissions</div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600 ml-auto group-hover:text-zinc-400" />
          </div>
        </Link>
        <Link href="/live/flash-sales" className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-amber-500/50 hover:bg-zinc-800/50 transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-600/20 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-100 group-hover:text-white">Flash Sales</div>
              <div className="text-xs text-zinc-500">Time-limited drops</div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600 ml-auto group-hover:text-zinc-400" />
          </div>
        </Link>
      </div>
    </div>
  )
}
