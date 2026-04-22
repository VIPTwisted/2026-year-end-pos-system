import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { amount, orderId, notes } = body
    if (!amount || parseFloat(amount) <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 })
    }
    const card = await prisma.giftCard.findUnique({ where: { id } })
    if (!card) return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    if (card.status !== 'active') return NextResponse.json({ error: 'Card is not active' }, { status: 400 })
    if (card.expiresAt && card.expiresAt < new Date()) return NextResponse.json({ error: 'Card has expired' }, { status: 400 })

    const redeemAmt = parseFloat(amount)
    if (redeemAmt > card.balance) {
      return NextResponse.json({ error: `Insufficient balance. Available: $${card.balance.toFixed(2)}` }, { status: 400 })
    }

    const newBalance = card.balance - redeemAmt
    const [updated] = await prisma.$transaction([
      prisma.giftCard.update({ where: { id }, data: { balance: newBalance } }),
      prisma.giftCardTx.create({
        data: { cardId: id, txType: 'redeem', amount: redeemAmt, balanceAfter: newBalance, orderId: orderId || null, notes: notes || null },
      }),
    ])

    return NextResponse.json(updated)
  } catch (err) {
    console.error('[gc redeem POST]', err)
    return NextResponse.json({ error: 'Failed to redeem card' }, { status: 500 })
  }
}
