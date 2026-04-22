import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const cardNumber = searchParams.get('cardNumber')

    if (!cardNumber) {
      return NextResponse.json({ error: 'cardNumber query param required' }, { status: 400 })
    }

    const card = await prisma.giftCard.findUnique({
      where: { cardNumber },
      select: {
        id: true,
        cardNumber: true,
        currentBalance: true,
        currency: true,
        status: true,
        expiresAt: true,
        issuedAt: true,
      },
    })

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    const now = new Date()
    const expired = card.expiresAt ? card.expiresAt < now : false

    return NextResponse.json({ ...card, expired })
  } catch (err) {
    console.error('[gift-cards/balance GET]', err)
    return NextResponse.json({ error: 'Failed to check balance' }, { status: 500 })
  }
}
