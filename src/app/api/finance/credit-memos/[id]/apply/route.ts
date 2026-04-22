import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = (await req.json()) as { orderId: string; amount: number }
    const { orderId, amount } = body

    if (!orderId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'orderId and a positive amount are required' },
        { status: 400 }
      )
    }

    const memo = await prisma.creditMemo.findUnique({ where: { id } })
    if (!memo) {
      return NextResponse.json({ error: 'Credit memo not found' }, { status: 404 })
    }

    if (memo.status === 'voided') {
      return NextResponse.json({ error: 'Cannot apply a voided credit memo' }, { status: 400 })
    }

    if (memo.status === 'fully_used' || memo.remaining <= 0) {
      return NextResponse.json({ error: 'Credit memo has no remaining balance' }, { status: 400 })
    }

    if (amount > memo.remaining) {
      return NextResponse.json(
        { error: `Amount exceeds remaining balance of $${memo.remaining.toFixed(2)}` },
        { status: 400 }
      )
    }

    // Verify order exists
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const newRemaining = parseFloat((memo.remaining - amount).toFixed(2))
    const newStatus =
      newRemaining <= 0 ? 'fully_used' : newRemaining < memo.amount ? 'partially_applied' : 'open'

    const [transaction] = await prisma.$transaction([
      prisma.creditMemoTransaction.create({
        data: {
          memoId: id,
          orderId,
          amount,
          type: 'apply',
        },
      }),
      prisma.creditMemo.update({
        where: { id },
        data: {
          remaining: newRemaining,
          status: newStatus,
        },
      }),
    ])

    return NextResponse.json({ transaction, remaining: newRemaining, status: newStatus }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
