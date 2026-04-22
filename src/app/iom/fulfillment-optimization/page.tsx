import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { SlidersHorizontal, Plus, CheckCircle, TrendingDown, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TopBar } from '@/components/layout/TopBar'
import FulfillmentToggle from './FulfillmentToggle'

export const dynamic = 'force-dynamic'

const TYPE_COLORS: Record<string, string> = {
  cost:      'bg-emerald-900/60 text-emerald-300',
  distance:  'bg-blue-900/60 text-blue-300',
  priority:  'bg-purple-900/60 text-purple-300',
  inventory: 'bg-amber-900/60 text-amber-300',
  custom:    'bg-zinc-700 text-zinc-300',
}

export default async function FulfillmentOptimizationPage() {
  const rules = await prisma.fulfillmentRule.findMany({
    orderBy: { priority: 'asc' },
  })

  const activeRules = rules.filter(r => r.isActive).length

  const kpis = [
    { label: 'Active Rules', value: activeRules, icon: CheckCircle, color: 'text-emerald-400' },
    { label: 'Orders Optimized Today', value: 0, icon: Zap, color: 'text-blue-400' },
    { label: 'Avg Cost Savings', value: '0%', icon: TrendingDown, color: 'text-amber-400' },
  ]

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="Fulfillment Optimization"
        breadcrumb={[{ label: 'IOM', href: '/iom' }]}
        actions={
          <Link
            href="/iom/fulfillment-optimization/new"
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Rule
          </Link>
        }
      />

      <div className="p-6 space-y-5">
        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          {kpis.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4 flex items-center gap-3">
              <Icon className={cn('w-8 h-8', color)} />
              <div>
                <div className="text-2xl font-bold text-zinc-100">{value}</div>
                <div className="text-xs text-zinc-500">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Rules table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-zinc-800">
              <tr>
                {['Priority', 'Name', 'Type', 'Description', 'Conditions', 'Status', ''].map((h) => (
                  <th key={h} className="py-3 px-4 text-left text-[11px] text-zinc-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => {
                let condSummary = '—'
                try {
                  const conds = rule.conditionsJson ? JSON.parse(rule.conditionsJson) : []
                  if (Array.isArray(conds) && conds.length > 0) {
                    condSummary = `${conds.length} condition${conds.length > 1 ? 's' : ''}`
                  }
                } catch {}
                return (
                  <tr key={rule.id} className="border-b border-zinc-800/40 hover:bg-zinc-800/20 transition-colors">
                    <td className="py-2.5 px-4">
                      <span className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-300 text-[12px] font-bold flex items-center justify-center">
                        {rule.priority}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <Link href={`/iom/fulfillment-optimization/${rule.id}`} className="text-[13px] text-blue-400 hover:text-blue-300 flex items-center gap-2">
                        <SlidersHorizontal className="w-3.5 h-3.5" /> {rule.name}
                      </Link>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={cn('px-2 py-0.5 rounded text-[11px] capitalize font-medium', TYPE_COLORS[rule.ruleType] ?? 'bg-zinc-700 text-zinc-400')}>
                        {rule.ruleType}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-[13px] text-zinc-400 max-w-[200px] truncate">{rule.description ?? '—'}</td>
                    <td className="py-2.5 px-4 text-[13px] text-zinc-500">{condSummary}</td>
                    <td className="py-2.5 px-4">
                      <FulfillmentToggle ruleId={rule.id} isActive={rule.isActive} />
                    </td>
                    <td className="py-2.5 px-4">
                      <Link href={`/iom/fulfillment-optimization/${rule.id}`} className="text-[12px] text-zinc-600 hover:text-zinc-400 transition-colors">
                        Edit →
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {rules.length === 0 && (
                <tr><td colSpan={7} className="py-10 text-center text-[13px] text-zinc-600">No rules yet — add one to start optimizing</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
