import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Headphones, Plus } from 'lucide-react'

export default async function AgentsPage() {
  const agents = await prisma.callCenterAgent.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { calls: true, orders: true } },
    },
  })

  return (
    <>
      <TopBar title="Call Center Agents" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Agents</h2>
            <p className="text-sm text-zinc-500">{agents.length} agents</p>
          </div>
          <Link href="/call-center/agents/new">
            <Button size="sm"><Plus className="w-4 h-4 mr-1" />New Agent</Button>
          </Link>
        </div>

        <Card>
          <CardContent className="p-0">
            {agents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
                <Headphones className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-sm">No agents yet</p>
                <Link href="/call-center/agents/new" className="mt-3 text-xs text-blue-400 hover:underline">Add first agent</Link>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left px-5 pb-3 pt-4 font-medium">Name</th>
                    <th className="text-left pb-3 pt-4 font-medium">Email</th>
                    <th className="text-left pb-3 pt-4 font-medium">Extension</th>
                    <th className="text-right pb-3 pt-4 font-medium">Total Calls</th>
                    <th className="text-right pb-3 pt-4 font-medium">Orders Taken</th>
                    <th className="text-center px-5 pb-3 pt-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {agents.map(a => (
                    <tr key={a.id} className="hover:bg-zinc-900/50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Headphones className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="font-medium text-zinc-100">{a.name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-zinc-400 text-xs">{a.email}</td>
                      <td className="py-3 pr-4 text-zinc-400 text-xs font-mono">{a.extension || '—'}</td>
                      <td className="py-3 pr-4 text-right text-zinc-300 font-semibold">{a._count.calls}</td>
                      <td className="py-3 pr-4 text-right text-zinc-300 font-semibold">{a._count.orders}</td>
                      <td className="px-5 py-3 text-center">
                        <Badge variant={a.isActive ? 'success' : 'secondary'} className="text-xs">
                          {a.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
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
