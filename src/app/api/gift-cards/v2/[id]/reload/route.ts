import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { amount, notes } = body
    if (!amount || parseFloat(amount) <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 })
    }
    const card = await prisma.giftCard.findUnique({ where: { id } })
    if (!card) return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    if (card.status !== 'active') {
      return NextResponse.json({ error: 'Card is not active' }, { status: 400 })
    }

    const reloadAmt = parseFloat(amount)
    const newBalance = card.balance + reloadAmt

    const [updated] = await prisma.$transaction([
      prisma.giftCard.update({ where: { id }, data: { balance: newBalance } }),
      prisma.giftCardTx.create({
        data: { cardId: id, txType: 'reload', amount: reloadAmt, balanceAfter: newBalance, notes: notes || null },
      }),
    ])

    return NextResponse.json(updated)
  } catch (err) {
    console.error('[gc reload POST]', err)
    return NextResponse.json({ error: 'Failed to reload card' }, { status: 500 })
  }
}
