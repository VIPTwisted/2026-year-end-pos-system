import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const memo = await prisma.creditMemo.findUnique({
    where: { id },
    include: {
      customer: true,
      salesReturn: { select: { id: true, returnNumber: true } },
      transactions: { orderBy: { createdAt: 'desc' } },
    },
  })
  if (!memo) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(memo)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  const memo = await prisma.creditMemo.findUnique({ where: { id } })
  if (!memo) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (body.action === 'void') {
    if (memo.status === 'voided') {
      return NextResponse.json({ error: 'Already voided' }, { status: 400 })
    }
    await prisma.creditMemoTransaction.create({
      data: { memoId: id, amount: memo.remaining, type: 'void' },
    })
    const updated = await prisma.creditMemo.update({
      where: { id },
      data: { status: 'voided', remaining: 0 },
      include: { customer: true, transactions: true },
    })
    return NextResponse.json(updated)
  }

  if (body.action === 'apply') {
    const applyAmount = Number(body.amount)
    if (!applyAmount || applyAmount <= 0) {
      return NextResponse.json({ error: 'Valid amount required' }, { status: 400 })
    }
    if (applyAmount > memo.remaining) {
      return NextResponse.json({ error: 'Amount exceeds remaining balance' }, { status: 400 })
    }
    if (memo.status === 'voided' || memo.status === 'applied') {
      return NextResponse.json({ error: 'Credit memo is not usable' }, { status: 400 })
    }

    const newRemaining = memo.remaining - applyAmount
    const newStatus = newRemaining <= 0 ? 'applied' : 'partially_applied'

    await prisma.creditMemoTransaction.create({
      data: { memoId: id, orderId: body.orderId ?? null, amount: applyAmount, type: 'apply' },
    })
    const updated = await prisma.creditMemo.update({
      where: { id },
      data: { remaining: newRemaining, status: newStatus },
      include: { customer: true, transactions: true },
    })
    return NextResponse.json(updated)
  }

  // Generic field update
  const updateData: Record<string, unknown> = {}
  if (body.notes !== undefined) updateData.notes = body.notes
  if (body.expiresAt !== undefined) updateData.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null

  const updated = await prisma.creditMemo.update({
    where: { id },
    data: updateData,
    include: { customer: true, transactions: true },
  })
  return NextResponse.json(updated)
}
