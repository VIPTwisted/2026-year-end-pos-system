import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Layers, GitBranch, Package, Settings2, DollarSign } from 'lucide-react'

const STATUS_BADGE: Record<string, 'default' | 'secondary' | 'success' | 'destructive'> = {
  new: 'secondary',
  certified: 'success',
  closed: 'destructive',
}

export default async function BOMRoutingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ type?: string }>
}) {
  const { id } = await params
  const { type = 'bom' } = await searchParams

  if (type === 'bom') {
    const bom = await prisma.productionBOM.findUnique({
      where: { id },
      include: {
        outputProduct: { select: { id: true, name: true, sku: true, costPrice: true } },
        lines: {
          include: {
            component: { select: { id: true, name: true, sku: true, unit: true, costPrice: true } },
          },
          orderBy: { lineNo: 'asc' },
        },
      },
    })

    if (!bom) notFound()

    // Cost rollup: sum(component.costPrice * qty * (1 + scrap/100))
    const totalCost = bom.lines.reduce((sum, l) => {
      const unitCost = l.component.costPrice ?? 0
      const scrapFactor = 1 + (l.scrapPct / 100)
      return sum + unitCost * l.quantity * scrapFactor
    }, 0)

    return (
      <>
        <TopBar title={bom.bomNumber} />
        <main className="flex-1 p-6 overflow-auto space-y-6">

          <Link
            href="/manufacturing/bom-routing"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            BOMs &amp; Routings
          </Link>

          {/* Header card */}
          <Card>
            <CardContent className="pt-6 pb-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
                  <Layers className="w-6 h-6 text-zinc-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={STATUS_BADGE[bom.status] ?? 'secondary'} className="capitalize">{bom.status}</Badge>
                    {bom.version && (
                      <span className="text-[11px] bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full px-2 py-0.5">
                        v{bom.version}
                      </span>
                    )}
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
                {/* Cost rollup summary */}
                <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-lg p-4 min-w-[160px] text-right">
                  <div className="flex items-center gap-1.5 justify-end mb-2">
                    <DollarSign className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Cost Rollup</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-400">
                    ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-[11px] text-zinc-600 mt-0.5">incl. scrap</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Component tree — indented list */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-zinc-400" />
                Component Tree ({bom.lines.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Tree header */}
              <div className="px-4 py-2 border-b border-zinc-800/30 bg-zinc-900/30 grid grid-cols-12 gap-2">
                {['#', 'Item', 'SKU', 'Type', 'Qty', 'UOM', 'Scrap %', 'Unit Cost', 'Ext. Cost'].map((h, i) => (
                  <span key={h} className={`text-[10px] uppercase text-zinc-500 font-medium tracking-wide ${i === 1 ? 'col-span-3' : ''}`}>{h}</span>
                ))}
              </div>
              {bom.lines.length === 0 ? (
                <p className="px-5 py-6 text-sm text-zinc-600">No components defined.</p>
              ) : (
                <div className="divide-y divide-zinc-800/30">
                  {/* Parent row */}
                  <div className="px-4 py-2.5 grid grid-cols-12 gap-2 items-center bg-zinc-900/20">
                    <span className="text-[11px] text-zinc-600">0</span>
                    <span className="col-span-3 text-[13px] font-semibold text-zinc-200">
                      {bom.outputProduct?.name ?? bom.description}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500">{bom.outputProduct?.sku ?? '—'}</span>
                    <span className="text-[11px] text-zinc-500">Output</span>
                    <span className="text-[13px] font-semibold text-zinc-300">1</span>
                    <span className="text-[11px] text-zinc-500">{bom.unitOfMeasure}</span>
                    <span className="text-[11px] text-zinc-600">—</span>
                    <span className="text-[11px] text-zinc-400">
                      {bom.outputProduct?.costPrice != null
                        ? `$${bom.outputProduct.costPrice.toFixed(2)}`
                        : '—'}
                    </span>
                    <span className="text-[11px] text-emerald-400 font-semibold">
                      ${totalCost.toFixed(2)}
                    </span>
                  </div>
                  {bom.lines.map(line => {
                    const unitCost = line.component.costPrice ?? 0
                    const scrapFactor = 1 + (line.scrapPct / 100)
                    const extCost = unitCost * line.quantity * scrapFactor
                    return (
                      <div key={line.id} className="px-4 py-2.5 grid grid-cols-12 gap-2 items-center hover:bg-zinc-800/20 transition-colors">
                        <span className="text-[11px] text-zinc-600 pl-4">↳ {line.lineNo}</span>
                        <span className="col-span-3 text-[13px] text-zinc-300 pl-2">{line.component.name}</span>
                        <span className="text-[11px] font-mono text-zinc-500">{line.component.sku}</span>
                        <span>
                          <Badge variant="secondary" className="capitalize text-[10px]">
                            {line.type.replace('_', ' ')}
                          </Badge>
                        </span>
                        <span className="text-[13px] font-semibold text-zinc-300">{line.quantity}</span>
                        <span className="text-[11px] text-zinc-500">{line.unitOfMeasure}</span>
                        <span className="text-[11px] text-zinc-500">
                          {line.scrapPct > 0 ? `${line.scrapPct}%` : '—'}
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          {unitCost > 0 ? `$${unitCost.toFixed(2)}` : '—'}
                        </span>
                        <span className="text-[11px] text-zinc-300">
                          {extCost > 0 ? `$${extCost.toFixed(2)}` : '—'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick nav to routing */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-zinc-500" />
              <span className="text-[13px] text-zinc-400">View associated routing operations</span>
            </div>
            <Link href="/manufacturing/routings" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors">
              Browse Routings
            </Link>
          </div>

        </main>
      </>
    )
  }

  // Fallback: redirect to bom list
  return notFound()
}
