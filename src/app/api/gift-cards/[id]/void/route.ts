import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const { reason, createdBy } = body

    const card = await prisma.giftCard.findUnique({ where: { id } })
    if (!card) return NextResponse.json({ error: 'Gift card not found' }, { status: 404 })

    if (card.status === 'void') {
      return NextResponse.json({ error: 'Card is already voided' }, { status: 400 })
    }

    const balanceBefore = card.currentBalance

    const [updatedCard, transaction] = await prisma.$transaction([
      prisma.giftCard.update({
        where: { id },
        data: { status: 'void', currentBalance: 0 },
      }),
      prisma.giftCardTransaction.create({
        data: {
          giftCardId: id,
          type: 'void',
          amount: balanceBefore,
          balanceBefore,
          balanceAfter: 0,
          notes: reason || 'Card voided',
          createdBy: createdBy || null,
        },
      }),
    ])

    return NextResponse.json({ card: updatedCard, transaction })
  } catch (err) {
    console.error('[gift-cards/[id]/void POST]', err)
    return NextResponse.json({ error: 'Failed to void gift card' }, { status: 500 })
  }
}
