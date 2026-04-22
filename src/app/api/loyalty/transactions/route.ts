import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const cardId = searchParams.get('cardId')

  const transactions = await prisma.loyaltyTransaction.findMany({
    where: {
      ...(type ? { type } : {}),
      ...(cardId ? { cardId } : {}),
    },
    include: {
      card: { include: { customer: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 500,
  })
  return NextResponse.json(transactions)
}
