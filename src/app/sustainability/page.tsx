export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Wind, Zap, Leaf, BarChart3, FileText, TrendingDown } from 'lucide-react'

// TODO: Add Prisma models — EmissionEntry, CarbonCredit, ESGReport
// When schema is updated, replace mock data with real prisma queries

const mockKPIs = [
  {
    label: 'Total Emissions',
    value: '1,240',
    unit: 'tCO₂e',
    change: '-8%',
    changeDir: 'down',
    icon: Wind,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
  },
  {
    label: 'Energy Consumed',
    value: '4,820',
    unit: 'MWh',
    change: '-3%',
    changeDir: 'down',
    icon: Zap,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    label: 'Carbon Credits',
    value: '320',
    unit: 'credits',
    change: '+15',
    changeDir: 'up',
    icon: Leaf,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    label: 'ESG Score',
    value: '74',
    unit: '/ 100',
    change: '+2 pts',
    changeDir: 'up',
    icon: BarChart3,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
]

const scopeBreakdown = [
  { scope: 'Scope 1', label: 'Direct (fuel, vehicles)', value: 420, pct: 34, color: 'bg-orange-500' },
  { scope: 'Scope 2', label: 'Indirect (electricity)', value: 510, pct: 41, color: 'bg-amber-500' },
  { scope: 'Scope 3', label: 'Value chain', value: 310, pct: 25, color: 'bg-zinc-500' },
]

const quickLinks = [
  {
    label: 'Emission Entries',
    href: '/sustainability/emissions',
    icon: Wind,
    desc: 'Log & track CO₂e by scope',
    color: 'text-orange-400',
  },
  {
    label: 'Carbon Credits',
    href: '/sustainability/carbon-credits',
    icon: Leaf,
    desc: 'Credit register & retirement',
    color: 'text-emerald-400',
  },
  {
    label: 'ESG Reports',
    href: '/sustainability/esg-reporting',
    icon: FileText,
    desc: 'Environmental · Social · Governance',
    color: 'text-blue-400',
  },
]

export default function SustainabilityPage() {
  const netEmissions = 1240 - 320

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Sustainability & ESG" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {mockKPIs.map(({ label, value, unit, change, changeDir, icon: Icon, color, bg, border }) => (
            <div key={label} className={`bg-[#16213e] border ${border} rounded-lg p-5`}>
              <div className={`inline-flex w-9 h-9 ${bg} rounded-lg items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className={`text-2xl font-bold ${color}`}>
                {value}
                <span className="text-sm font-normal text-zinc-500 ml-1">{unit}</span>
              </p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wide mt-0.5">{label}</p>
              <p className={`text-[11px] mt-1.5 font-medium ${changeDir === 'down' ? 'text-emerald-400' : 'text-blue-400'}`}>
                {change} vs last period
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Scope breakdown */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="w-4 h-4 text-zinc-400" />
              <h3 className="text-sm font-semibold text-zinc-200">Emissions by Scope</h3>
              <span className="ml-auto text-[11px] text-zinc-500">1,240 tCO₂e total</span>
            </div>
            <div className="space-y-4">
              {scopeBreakdown.map(({ scope, label, value, pct, color }) => (
                <div key={scope}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <span className="text-[13px] font-medium text-zinc-300">{scope}</span>
                      <span className="text-[11px] text-zinc-600 ml-2">{label}</span>
                    </div>
                    <span className="text-[13px] font-semibold text-zinc-200">{value} t</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[10px] text-zinc-600 mt-0.5 text-right">{pct}%</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-800/50">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-zinc-500">Net emissions (after credits)</span>
                <span className="text-[13px] font-bold text-emerald-400">{netEmissions} tCO₂e</span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-zinc-200 mb-4">Modules</h3>
            <div className="space-y-2">
              {quickLinks.map(({ label, href, icon: Icon, desc, color }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors group"
                >
                  <div className="w-9 h-9 bg-zinc-800/60 rounded-lg flex items-center justify-center shrink-0">
                    <Icon className={`w-4 h-4 ${color} group-hover:scale-110 transition-transform`} />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-zinc-300 group-hover:text-zinc-100">{label}</p>
                    <p className="text-[11px] text-zinc-600">{desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Targets panel */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-zinc-200 mb-4">2026 Targets</h3>
            <div className="space-y-5">
              {[
                { label: 'Emission Reduction', current: 8, target: 15, unit: '%', color: 'bg-orange-500' },
                { label: 'Renewable Energy', current: 42, target: 60, unit: '%', color: 'bg-amber-500' },
                { label: 'Carbon Neutral Ops', current: 26, target: 100, unit: '%', color: 'bg-emerald-500' },
              ].map(({ label, current, target, unit, color }) => {
                const pct = Math.min((current / target) * 100, 100)
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[12px] text-zinc-400">{label}</span>
                      <span className="text-[12px] text-zinc-400">
                        <span className="text-zinc-200 font-semibold">{current}</span>
                        <span className="text-zinc-600"> / {target}{unit}</span>
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-5 pt-4 border-t border-zinc-800/50">
              <p className="text-[11px] text-zinc-600">
                Targets are manually configured.{' '}
                <span className="text-zinc-500">Schema: EmissionTarget model (TODO)</span>
              </p>
            </div>
          </div>

        </div>

        {/* Recent activity */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-zinc-800/30">
            <Wind className="w-4 h-4 text-zinc-400" />
            <h3 className="text-sm font-semibold text-zinc-200">Recent Emission Entries</h3>
            <Link href="/sustainability/emissions" className="ml-auto text-xs text-blue-400 hover:text-blue-300 hover:underline">
              View all
            </Link>
          </div>
          <div className="px-5 py-4">
            <p className="text-[13px] text-zinc-600">
              No emission entries yet.{' '}
              <Link href="/sustainability/emissions/new" className="text-blue-400 hover:text-blue-300 hover:underline">
                Log your first entry
              </Link>
            </p>
            {/* TODO: Replace with real data from prisma.emissionEntry once model is added */}
          </div>
        </div>

      </main>
    </div>
  )
}
