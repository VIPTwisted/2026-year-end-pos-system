import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const TYPE_COLORS: Record<string, string> = {
  cost:      'bg-emerald-900/60 text-emerald-300',
  distance:  'bg-blue-900/60 text-blue-300',
  priority:  'bg-purple-900/60 text-purple-300',
  inventory: 'bg-amber-900/60 text-amber-300',
  custom:    'bg-zinc-700 text-zinc-300',
}

export default async function FulfillmentRuleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const rule = await prisma.fulfillmentRule.findUnique({ where: { id } })
  if (!rule) notFound()

  let conditions: Array<{ field: string; operator: string; value: string }> = []
  try { conditions = rule.conditionsJson ? JSON.parse(rule.conditionsJson) : [] } catch {}

  let actions: Array<{ action: string; value: string }> = []
  try { actions = rule.actionsJson ? JSON.parse(rule.actionsJson) : [] } catch {}

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title={rule.name}
        breadcrumb={[
          { label: 'IOM', href: '/iom' },
          { label: 'Fulfillment Optimization', href: '/iom/fulfillment-optimization' },
        ]}
        actions={
          <Link
            href="/iom/fulfillment-optimization"
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm rounded-lg transition-colors"
          >
            Back to Rules
          </Link>
        }
      />

      <div className="p-6 max-w-3xl space-y-5">
        {/* Header card */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-3">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-semibold text-zinc-100">{rule.name}</h2>
            <span className={cn('px-2 py-0.5 rounded text-[11px] capitalize font-medium ml-2', TYPE_COLORS[rule.ruleType] ?? 'bg-zinc-700 text-zinc-300')}>
              {rule.ruleType}
            </span>
            <span className={cn('px-2 py-0.5 rounded text-[11px] font-medium ml-auto', rule.isActive ? 'bg-emerald-900/60 text-emerald-300' : 'bg-zinc-700 text-zinc-400')}>
              {rule.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          {rule.description && <p className="text-sm text-zinc-400">{rule.description}</p>}
          <div className="flex gap-6 text-xs text-zinc-500">
            <span>Priority: <span className="text-zinc-300">#{rule.priority}</span></span>
            <span>Created: <span className="text-zinc-300">{new Date(rule.createdAt).toLocaleDateString()}</span></span>
            <span>Updated: <span className="text-zinc-300">{new Date(rule.updatedAt).toLocaleDateString()}</span></span>
          </div>
        </div>

        {/* Conditions */}
        {conditions.length > 0 && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-zinc-300 mb-3">Conditions (When)</h3>
            <div className="space-y-2">
              {conditions.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className={cn('text-[11px] font-semibold uppercase w-8', i === 0 ? 'text-zinc-500' : 'text-amber-500')}>
                    {i === 0 ? 'IF' : 'AND'}
                  </span>
                  <span className="bg-zinc-800 px-2 py-0.5 rounded text-zinc-300 text-[12px]">{c.field.replace(/_/g, ' ')}</span>
                  <span className="text-zinc-500 text-[12px]">{c.operator.replace(/_/g, ' ')}</span>
                  <span className="bg-zinc-800 px-2 py-0.5 rounded text-zinc-300 text-[12px]">{c.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {actions.length > 0 && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-zinc-300 mb-3">Actions (Then)</h3>
            <div className="space-y-2">
              {actions.map((a, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-[11px] font-semibold uppercase text-blue-400 w-10">THEN</span>
                  <span className="bg-zinc-800 px-2 py-0.5 rounded text-zinc-300 text-[12px]">{a.action.replace(/_/g, ' ')}</span>
                  {a.value && (
                    <>
                      <span className="text-zinc-600 text-[12px]">→</span>
                      <span className="bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 text-[12px]">{a.value}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
