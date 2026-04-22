import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sale = await prisma.flashSale.update({
    where: { id },
    data: { status: 'active', startedAt: new Date() },
  })

  if (sale.showId) {
    await prisma.liveShowEvent.create({
      data: {
        showId: sale.showId,
        eventType: 'flash-sale',
        data: JSON.stringify({
          flashSaleId: sale.id,
          name: sale.name,
          productName: sale.productName,
          salePrice: sale.salePrice,
          quantity: sale.quantity,
          duration: sale.duration,
        }),
      },
    })
  }

  return NextResponse.json(sale)
}
