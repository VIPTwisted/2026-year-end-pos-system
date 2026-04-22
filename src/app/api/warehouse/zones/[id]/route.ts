import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const zone = await prisma.warehouseZone.findUnique({
    where: { id },
    include: {
      store: { select: { id: true, name: true } },
      bins: {
        include: { _count: { select: { contents: true } } },
        orderBy: [{ rankNo: 'asc' }, { code: 'asc' }],
      },
    },
  })
  if (!zone) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(zone)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const zone = await prisma.warehouseZone.update({
    where: { id },
    data: {
      description: body.description,
      binTypeCode: body.binTypeCode,
      rankNo: body.rankNo,
    },
  })
  return NextResponse.json(zone)
}
