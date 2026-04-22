import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params

  let tracking = await prisma.itemTracking.findUnique({
    where: { productId },
    include: {
      product: { select: { id: true, name: true, sku: true } },
      lotNos: { orderBy: { createdAt: 'desc' } },
      serialNos: { orderBy: { createdAt: 'desc' } },
    },
  })

  // Auto-create if not exists
  if (!tracking) {
    tracking = await prisma.itemTracking.create({
      data: { productId, trackingMethod: 'none' },
      include: {
        product: { select: { id: true, name: true, sku: true } },
        lotNos: { orderBy: { createdAt: 'desc' } },
        serialNos: { orderBy: { createdAt: 'desc' } },
      },
    })
  }

  return NextResponse.json(tracking)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params
  const body = await req.json()

  const tracking = await prisma.itemTracking.upsert({
    where: { productId },
    create: { productId, trackingMethod: body.trackingMethod ?? 'none' },
    update: { trackingMethod: body.trackingMethod },
  })
  return NextResponse.json(tracking)
}
