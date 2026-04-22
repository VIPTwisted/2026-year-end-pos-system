import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const channel = await prisma.eCommerceChannel.findUnique({
    where: { id },
    include: {
      _count: { select: { onlineOrders: true, ratings: true } },
    },
  })
  if (!channel) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(channel)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const allowed = ['name', 'domain', 'description', 'currency', 'language', 'isActive', 'allowGuestCheckout', 'requiresEmailVerification', 'defaultWarehouseId']
  const data = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)))
  const channel = await prisma.eCommerceChannel.update({ where: { id }, data })
  return NextResponse.json(channel)
}
