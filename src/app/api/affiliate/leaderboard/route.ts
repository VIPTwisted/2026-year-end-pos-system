import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const affiliates = await prisma.affiliate.findMany({
    where: { status: 'active' },
    orderBy: { totalSales: 'desc' },
    take: 10,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      affiliateCode: true,
      tierName: true,
      totalSales: true,
      totalCommission: true,
      teamSize: true,
    },
  })

  const leaderboard = affiliates.map((a, i) => ({
    rank: i + 1,
    id: a.id,
    name: `${a.firstName} ${a.lastName}`,
    code: a.affiliateCode,
    tier: a.tierName ?? 'Base',
    sales: a.totalSales,
    commission: a.totalCommission,
    teamSize: a.teamSize,
  }))

  return NextResponse.json(leaderboard)
}
