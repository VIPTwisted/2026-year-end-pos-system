import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''
  const tierId = searchParams.get('tierId') ?? ''
  const status = searchParams.get('status') ?? ''

  const cards = await prisma.loyaltyCard.findMany({
    where: {
      AND: [
        search
          ? {
              OR: [
                { cardNumber: { contains: search } },
                { customer: { firstName: { contains: search } } },
                { customer: { lastName: { contains: search } } },
              ],
            }
          : {},
        tierId ? { tierId } : {},
        status ? { status } : {},
      ],
    },
    include: {
      customer: { select: { id: true, firstName: true, lastName: true, email: true } },
      tier: true,
      program: { select: { id: true, name: true } },
    },
    orderBy: { enrolledAt: 'desc' },
  })
  return NextResponse.json(cards)
}
