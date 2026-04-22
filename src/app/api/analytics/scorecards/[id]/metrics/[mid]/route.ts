import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; mid: string }> }) {
  const { mid } = await params
  const body = await req.json()
  const metric = await prisma.kpiMetric.update({
    where: { id: mid },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.metricType !== undefined && { metricType: body.metricType }),
      ...(body.target !== undefined && { target: body.target }),
      ...(body.warning !== undefined && { warning: body.warning }),
      ...(body.critical !== undefined && { critical: body.critical }),
      ...(body.unit !== undefined && { unit: body.unit }),
      ...(body.position !== undefined && { position: body.position }),
    },
  })
  return NextResponse.json(metric)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string; mid: string }> }) {
  const { mid } = await params
  await prisma.kpiMetric.delete({ where: { id: mid } })
  return NextResponse.json({ ok: true })
}
