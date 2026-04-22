export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CheckSquare, FlaskConical } from 'lucide-react'
import { QualityActions } from './QualityActions'

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'secondary'> = {
  open: 'secondary',
  in_progress: 'default',
  passed: 'success',
  failed: 'destructive',
  closed: 'secondary',
}

const STATUS_LABEL: Record<string, string> = {
  open: 'Open', in_progress: 'In Progress', passed: 'Passed', failed: 'Failed', closed: 'Closed',
}

export default async function QualityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await prisma.qualityOrder.findUnique({
    where: { id },
    include: {
      product: { select: { id: true, name: true, sku: true } },
      measurements: true,
    },
  })
  if (!order) notFound()

  return (
    <>
      <TopBar title={order.orderNumber} />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <Link
          href="/manufacturing/quality"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Quality Orders
        </Link>

        {/* Header */}
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
                <CheckSquare className="w-6 h-6 text-zinc-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={STATUS_VARIANT[order.status] ?? 'secondary'}>
                    {STATUS_LABEL[order.status] ?? order.status}
                  </Badge>
                  {order.result && (
                    <Badge variant={order.result === 'pass' ? 'success' : 'destructive'} className="capitalize">
                      Result: {order.result}
                    </Badge>
                  )}
                </div>
                <h1 className="text-xl font-bold text-zinc-100">{order.orderNumber}</h1>
                <p className="text-sm text-zinc-400 mt-1">
                  {order.product.name} <span className="font-mono text-zinc-600">({order.product.sku})</span>
                </p>
                <div className="flex flex-wrap gap-4 mt-2 text-xs text-zinc-500">
                  <span>Qty: <span className="text-zinc-300">{order.quantity}</span></span>
                  <span>Sample: <span className="text-zinc-300">{order.sampleSize}</span></span>
                  <span>Type: <span className="text-zinc-300 capitalize">{order.testType.replace('_', '-')}</span></span>
                  <span>Source: <span className="text-zinc-300 capitalize">{order.sourceType.replace('_', ' ')}</span></span>
                  {order.assignedTo && <span>Assigned: <span className="text-zinc-300">{order.assignedTo}</span></span>}
                  {order.dueDate && <span>Due: <span className="text-zinc-300">{formatDate(order.dueDate)}</span></span>}
                  {order.completedAt && <span>Completed: <span className="text-zinc-300">{formatDate(order.completedAt)}</span></span>}
                </div>
                {order.notes && (
                  <p className="mt-2 text-xs text-zinc-500 bg-zinc-900 rounded px-3 py-2">{order.notes}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Measurements */}
        {order.measurements.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-zinc-400" />
                Test Measurements
                <span className="ml-auto text-xs font-normal text-zinc-500">{order.measurements.length} tests</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {['Test Name', 'Specification', 'Min', 'Max', 'Actual', 'Result'].map(h => (
                      <th key={h} className="text-left px-4 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {order.measurements.map(m => (
                    <tr key={m.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20">
                      <td className="px-4 py-3 text-zinc-200">{m.testName}</td>
                      <td className="px-4 py-3 text-xs text-zinc-500">{m.specification ?? '—'}</td>
                      <td className="px-4 py-3 text-xs text-zinc-400">{m.minValue ?? '—'}</td>
                      <td className="px-4 py-3 text-xs text-zinc-400">{m.maxValue ?? '—'}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-zinc-200">{m.actualValue ?? '—'}</td>
                      <td className="px-4 py-3">
                        {m.result ? (
                          <Badge variant={m.result === 'pass' ? 'success' : 'destructive'} className="capitalize text-xs">
                            {m.result}
                          </Badge>
                        ) : (
                          <span className="text-xs text-zinc-600">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <QualityActions order={order} />
      </main>
    </>
  )
}
