import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period')

    const entries = await prisma.gLEntry.findMany({
      where: period
        ? { journal: { period, status: 'posted' } }
        : { journal: { status: 'posted' } },
      include: {
        account: { select: { accountCode: true, accountName: true, accountType: true, normalBalance: true } },
      },
    })

    const map = new Map<string, {
      accountCode: string; accountName: string; accountType: string
      normalBalance: string; totalDebit: number; totalCredit: number
    }>()

    for (const entry of entries) {
      const key = entry.accountCode
      if (!map.has(key)) {
        map.set(key, {
          accountCode: entry.account.accountCode,
          accountName: entry.account.accountName,
          accountType: entry.account.accountType,
          normalBalance: entry.account.normalBalance,
          totalDebit: 0, totalCredit: 0,
        })
      }
      const row = map.get(key)!
      row.totalDebit += entry.debit
      row.totalCredit += entry.credit
    }

    const rows = Array.from(map.values()).sort((a, b) => a.accountCode.localeCompare(b.accountCode))
    const grandDebit = rows.reduce((s, r) => s + r.totalDebit, 0)
    const grandCredit = rows.reduce((s, r) => s + r.totalCredit, 0)

    return NextResponse.json({ period: period || 'all', rows, grandDebit, grandCredit })
  } catch (err) {
    console.error('[trial-balance GET]', err)
    return NextResponse.json({ error: 'Failed to generate trial balance' }, { status: 500 })
  }
}
