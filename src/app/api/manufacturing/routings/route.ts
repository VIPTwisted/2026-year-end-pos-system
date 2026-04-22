import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const routings = await prisma.routing.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { lines: true } } },
  })
  return NextResponse.json(routings)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body.description?.trim()) {
    return NextResponse.json({ error: 'description is required' }, { status: 400 })
  }
  const count = await prisma.routing.count()
  const routingNumber = `RTG-${String(count + 1).padStart(4, '0')}`

  const routing = await prisma.routing.create({
    data: {
      routingNumber,
      description: body.description.trim(),
      status: 'new',
      type: body.type || 'serial',
      lines: body.lines?.length
        ? {
            create: (body.lines as Array<{
              operationNo: string
              description: string
              workCenterId: string
              setupTime?: number
              runTime?: number
              waitTime?: number
              moveTime?: number
              lotSize?: number
              concurrent?: boolean
            }>).map(l => ({
              operationNo: l.operationNo,
              description: l.description,
              workCenterId: l.workCenterId,
              setupTime: Number(l.setupTime ?? 0),
              runTime: Number(l.runTime ?? 0),
              waitTime: Number(l.waitTime ?? 0),
              moveTime: Number(l.moveTime ?? 0),
              lotSize: Number(l.lotSize ?? 1),
              concurrent: l.concurrent ?? false,
            })),
          }
        : undefined,
    },
    include: {
      lines: { include: { workCenter: { select: { id: true, name: true, code: true } } } },
    },
  })
  return NextResponse.json(routing, { status: 201 })
}
