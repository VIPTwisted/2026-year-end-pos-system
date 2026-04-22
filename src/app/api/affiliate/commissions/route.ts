import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const status = searchParams.get('status')
  const affiliateId = searchParams.get('affiliateId')
  const type = searchParams.get('type')

  const commissions = await prisma.affiliateCommission.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(affiliateId ? { affiliateId } : {}),
      ...(type ? { commissionType: type } : {}),
    },
    include: {
      affiliate: { select: { firstName: true, lastName: true, affiliateCode: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(commissions)
}
