import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const card = req.nextUrl.searchParams.get('card')
  if (!card?.trim()) return NextResponse.json({ error: 'card param required' }, { status: 400 })

  const lc = await prisma.loyaltyCard.findFirst({
    where: { cardNumber: card.trim() },
    include: {
      customer: { select: { id: true, firstName: true, lastName: true } },
      tier:     { select: { name: true } },
    },
  })
  if (!lc) return NextResponse.json({ error: 'Card not found' }, { status: 404 })

  return NextResponse.json({
    cardId:        lc.id,
    cardNumber:    lc.cardNumber,
    points:        lc.availablePoints,
    lifetimePoints:lc.lifetimePoints,
    tier:          lc.tier?.name ?? null,
    isActive:      lc.status === 'active',
    customerId:    lc.customerId,
    customerName:  lc.customer ? `${lc.customer.firstName} ${lc.customer.lastName}` : null,
  })
}
