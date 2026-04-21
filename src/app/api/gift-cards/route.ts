import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateCardNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let num = 'GC-'
  for (let i = 0; i < 10; i++) {
    num += chars[Math.floor(Math.random() * chars.length)]
  }
  return num
}

export async function GET() {
  try {
    const cards = await prisma.giftCard.findMany({
      include: { customer: true, transactions: { orderBy: { createdAt: 'desc' } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(cards)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch gift cards' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { initialValue, customerId, expiresAt } = body
    let { cardNumber } = body

    if (!initialValue || initialValue <= 0) {
      return NextResponse.json({ error: 'initialValue must be > 0' }, { status: 400 })
    }

    if (!cardNumber) {
      cardNumber = generateCardNumber()
    }

    // ensure uniqueness
    const existing = await prisma.giftCard.findUnique({ where: { cardNumber } })
    if (existing) {
      return NextResponse.json({ error: 'Card number already exists' }, { status: 409 })
    }

    const card = await prisma.giftCard.create({
      data: {
        cardNumber,
        initialValue: parseFloat(initialValue),
        currentBalance: parseFloat(initialValue),
        customerId: customerId || undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        transactions: {
          create: {
            type: 'ISSUE',
            amount: parseFloat(initialValue),
            balanceBefore: 0,
            balanceAfter: parseFloat(initialValue),
          },
        },
      },
      include: { customer: true, transactions: true },
    })

    return NextResponse.json(card, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create gift card' }, { status: 500 })
  }
}
