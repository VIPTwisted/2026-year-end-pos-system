import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BOMActions } from './BOMActions'
import { ArrowLeft, Layers, Package } from 'lucide-react'

const STATUS_BADGE: Record<string, 'default' | 'secondary' | 'success' | 'destructive'> = {
  new: 'secondary',
  certified: 'success',
  closed: 'destructive',
}

export default async function BOMDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const bom = await prisma.productionBOM.findUnique({
    where: { id },
    include: {
      outputProduct: { select: { id: true, name: true, sku: true } },
      lines: {
        include: { component: { select: { id: true, name: true, sku: true, unit: true } } },
        orderBy: { lineNo: 'asc' },
      },
    },
  })

  if (!bom) notFound()

  return (
    <>
      <TopBar title={bom.bomNumber} />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <Link
          href="/manufacturing/boms"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Bills of Material
        </Link>

        {/* Header */}
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
                <Layers className="w-6 h-6 text-zinc-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={STATUS_BADGE[bom.status] ?? 'secondary'} className="capitalize">
                    {bom.status}
                  </Badge>
                </div>
                <h1 className="text-xl font-bold text-zinc-100 font-mono">{bom.bomNumber}</h1>
                <p className="text-sm text-zinc-400 mt-0.5">{bom.description}</p>
                <div className="flex gap-4 mt-3 text-xs text-zinc-500">
                  <span>UOM: {bom.unitOfMeasure}</span>
                  <span>{bom.lines.length} component{bom.lines.length !== 1 ? 's' : ''}</span>
                  <span>Created: {formatDate(bom.createdAt)}</span>
                </div>

                {bom.outputProduct && (
                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <Package className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-zinc-500">Output:</span>
                    <span className="text-zinc-300">{bom.outputProduct.name}</span>
                    <span className="text-zinc-600">({bom.outputProduct.sku})</span>
                  </div>
                )}
              </div>
            </div>

            {bom.status !== 'closed' && (
              <div className="mt-5 pt-5 border-t border-zinc-800">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-3">Actions</p>
                <BOMActions bomId={bom.id} status={bom.status} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Component Lines */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-zinc-400" />
              Component Lines ({bom.lines.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {bom.lines.length === 0 ? (
              <p className="px-5 py-6 text-sm text-zinc-600">No components defined.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {['#', 'Component', 'SKU', 'Quantity', 'UOM', 'Scrap %', 'Type'].map(h => (
                      <th key={h} className="text-left px-4 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bom.lines.map(line => (
                    <tr key={line.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-2.5 text-xs text-zinc-600">{line.lineNo}</td>
                      <td className="px-4 py-2.5 text-xs text-zinc-300">{line.component.name}</td>
                      <td className="px-4 py-2.5 text-xs text-zinc-500 font-mono">{line.component.sku}</td>
                      <td className="px-4 py-2.5 text-xs text-zinc-300 font-semibold">{line.quantity}</td>
                      <td className="px-4 py-2.5 text-xs text-zinc-500">{line.unitOfMeasure}</td>
                      <td className="px-4 py-2.5 text-xs text-zinc-500">
                        {line.scrapPct > 0 ? `${line.scrapPct}%` : '—'}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge variant="secondary" className="capitalize text-xs">
                          {line.type.replace('_', ' ')}
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
