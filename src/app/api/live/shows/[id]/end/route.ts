import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const products = await prisma.liveShowProduct.findMany({ where: { showId: id } })
  const totalRevenue = products.reduce((sum, p) => {
    const price = p.salePrice ?? p.price
    return sum + price * p.unitsSold
  }, 0)
  const totalOrders = products.reduce((sum, p) => sum + p.unitsSold, 0)
  const show = await prisma.liveShow.update({
    where: { id },
    data: { status: 'ended', endedAt: new Date(), totalRevenue, totalOrders },
  })
  await prisma.liveShowEvent.create({
    data: { showId: id, eventType: 'show-ended', data: JSON.stringify({ endedAt: new Date(), totalRevenue, totalOrders }) },
  })
  return NextResponse.json(show)
}
