import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const bin = await prisma.warehouseBin.findUnique({
    where: { id },
    include: {
      store: { select: { id: true, name: true } },
      zone: { select: { id: true, code: true, description: true } },
      contents: {
        include: { product: { select: { id: true, name: true, sku: true } } },
        orderBy: { lastUpdated: 'desc' },
      },
    },
  })
  if (!bin) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(bin)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const bin = await prisma.warehouseBin.update({
    where: { id },
    data: {
      description: body.description,
      binType: body.binType,
      rankNo: body.rankNo,
      maxQty: body.maxQty,
      maxVolume: body.maxVolume,
      isBlocked: body.isBlocked,
      zoneId: body.zoneId,
    },
  })
  return NextResponse.json(bin)
}
