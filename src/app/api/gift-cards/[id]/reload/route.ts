import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { amount, reference, notes, createdBy } = body

    if (!amount || parseFloat(amount) <= 0) {
      return NextResponse.json({ error: 'Reload amount must be greater than 0' }, { status: 400 })
    }

    const card = await prisma.giftCard.findUnique({ where: { id } })
    if (!card) return NextResponse.json({ error: 'Gift card not found' }, { status: 404 })

    if (card.status === 'void' || card.status === 'blocked') {
      return NextResponse.json({ error: `Cannot reload a ${card.status} card` }, { status: 400 })
    }

    const reloadAmount = parseFloat(amount)
    const balanceBefore = card.currentBalance
    const balanceAfter = balanceBefore + reloadAmount

    const [updatedCard, transaction] = await prisma.$transaction([
      prisma.giftCard.update({
        where: { id },
        data: { currentBalance: balanceAfter },
      }),
      prisma.giftCardTransaction.create({
        data: {
          giftCardId: id,
          type: 'reload',
          amount: reloadAmount,
          balanceBefore,
          balanceAfter,
          reference: reference || null,
          notes: notes || null,
          createdBy: createdBy || null,
        },
      }),
    ])

    return NextResponse.json({ card: updatedCard, transaction })
  } catch (err) {
    console.error('[gift-cards/[id]/reload POST]', err)
    return NextResponse.json({ error: 'Failed to reload gift card' }, { status: 500 })
  }
}
