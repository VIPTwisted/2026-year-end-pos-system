import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateCardNumber(): string {
  const seg = () => Math.random().toString(36).toUpperCase().slice(2, 6).padEnd(4, '0')
  return `GC-${seg()}-${seg()}-${seg()}`
}

export async function GET() {
  try {
    const cards = await prisma.giftCard.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        transactions: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    })
    return NextResponse.json(cards)
  } catch (err) {
    console.error('[gift-cards GET]', err)
    return NextResponse.json({ error: 'Failed to fetch gift cards' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      cardNumber,
      initialBalance,
      expiresAt,
      customerId,
      issuedBy,
      notes,
      currency = 'USD',
    } = body

    if (!initialBalance || initialBalance <= 0) {
      return NextResponse.json({ error: 'Initial balance must be greater than 0' }, { status: 400 })
    }

    const number = cardNumber?.trim() || generateCardNumber()

    // Ensure unique
    const existing = await prisma.giftCard.findUnique({ where: { cardNumber: number } })
    if (existing) {
      return NextResponse.json({ error: 'Card number already exists' }, { status: 409 })
    }

    const card = await prisma.giftCard.create({
      data: {
        cardNumber: number,
        initialBalance: parseFloat(initialBalance),
        currentBalance: parseFloat(initialBalance),
        currency,
        status: 'active',
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        customerId: customerId || null,
        issuedBy: issuedBy || null,
        notes: notes || null,
      },
    })

    // Record issue transaction
    await prisma.giftCardTransaction.create({
      data: {
        giftCardId: card.id,
        type: 'issue',
        amount: card.initialBalance,
        balanceBefore: 0,
        balanceAfter: card.initialBalance,
        reference: `GC-ISSUE-${card.cardNumber}`,
        notes: 'Initial issuance',
        createdBy: issuedBy || null,
      },
    })

    return NextResponse.json(card, { status: 201 })
  } catch (err) {
    console.error('[gift-cards POST]', err)
    return NextResponse.json({ error: 'Failed to create gift card' }, { status: 500 })
  }
}
