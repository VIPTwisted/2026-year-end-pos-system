import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateMemoNumber(): string {
  const year = new Date().getFullYear()
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `CM-${year}-${rand}`
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const customerId = searchParams.get('customerId')

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (customerId) where.customerId = customerId

  const memos = await prisma.creditMemo.findMany({
    where,
    include: {
      customer: { select: { id: true, firstName: true, lastName: true, email: true } },
      salesReturn: { select: { id: true, returnNumber: true } },
      _count: { select: { transactions: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(memos)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { customerId, amount, notes, expiresAt } = body

  if (!customerId || !amount) {
    return NextResponse.json({ error: 'customerId and amount are required' }, { status: 400 })
  }

  let memoNumber = generateMemoNumber()
  let exists = await prisma.creditMemo.findUnique({ where: { memoNumber } })
  while (exists) {
    memoNumber = generateMemoNumber()
    exists = await prisma.creditMemo.findUnique({ where: { memoNumber } })
  }

  const memo = await prisma.creditMemo.create({
    data: {
      memoNumber,
      customerId,
      amount,
      remaining: amount,
      notes,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      status: 'open',
    },
    include: { customer: true },
  })

  return NextResponse.json(memo, { status: 201 })
}
