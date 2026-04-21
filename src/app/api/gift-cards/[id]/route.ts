import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const card = await prisma.giftCard.findUnique({
      where: { id },
      include: {
        customer: true,
        transactions: { orderBy: { createdAt: 'desc' } },
      },
    })
    if (!card) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(card)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch gift card' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { action, amount } = body

    const card = await prisma.giftCard.findUnique({ where: { id } })
    if (!card) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (action === 'void') {
      if (!card.isActive) return NextResponse.json({ error: 'Card already voided' }, { status: 400 })
      const updated = await prisma.giftCard.update({
        where: { id },
        data: {
          isActive: false,
          transactions: {
            create: {
              type: 'VOID',
              amount: card.currentBalance,
              balanceBefore: card.currentBalance,
              balanceAfter: 0,
            },
          },
        },
        include: { customer: true, transactions: { orderBy: { createdAt: 'desc' } } },
      })
      return NextResponse.json(updated)
    }

    if (action === 'reload') {
      if (!card.isActive) return NextResponse.json({ error: 'Cannot reload voided card' }, { status: 400 })
      if (!amount || parseFloat(amount) <= 0) {
        return NextResponse.json({ error: 'amount must be > 0' }, { status: 400 })
      }
      const reloadAmt = parseFloat(amount)
      const newBalance = card.currentBalance + reloadAmt
      const updated = await prisma.giftCard.update({
        where: { id },
        data: {
          currentBalance: newBalance,
          transactions: {
            create: {
              type: 'RELOAD',
              amount: reloadAmt,
              balanceBefore: card.currentBalance,
              balanceAfter: newBalance,
            },
          },
        },
        include: { customer: true, transactions: { orderBy: { createdAt: 'desc' } } },
      })
      return NextResponse.json(updated)
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update gift card' }, { status: 500 })
  }
}
