import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const asOf     = searchParams.get('asOf')
  const prevAsOf = searchParams.get('prevAsOf')

  async function getBalances(upTo?: string | null) {
    const accounts = await prisma.account.findMany({
      where: { isActive: true, type: { in: ['asset', 'liability', 'equity'] } },
      orderBy: { code: 'asc' },
    })

    if (!upTo) {
      return accounts.map((a) => ({ ...a, computedBalance: a.balance }))
    }

    const entries = await prisma.glEntry.findMany({
      where: { postingDate: { lte: new Date(upTo + 'T23:59:59') } },
      select: { accountId: true, accountNo: true, debitAmount: true, creditAmount: true },
    })

    const map = new Map<string, number>()
    for (const e of entries) {
      const key = e.accountId ?? e.accountNo ?? ''
      if (!key) continue
      map.set(key, (map.get(key) ?? 0) + (e.debitAmount ?? 0) - (e.creditAmount ?? 0))
    }

    return accounts.map((a) => {
      const debitNormal = a.type === 'asset'
      const raw = map.get(a.id) ?? 0
      return { ...a, computedBalance: debitNormal ? raw : -raw }
    })
  }

  const [currentAccts, prevAccts] = await Promise.all([
    getBalances(asOf),
    getBalances(prevAsOf),
  ])

  function shape(accts: Awaited<ReturnType<typeof getBalances>>) {
    const byType = (type: string, subtype?: string) =>
      accts
        .filter(a => a.type === type && (subtype == null || a.subtype === subtype))
        .map(a => ({ id: a.id, accountNo: a.code, accountName: a.name, balance: a.computedBalance }))

    const currentAssets  = byType('asset', 'current')
    const fixedAssets    = byType('asset', 'fixed').concat(byType('asset', 'non_current'))
    const otherAssets    = accts.filter(a => a.type === 'asset' && !['current', 'fixed', 'non_current'].includes(a.subtype ?? '')).map(a => ({ id: a.id, accountNo: a.code, accountName: a.name, balance: a.computedBalance }))

    const currentLiab    = byType('liability', 'current')
    const ltLiab         = byType('liability', 'long_term').concat(byType('liability', 'non_current'))
    const otherLiab      = accts.filter(a => a.type === 'liability' && !['current', 'long_term', 'non_current'].includes(a.subtype ?? '')).map(a => ({ id: a.id, accountNo: a.code, accountName: a.name, balance: a.computedBalance }))

    const equity         = byType('equity')

    const totalCurrentAssets = currentAssets.reduce((s, a) => s + a.balance, 0)
    const totalFixedAssets   = [...fixedAssets, ...otherAssets].reduce((s, a) => s + a.balance, 0)
    const totalAssets        = totalCurrentAssets + totalFixedAssets

    const totalCurrentLiab   = currentLiab.reduce((s, a) => s + a.balance, 0)
    const totalLtLiab        = [...ltLiab, ...otherLiab].reduce((s, a) => s + a.balance, 0)
    const totalLiabilities   = totalCurrentLiab + totalLtLiab

    const totalEquity        = equity.reduce((s, a) => s + a.balance, 0)
    const totalLiabEquity    = totalLiabilities + totalEquity

    return {
      assets:    { current: currentAssets, fixed: [...fixedAssets, ...otherAssets], totalCurrentAssets, totalFixedAssets, totalAssets },
      liabilities: { current: currentLiab, longTerm: [...ltLiab, ...otherLiab], totalCurrentLiab, totalLtLiab, totalLiabilities },
      equity:    { accounts: equity, totalEquity },
      totalLiabilitiesAndEquity: totalLiabEquity,
    }
  }

  return NextResponse.json({
    current: shape(currentAccts),
    previous: shape(prevAccts),
    asOf,
    prevAsOf,
  })
}
