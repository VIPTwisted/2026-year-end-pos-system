import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const metrics = await prisma.kpiMetric.findMany({ where: { scorecardId: id }, orderBy: { position: 'asc' } })
  return NextResponse.json(metrics)
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const count = await prisma.kpiMetric.count({ where: { scorecardId: id } })
  const metric = await prisma.kpiMetric.create({
    data: {
      scorecardId: id, name: body.name, metricType: body.metricType,
      target: body.target ?? 0, warning: body.warning ?? 0, critical: body.critical ?? 0,
      unit: body.unit ?? '$', position: body.position ?? count,
    },
  })
  return NextResponse.json(metric, { status: 201 })
}
