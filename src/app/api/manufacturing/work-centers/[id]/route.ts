import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const wc = await prisma.workCenter.findUnique({
    where: { id },
    include: {
      routingLines: { include: { routing: { select: { routingNumber: true, description: true } } } },
    },
  })
  if (!wc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(wc)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const allowed = ['name', 'description', 'capacity', 'unitOfMeasure', 'costPerHour', 'efficiency', 'isActive']
  const data: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) {
      if (['capacity', 'costPerHour', 'efficiency'].includes(key)) {
        data[key] = Number(body[key])
      } else {
        data[key] = body[key]
      }
    }
  }
  const wc = await prisma.workCenter.update({ where: { id }, data })
  return NextResponse.json(wc)
}
