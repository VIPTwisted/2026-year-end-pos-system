import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search')
  const tier = searchParams.get('tier')
  const assignedAssociate = searchParams.get('assignedAssociate')
  const lapsed = searchParams.get('lapsed') === 'true'

  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  const customers = await prisma.customerProfile.findMany({
    where: {
      ...(search
        ? {
            OR: [
              { customerName: { contains: search } },
              { email: { contains: search } },
            ],
          }
        : {}),
      ...(tier ? { tier } : {}),
      ...(assignedAssociate ? { assignedAssociate } : {}),
      ...(lapsed ? { lastPurchaseDate: { lt: ninetyDaysAgo } } : {}),
    },
    orderBy: { updatedAt: 'desc' },
    take: 100,
  })
  return NextResponse.json(customers)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const customer = await prisma.customerProfile.create({
    data: {
      customerId: body.customerId || null,
      customerName: body.customerName,
      email: body.email || null,
      phone: body.phone || null,
      preferredStore: body.preferredStore || null,
      assignedAssociate: body.assignedAssociate || null,
      tier: body.tier || 'standard',
      lifetimeValue: body.lifetimeValue || 0,
      totalOrders: body.totalOrders || 0,
      avgOrderValue: body.avgOrderValue || 0,
      lastPurchaseDate: body.lastPurchaseDate ? new Date(body.lastPurchaseDate) : null,
      birthday: body.birthday ? new Date(body.birthday) : null,
      anniversary: body.anniversary ? new Date(body.anniversary) : null,
      preferences: body.preferences ? JSON.stringify(body.preferences) : '{}',
      notes: body.notes || null,
      doNotContact: body.doNotContact || false,
    },
  })
  return NextResponse.json(customer, { status: 201 })
}
