export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Plus } from 'lucide-react'

export default async function ResourcesPage() {
  const resources = await prisma.resource.findMany({
    orderBy: { name: 'asc' },
  })

  return (
    <>
      <TopBar title="Resources" />
      <main className="flex-1 p-6 overflow-auto space-y-6 bg-[#0f0f1a]">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-zinc-400" />
            <h2 className="text-lg font-semibold text-zinc-100">Resources</h2>
            <span className="text-sm text-zinc-500">({resources.length})</span>
          </div>
          <Link href="/resources/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              New Resource
            </Button>
          </Link>
        </div>

        <Card>
          <CardContent className="p-0">
            {resources.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Users className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">No resources yet.</p>
                <Link href="/resources/new">
                  <Button size="sm" className="mt-4 gap-1.5"><Plus className="w-3.5 h-3.5" /> New Resource</Button>
                </Link>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {['Resource No', 'Name', 'Type', 'Unit Cost', 'Unit Price', 'Capacity (h)', 'Status', ''].map(h => (
                      <th key={h} className={`px-4 pb-3 pt-4 text-xs font-medium text-zinc-500 uppercase tracking-wide ${h === 'Resource No' || h === 'Name' ? 'text-left' : h === '' ? 'text-right' : 'text-right'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resources.map(res => (
                    <tr key={res.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-zinc-300">{res.resourceNo}</td>
                      <td className="px-4 py-3 text-zinc-100">{res.name}</td>
                      <td className="px-4 py-3 text-right">
                        <Badge variant="secondary" className="capitalize text-xs">{res.type}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-zinc-400">{formatCurrency(Number(res.unitCost))}</td>
                      <td className="px-4 py-3 text-right text-xs text-emerald-400">{formatCurrency(Number(res.unitPrice))}</td>
                      <td className="px-4 py-3 text-right text-xs text-zinc-400">{Number(res.capacity)}</td>
                      <td className="px-4 py-3 text-right">
                        <Badge variant={res.isActive ? 'success' : 'secondary'} className="text-xs">
                          {res.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/resources/${res.id}/edit`}>
                          <Button variant="ghost" size="sm" className="text-xs h-7 px-2">Edit</Button>
                        </Link>
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
