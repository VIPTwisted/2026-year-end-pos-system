import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const now = new Date()
    const [
      totalAccounts,
      totalContacts,
      openActivities,
      activeContracts,
      overdueActivities,
      recentActivities,
      accountsByType,
    ] = await Promise.all([
      prisma.cRMAccount.count(),
      prisma.cRMContact.count(),
      prisma.cRMActivity.count({ where: { status: 'open' } }),
      prisma.cRMServiceContract.count({ where: { status: 'active' } }),
      prisma.cRMActivity.count({
        where: { status: 'open', dueDate: { lt: now } },
      }),
      prisma.cRMActivity.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          account: { select: { id: true, name: true } },
          contact: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.cRMAccount.groupBy({
        by: ['accountType'],
        _count: { id: true },
      }),
    ])

    return NextResponse.json({
      totalAccounts,
      totalContacts,
      openActivities,
      activeContracts,
      overdueActivities,
      recentActivities,
      accountsByType,
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
