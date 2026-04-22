import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function RoutingPage() {
  const rules = await prisma.routingRule.findMany({ orderBy: [{ priority: 'desc' }, { name: 'asc' }] })

  return (
    <>
      <TopBar title="Routing Rules" />
    <div className="p-6 space-y-5 min-h-[100dvh] bg-[#0f0f1a] text-zinc-100">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Routing Rules</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Unified routing engine — evaluated in priority order</p>
        </div>
        <Link
          href="/contact-center/routing/new"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Add Rule
        </Link>
      </div>

      <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Name</th>
              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Channel</th>
              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Priority</th>
              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Conditions</th>
              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Action</th>
              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Target</th>
              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Active</th>
            </tr>
          </thead>
          <tbody>
            {rules.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-zinc-600">No routing rules defined</td></tr>
            )}
            {rules.map(rule => {
              const cond = rule.conditions as Record<string, string>
              const condSummary = Object.entries(cond).map(([k, v]) => `${k}=${v}`).join(', ') || '(always)'
              return (
                <tr key={rule.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-zinc-200">{rule.name}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded text-xs">{rule.channelType}</span>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 tabular-nums">{rule.priority}</td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{condSummary}</td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-0.5 rounded text-xs font-medium', rule.action === 'assign_agent' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400')}>
                      {rule.action.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{rule.targetQueue ?? rule.targetAgent ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-0.5 rounded text-xs font-medium', rule.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700/20 text-zinc-500')}>
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
    </>
  )
}
