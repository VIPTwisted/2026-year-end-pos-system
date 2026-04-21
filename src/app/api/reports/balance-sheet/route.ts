import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [assetAccounts, liabilityAccounts, equityAccounts] = await Promise.all([
      prisma.account.findMany({
        where: { type: 'asset', isActive: true },
        orderBy: { code: 'asc' },
      }),
      prisma.account.findMany({
        where: { type: 'liability', isActive: true },
        orderBy: { code: 'asc' },
      }),
      prisma.account.findMany({
        where: { type: 'equity', isActive: true },
        orderBy: { code: 'asc' },
      }),
    ])

    const totalAssets = assetAccounts.reduce((sum, a) => sum + (a.balance ?? 0), 0)
    const totalLiabilities = liabilityAccounts.reduce((sum, a) => sum + (a.balance ?? 0), 0)
    const totalEquity = equityAccounts.reduce((sum, a) => sum + (a.balance ?? 0), 0)
    const isBalanced = Math.abs(totalAssets - (totalLiabilities + totalEquity)) <= 1

    return NextResponse.json({
      assets: assetAccounts,
      liabilities: liabilityAccounts,
      equity: equityAccounts,
      totalAssets,
      totalLiabilities,
      totalEquity,
      isBalanced,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[GET /api/reports/balance-sheet]', error)
    return NextResponse.json({ error: 'Failed to generate Balance Sheet' }, { status: 500 })
  }
}
