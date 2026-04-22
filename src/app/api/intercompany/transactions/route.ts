import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const partnerId = searchParams.get('partnerId')
  const status = searchParams.get('status')

  const where: Record<string, unknown> = {}
  if (partnerId) where.partnerId = partnerId
  if (status) where.status = status

  const transactions = await prisma.intercompanyTransaction.findMany({
    where,
    orderBy: { postingDate: 'desc' },
    include: {
      partner: { select: { id: true, partnerCode: true, partnerName: true } },
    },
  })
  return NextResponse.json(transactions)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body.partnerId || !body.direction || !body.type || !body.amount || !body.description) {
    return NextResponse.json(
      { error: 'partnerId, direction, type, amount, and description are required' },
      { status: 400 },
    )
  }

  const year = new Date().getFullYear()
  const count = await prisma.intercompanyTransaction.count()
  const transactionNo = `IC-${year}-${String(count + 1).padStart(4, '0')}`

  const exchangeRate = Number(body.exchangeRate ?? 1)
  const amount = Number(body.amount)

  const tx = await prisma.intercompanyTransaction.create({
    data: {
      transactionNo,
      partnerId: body.partnerId,
      direction: body.direction,
      type: body.type,
      amount,
      currency: body.currency || 'USD',
      exchangeRate,
      amountInBase: amount * exchangeRate,
      description: body.description.trim(),
      status: 'pending',
      documentNo: body.documentNo || null,
      postingDate: body.postingDate ? new Date(body.postingDate) : new Date(),
      eliminationNeeded: body.eliminationNeeded ?? true,
    },
    include: {
      partner: { select: { id: true, partnerCode: true, partnerName: true } },
    },
  })
  return NextResponse.json(tx, { status: 201 })
}
