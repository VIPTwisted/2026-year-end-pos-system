import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const card = await prisma.giftCard.findUnique({ where: { id } })
    if (!card) return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    const prevBalance = card.balance
    await prisma.$transaction([
      prisma.giftCard.update({ where: { id }, data: { balance: 0, status: 'inactive' } }),
      prisma.giftCardTx.create({
        data: { cardId: id, txType: 'void', amount: prevBalance, balanceAfter: 0, notes: 'Card voided' },
      }),
    ])
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[gc void POST]', err)
    return NextResponse.json({ error: 'Failed to void card' }, { status: 500 })
  }
}
