import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const status = searchParams.get('status')
  const period = searchParams.get('period')

  const payouts = await prisma.affiliatePayout.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(period ? { period } : {}),
    },
    include: {
      affiliate: { select: { firstName: true, lastName: true, affiliateCode: true } },
    },
    orderBy: [{ period: 'desc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json(payouts)
}
