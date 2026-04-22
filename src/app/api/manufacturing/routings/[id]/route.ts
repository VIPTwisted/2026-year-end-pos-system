import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const routing = await prisma.routing.findUnique({
    where: { id },
    include: {
      lines: {
        include: { workCenter: { select: { id: true, name: true, code: true, costPerHour: true } } },
        orderBy: { operationNo: 'asc' },
      },
    },
  })
  if (!routing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(routing)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const current = await prisma.routing.findUnique({ where: { id }, select: { status: true } })
  if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (body.status === 'certified' && current.status === 'closed') {
    return NextResponse.json({ error: 'Closed routings cannot be re-certified' }, { status: 400 })
  }
  const allowed = ['description', 'status', 'type']
  const data: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) data[key] = body[key]
  }
  const routing = await prisma.routing.update({ where: { id }, data })
  return NextResponse.json(routing)
}
