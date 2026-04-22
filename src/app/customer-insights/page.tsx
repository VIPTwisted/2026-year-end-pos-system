import Link from 'next/link'
import { Database, Users, PieChart, BarChart3, Brain, Zap, Download, ShieldCheck, Bot, ArrowRight, TrendingUp, Activity } from 'lucide-react'

async function getDashboard() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/customer-insights/dashboard`, { cache: 'no-store' })
    if (!res.ok) return { totalProfiles: 0, activeSegments: 0, activeMeasures: 0, dataSourcesConnected: 0, modelsActive: 0 }
    return res.json()
  } catch {
    return { totalProfiles: 0, activeSegments: 0, activeMeasures: 0, dataSourcesConnected: 0, modelsActive: 0 }
  }
}

const MODULES = [
  { href: '/customer-insights/sources', icon: Database, label: 'Data Sources', desc: 'Connect & sync data', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { href: '/customer-insights/profiles', icon: Users, label: 'Profiles', desc: 'Unified customer view', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { href: '/customer-insights/segments', icon: PieChart, label: 'Segments', desc: 'Audience grouping', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  { href: '/customer-insights/measures', icon: BarChart3, label: 'Measures', desc: 'KPI & metrics', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  { href: '/customer-insights/predictions', icon: Brain, label: 'Predictions', desc: 'AI/ML models', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
  { href: '/customer-insights/enrichments', icon: Zap, label: 'Enrichments', desc: 'Augment profiles', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
  { href: '/customer-insights/exports', icon: Download, label: 'Exports', desc: 'Push to destinations', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  { href: '/customer-insights/governance', icon: ShieldCheck, label: 'Governance', desc: 'Privacy & compliance', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  { href: '/customer-insights/copilot', icon: Bot, label: 'AI Copilot', desc: 'Natural language insights', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
]

export default async function CustomerInsightsPage() {
  const stats = await getDashboard()

  const KPI_CARDS = [
    { label: 'Unified Profiles', value: stats.totalProfiles.toLocaleString(), icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Active Segments', value: stats.activeSegments.toLocaleString(), icon: PieChart, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Active Measures', value: stats.activeMeasures.toLocaleString(), icon: BarChart3, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Data Sources', value: stats.dataSourcesConnected.toLocaleString(), icon: Database, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Active Models', value: stats.modelsActive.toLocaleString(), icon: Brain, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  ]

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Activity className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl font-bold tracking-tight">Customer Insights</h1>
          <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">D365 CDP</span>
        </div>
        <p className="text-zinc-400 text-sm">Unified customer data platform — unify, enrich, segment, and activate your customer data</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {KPI_CARDS.map(card => (
          <div key={card.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
            <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div>
              <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
              <div className="text-zinc-400 text-xs mt-0.5">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline Visualization */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-zinc-300 mb-6 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          Data Pipeline
        </h2>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[
            { label: 'Data Sources', sublabel: 'Ingest & sync', color: 'bg-blue-500/20 border-blue-500/40 text-blue-300', dot: 'bg-blue-400' },
            { label: 'Unification', sublabel: 'Identity resolution', color: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300', dot: 'bg-emerald-400' },
            { label: 'Enrichment', sublabel: 'Augment & score', color: 'bg-purple-500/20 border-purple-500/40 text-purple-300', dot: 'bg-purple-400' },
            { label: 'Segmentation', sublabel: 'Audience building', color: 'bg-amber-500/20 border-amber-500/40 text-amber-300', dot: 'bg-amber-400' },
            { label: 'Activation', sublabel: 'Export & act', color: 'bg-pink-500/20 border-pink-500/40 text-pink-300', dot: 'bg-pink-400' },
          ].map((stage, i, arr) => (
            <div key={stage.label} className="flex items-center gap-2 flex-shrink-0">
              <div className={`border rounded-lg px-4 py-3 min-w-[120px] ${stage.color}`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${stage.dot}`} />
                  <span className="text-xs font-semibold">{stage.label}</span>
                </div>
                <span className="text-xs opacity-70">{stage.sublabel}</span>
              </div>
              {i < arr.length - 1 && (
                <ArrowRight className="w-4 h-4 text-zinc-600 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Module Grid */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-300 mb-4">Modules</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {MODULES.map(mod => (
            <Link
              key={mod.href}
              href={mod.href}
              className={`border rounded-xl p-4 flex flex-col gap-3 hover:brightness-110 transition-all group ${mod.bg}`}
            >
              <mod.icon className={`w-6 h-6 ${mod.color}`} />
              <div>
                <div className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors">{mod.label}</div>
                <div className="text-xs text-zinc-400 mt-0.5">{mod.desc}</div>
              </div>
              <ArrowRight className={`w-4 h-4 ${mod.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
