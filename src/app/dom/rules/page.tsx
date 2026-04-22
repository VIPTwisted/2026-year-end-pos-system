export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Filter, Plus } from 'lucide-react'

const RULE_TYPE_LABELS: Record<string, string> = {
  nearest_store: 'Nearest Store',
  lowest_cost: 'Lowest Cost',
  highest_stock: 'Highest Stock',
  manual: 'Manual',
}

export default async function FulfillmentRulesPage() {
  const rules = await prisma.fulfillmentRule.findMany({
    orderBy: [{ priority: 'desc' }, { name: 'asc' }],
  })

  return (
    <>
      <TopBar title="Fulfillment Rules" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Fulfillment Rules</h2>
            <p className="text-sm text-zinc-500">{rules.length} rules configured</p>
          </div>
          <Link href="/dom/rules/new">
            <Button size="sm"><Plus className="w-4 h-4 mr-1" />Add Rule</Button>
          </Link>
        </div>

        <Card>
          <CardContent className="p-0">
            {rules.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
                <Filter className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-sm">No fulfillment rules yet</p>
                <Link href="/dom/rules/new" className="mt-3 text-xs text-blue-400 hover:underline">Create first rule</Link>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left px-5 pb-3 pt-4 font-medium">Name</th>
                    <th className="text-left pb-3 pt-4 font-medium">Type</th>
                    <th className="text-left pb-3 pt-4 font-medium">Description</th>
                    <th className="text-right pb-3 pt-4 font-medium">Priority</th>
                    <th className="text-center pb-3 pt-4 font-medium">Active</th>
                    <th className="text-right px-5 pb-3 pt-4 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {rules.map(r => (
                    <tr key={r.id} className="hover:bg-zinc-900/50">
                      <td className="px-5 py-3 font-medium text-zinc-100">{r.name}</td>
                      <td className="py-3 pr-4">
                        <Badge variant="secondary" className="text-xs">{RULE_TYPE_LABELS[r.ruleType] ?? r.ruleType}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-zinc-500 text-xs max-w-xs truncate">{r.description || '—'}</td>
                      <td className="py-3 pr-4 text-right text-zinc-300 font-mono text-sm font-bold">{r.priority}</td>
                      <td className="py-3 pr-4 text-center">
                        <Badge variant={r.isActive ? 'success' : 'secondary'} className="text-xs">
                          {r.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right text-zinc-500 text-xs">{formatDate(r.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

      </main>
    </>
  )
}
