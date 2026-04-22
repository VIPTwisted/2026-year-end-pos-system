import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Settings2, GitBranch, Cpu } from 'lucide-react'

export default async function WorkCenterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const wc = await prisma.workCenter.findUnique({
    where: { id },
    include: {
      machineCenters: true,
      routingLines: {
        include: { routing: { select: { id: true, routingNumber: true, description: true, status: true } } },
        take: 20,
      },
    },
  })

  if (!wc) notFound()

  return (
    <>
      <TopBar title={wc.name} />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <Link
          href="/manufacturing/work-centers"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Work Centers
        </Link>

        {/* Header */}
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
                <Settings2 className="w-6 h-6 text-zinc-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={wc.isActive ? 'success' : 'secondary'}>
                    {wc.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <span className="font-mono text-xs text-zinc-500">{wc.code}</span>
                </div>
                <h1 className="text-xl font-bold text-zinc-100">{wc.name}</h1>
                {wc.description && <p className="text-sm text-zinc-500 mt-1">{wc.description}</p>}
                <p className="text-xs text-zinc-600 mt-2">Created: {formatDate(wc.createdAt)}</p>
              </div>
            </div>

            {/* KPI Row */}
            <div className="mt-5 pt-5 border-t border-zinc-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[
                { label: 'Capacity', value: `${wc.capacity} / ${wc.unitOfMeasure}`, color: 'text-blue-400' },
                { label: 'Cost per Hour', value: `$${wc.costPerHour.toFixed(2)}`, color: 'text-emerald-400' },
                { label: 'Efficiency', value: `${wc.efficiency}%`, color: wc.efficiency >= 90 ? 'text-emerald-400' : wc.efficiency >= 70 ? 'text-amber-400' : 'text-red-400' },
                { label: 'Routing Operations', value: wc.routingLines.length, color: 'text-violet-400' },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <p className={`text-lg font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">{label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Machine Centers */}
        {wc.machineCenters.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Cpu className="w-4 h-4 text-zinc-400" />
                Machine Centers ({wc.machineCenters.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {['Code', 'Name', 'Capacity', 'Cost/Hr', 'Active'].map(h => (
                      <th key={h} className="text-left px-4 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {wc.machineCenters.map(mc => (
                    <tr key={mc.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-2.5 text-xs font-mono text-zinc-400">{mc.code}</td>
                      <td className="px-4 py-2.5 text-xs text-zinc-300">{mc.name}</td>
                      <td className="px-4 py-2.5 text-xs text-zinc-400">{mc.capacity}</td>
                      <td className="px-4 py-2.5 text-xs text-emerald-400">${mc.costPerHour.toFixed(2)}</td>
                      <td className="px-4 py-2.5">
                        <Badge variant={mc.isActive ? 'success' : 'secondary'} className="text-xs">
                          {mc.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* Used In Routings */}
        {wc.routingLines.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-zinc-400" />
                Used In Routings ({wc.routingLines.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {['Routing', 'Description', 'Op #', 'Op Description', 'Run (h)', 'Status'].map(h => (
                      <th key={h} className="text-left px-4 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {wc.routingLines.map(line => (
                    <tr key={line.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-2.5">
                        <Link href={`/manufacturing/routings/${line.routing.id}`} className="font-mono text-xs text-blue-400 hover:underline">
                          {line.routing.routingNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-zinc-400">{line.routing.description}</td>
                      <td className="px-4 py-2.5 text-xs font-mono text-zinc-500">{line.operationNo}</td>
                      <td className="px-4 py-2.5 text-xs text-zinc-300">{line.description}</td>
                      <td className="px-4 py-2.5 text-xs text-zinc-400">{line.runTime}</td>
                      <td className="px-4 py-2.5">
                        <Badge
                          variant={line.routing.status === 'certified' ? 'success' : line.routing.status === 'closed' ? 'destructive' : 'secondary'}
                          className="capitalize text-xs"
                        >
                          {line.routing.status}
                        </Badge>
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
