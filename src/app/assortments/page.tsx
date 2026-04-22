import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Layers, Radio, Package, CalendarDays } from 'lucide-react'
import { AssortmentActions } from './AssortmentActions'

export const dynamic = 'force-dynamic'

function statusBadge(status: string) {
  if (status === 'active') return <Badge variant="success">Active</Badge>
  if (status === 'expired') return <Badge variant="destructive">Expired</Badge>
  return <Badge variant="secondary">Draft</Badge>
}

function formatDate(d: Date | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function AssortmentsPage() {
  const assortments = await prisma.assortment.findMany({
    include: { lines: true, channels: true },
    orderBy: { createdAt: 'desc' },
  })

  const active = assortments.filter(a => a.status === 'active')
  const totalProducts = assortments.reduce((s, a) => s + a.lines.filter(l => l.lineType === 'product').length, 0)
  const channelIds = new Set(assortments.flatMap(a => a.channels.map(c => c.channelId)))

  return (
    <>
      <TopBar title="Assortments" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Product Assortments</h2>
            <p className="text-sm text-zinc-500">Manage channel-specific product assortments</p>
          </div>
          <Link href="/assortments/new">
            <Button><Plus className="w-4 h-4 mr-1" /> New Assortment</Button>
          </Link>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-600/20 rounded-lg flex items-center justify-center">
                <Radio className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-zinc-100">{active.length}</div>
                <div className="text-xs text-zinc-500">Active Assortments</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-zinc-100">{totalProducts}</div>
                <div className="text-xs text-zinc-500">Products in Assortments</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <Layers className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-zinc-100">{channelIds.size}</div>
                <div className="text-xs text-zinc-500">Channels Covered</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {assortments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <Layers className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm mb-2">No assortments yet</p>
              <Link href="/assortments/new">
                <Button size="sm"><Plus className="w-3 h-3 mr-1" />Create First Assortment</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left px-5 py-3 font-medium">Name</th>
                    <th className="text-left px-5 py-3 font-medium">Status</th>
                    <th className="text-center px-5 py-3 font-medium">Products</th>
                    <th className="text-center px-5 py-3 font-medium">Channels</th>
                    <th className="text-left px-5 py-3 font-medium">Date Range</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {assortments.map(a => (
                    <tr key={a.id} className="hover:bg-zinc-900/50 group">
                      <td className="px-5 py-3">
                        <Link href={`/assortments/${a.id}`} className="font-medium text-zinc-100 hover:text-blue-400 transition-colors">
                          {a.name}
                        </Link>
                        {a.description && <div className="text-xs text-zinc-500 mt-0.5 truncate max-w-xs">{a.description}</div>}
                      </td>
                      <td className="px-5 py-3">{statusBadge(a.status)}</td>
                      <td className="px-5 py-3 text-center">
                        <span className="text-zinc-300 font-medium">{a.lines.length}</span>
                        <span className="text-zinc-600 text-xs ml-1">lines</span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className="text-zinc-300 font-medium">{a.channels.length}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                          <CalendarDays className="w-3.5 h-3.5 text-zinc-600" />
                          <span>{formatDate(a.startDate)}</span>
                          <span className="text-zinc-600">→</span>
                          <span>{formatDate(a.endDate)}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <AssortmentActions id={a.id} status={a.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  )
}
