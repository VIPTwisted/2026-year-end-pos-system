import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function mockCurrentValue(metricType: string): number {
  const map: Record<string, [number, number]> = {
    'revenue': [85000, 310000], 'units-sold': [800, 4500], 'avg-transaction': [48, 185],
    'conversion': [22, 68], 'basket-size': [2.1, 6.8], 'employee-productivity': [1200, 8500],
    'inventory-turns': [4.2, 18.6], 'gross-margin': [28, 62],
  }
  const [min, max] = map[metricType] ?? [0, 100]
  return parseFloat((Math.random() * (max - min) + min).toFixed(2))
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const scorecard = await prisma.kpiScorecard.findUnique({
    where: { id },
    include: { metrics: { orderBy: { position: 'asc' } } },
  })
  if (!scorecard) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const metricsWithCurrent = scorecard.metrics.map(m => ({ ...m, currentValue: mockCurrentValue(m.metricType) }))
  return NextResponse.json({ ...scorecard, metrics: metricsWithCurrent })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const scorecard = await prisma.kpiScorecard.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.isDefault !== undefined && { isDefault: body.isDefault }),
    },
    include: { metrics: { orderBy: { position: 'asc' } } },
  })
  return NextResponse.json(scorecard)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.kpiScorecard.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
