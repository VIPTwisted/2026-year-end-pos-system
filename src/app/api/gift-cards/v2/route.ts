import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateCardNumber(prefix: string): string {
  const digits = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('')
  return `${prefix}${digits}`
}

export async function GET() {
  try {
    const cards = await prisma.giftCard.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        program: { select: { name: true, prefix: true } },
        transactions: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    })
    return NextResponse.json(cards)
  } catch (err) {
    console.error('[gc v2 GET]', err)
    return NextResponse.json({ error: 'Failed to fetch gift cards' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { programId, amount, customerName, customerId, expiresAt } = body
    if (!amount || parseFloat(amount) <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 })
    }

    let prefix = 'GC'
    let expiresAtDate: Date | null = expiresAt ? new Date(expiresAt) : null

    if (programId) {
      const program = await prisma.giftCardProgram.findUnique({ where: { id: programId } })
      if (program) {
        prefix = program.prefix
        if (program.expiryMonths && !expiresAt) {
          expiresAtDate = new Date()
          expiresAtDate.setMonth(expiresAtDate.getMonth() + program.expiryMonths)
        }
      }
    }

    let cardNumber = generateCardNumber(prefix)
    let attempts = 0
    while (attempts < 10) {
      const existing = await prisma.giftCard.findUnique({ where: { cardNumber } })
      if (!existing) break
      cardNumber = generateCardNumber(prefix)
      attempts++
    }

    const initialAmt = parseFloat(amount)
    const card = await prisma.giftCard.create({
      data: {
        cardNumber,
        programId: programId || null,
        balance: initialAmt,
        initialAmt,
        status: 'active',
        customerId: customerId || null,
        customerName: customerName || null,
        expiresAt: expiresAtDate,
      },
    })

    await prisma.giftCardTx.create({
      data: {
        cardId: card.id,
        txType: 'issue',
        amount: initialAmt,
        balanceAfter: initialAmt,
        notes: 'Card issued',
      },
    })

    return NextResponse.json(card, { status: 201 })
  } catch (err) {
    console.error('[gc v2 POST]', err)
    return NextResponse.json({ error: 'Failed to issue gift card' }, { status: 500 })
  }
}
