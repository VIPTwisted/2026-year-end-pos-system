import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const serialNumber = searchParams.get('serialNumber')
  const customerId = searchParams.get('customerId')
  const expiring = searchParams.get('expiring') // days

  const now = new Date()

  const items = await prisma.serviceItem.findMany({
    where: {
      ...(serialNumber ? { serialNumber: { contains: serialNumber } } : {}),
      ...(customerId ? { customerId } : {}),
      ...(expiring
        ? {
            warrantyEnd: {
              gte: now,
              lte: new Date(now.getTime() + parseInt(expiring) * 24 * 60 * 60 * 1000),
            },
          }
        : {}),
    },
    include: { customer: true, product: true, contract: true },
    orderBy: { warrantyEnd: 'asc' },
  })

  const active = items.filter(i => i.warrantyEnd && i.warrantyEnd >= now)
  const expiringIn30 = active.filter(i => {
    if (!i.warrantyEnd) return false
    const days = Math.ceil((i.warrantyEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return days <= 30
  })
  const expired = items.filter(i => i.warrantyEnd && i.warrantyEnd < now)
  // Claims this month = service orders created this month for warranty items
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const ordersThisMonth = await prisma.serviceOrder.count({
    where: {
      serviceItemId: { in: items.map(i => i.id) },
      createdAt: { gte: startOfMonth },
    },
  })

  return NextResponse.json({
    items,
    kpis: {
      active: active.length,
      expiringIn30: expiringIn30.length,
      expired: expired.length,
      claimsThisMonth: ordersThisMonth,
    },
  })
}
