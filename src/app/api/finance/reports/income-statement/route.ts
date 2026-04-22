import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const dateFrom   = searchParams.get('dateFrom')
  const dateTo     = searchParams.get('dateTo')
  const prevFrom   = searchParams.get('prevFrom')
  const prevTo     = searchParams.get('prevTo')
  const ytdFrom    = searchParams.get('ytdFrom')
  const ytdTo      = searchParams.get('ytdTo')

  async function aggregateEntries(from?: string | null, to?: string | null) {
    if (!from && !to) return new Map<string, { debit: number; credit: number }>()
    const entries = await prisma.glEntry.findMany({
      where: {
        postingDate: {
          ...(from ? { gte: new Date(from) } : {}),
          ...(to   ? { lte: new Date(to + 'T23:59:59') } : {}),
        },
      },
      select: { accountId: true, accountNo: true, debitAmount: true, creditAmount: true },
    })
    const map = new Map<string, { debit: number; credit: number }>()
    for (const e of entries) {
      const key = e.accountId ?? e.accountNo ?? ''
      if (!key) continue
      const cur = map.get(key) ?? { debit: 0, credit: 0 }
      cur.debit  += e.debitAmount  ?? 0
      cur.credit += e.creditAmount ?? 0
      map.set(key, cur)
    }
    return map
  }

  const [currentMap, prevMap, ytdMap] = await Promise.all([
    aggregateEntries(dateFrom, dateTo),
    aggregateEntries(prevFrom, prevTo),
    aggregateEntries(ytdFrom, ytdTo),
  ])

  const accounts = await prisma.account.findMany({
    where: { type: { in: ['revenue', 'expense'] }, isActive: true },
    orderBy: { code: 'asc' },
  })

  function netAmount(map: Map<string, { debit: number; credit: number }>, acctId: string, type: string) {
    const v = map.get(acctId) ?? { debit: 0, credit: 0 }
    return type === 'revenue' ? (v.credit - v.debit) : (v.debit - v.credit)
  }

  const rows = accounts.map((acct) => ({
    id:          acct.id,
    accountNo:   acct.code,
    accountName: acct.name,
    type:        acct.type,
    subtype:     acct.subtype ?? null,
    current:     netAmount(currentMap, acct.id, acct.type),
    previous:    netAmount(prevMap,    acct.id, acct.type),
    ytd:         netAmount(ytdMap,     acct.id, acct.type),
  }))

  function sum(rows: typeof rows, filterFn: (r: (typeof rows)[0]) => boolean) {
    return rows.filter(filterFn).reduce(
      (acc, r) => ({ current: acc.current + r.current, previous: acc.previous + r.previous, ytd: acc.ytd + r.ytd }),
      { current: 0, previous: 0, ytd: 0 }
    )
  }

  const revenue   = sum(rows, r => r.type === 'revenue' && !['cogs'].includes(r.subtype ?? ''))
  const cogs      = sum(rows, r => r.type === 'expense' && r.subtype === 'cogs')
  const opEx      = sum(rows, r => r.type === 'expense' && r.subtype !== 'cogs' && r.subtype !== 'other')
  const otherInEx = sum(rows, r => r.type === 'expense' && r.subtype === 'other')

  const grossProfit = { current: revenue.current - cogs.current, previous: revenue.previous - cogs.previous, ytd: revenue.ytd - cogs.ytd }
  const opIncome    = { current: grossProfit.current - opEx.current, previous: grossProfit.previous - opEx.previous, ytd: grossProfit.ytd - opEx.ytd }
  const netIncome   = { current: opIncome.current - otherInEx.current, previous: opIncome.previous - otherInEx.previous, ytd: opIncome.ytd - otherInEx.ytd }

  return NextResponse.json({
    rows,
    sections: { revenue, cogs, grossProfit, opEx, opIncome, otherInEx, netIncome },
  })
}
