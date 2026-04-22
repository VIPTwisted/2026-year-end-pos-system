import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const dateFrom        = searchParams.get('dateFrom')
  const dateTo          = searchParams.get('dateTo')
  const accountType     = searchParams.get('accountType') // asset|liability|equity|revenue|expense|all
  const includeClosing  = searchParams.get('includeClosing') === 'true'

  const dateFilter: Record<string, unknown> = {}
  if (dateFrom || dateTo) {
    dateFilter.postingDate = {
      ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
      ...(dateTo   ? { lte: new Date(dateTo + 'T23:59:59') } : {}),
    }
  }

  const accountWhere: Record<string, unknown> = { isActive: true }
  if (accountType && accountType !== 'all') accountWhere.type = accountType

  const accounts = await prisma.account.findMany({
    where: accountWhere,
    orderBy: { code: 'asc' },
  })

  const entryWhere: Record<string, unknown> = { ...dateFilter }
  if (!includeClosing) {
    entryWhere.documentType = { not: 'Closing' }
  }

  const entries = await prisma.glEntry.findMany({
    where: entryWhere,
    select: {
      accountId: true,
      accountNo: true,
      debitAmount: true,
      creditAmount: true,
    },
  })

  const netByAccount = new Map<string, { debit: number; credit: number }>()
  for (const e of entries) {
    const key = e.accountId ?? e.accountNo ?? ''
    if (!key) continue
    const cur = netByAccount.get(key) ?? { debit: 0, credit: 0 }
    cur.debit  += e.debitAmount ?? 0
    cur.credit += e.creditAmount ?? 0
    netByAccount.set(key, cur)
  }

  const rows = accounts.map((acct) => {
    const netChange = netByAccount.get(acct.id) ?? { debit: 0, credit: 0 }
    const balance   = acct.balance ?? 0
    const debitNormal = ['asset', 'expense'].includes(acct.type)
    const balDebit  = debitNormal  ? Math.max(0, balance) : 0
    const balCredit = !debitNormal ? Math.max(0, Math.abs(balance)) : 0

    return {
      id:              acct.id,
      accountNo:       acct.code,
      accountName:     acct.name,
      accountType:     acct.type,
      netChangeDebit:  netChange.debit,
      netChangeCredit: netChange.credit,
      balanceDebit:    balDebit,
      balanceCredit:   balCredit,
    }
  })

  const totals = rows.reduce(
    (acc, r) => ({
      netChangeDebit:  acc.netChangeDebit  + r.netChangeDebit,
      netChangeCredit: acc.netChangeCredit + r.netChangeCredit,
      balanceDebit:    acc.balanceDebit    + r.balanceDebit,
      balanceCredit:   acc.balanceCredit   + r.balanceCredit,
    }),
    { netChangeDebit: 0, netChangeCredit: 0, balanceDebit: 0, balanceCredit: 0 }
  )

  return NextResponse.json({ rows, totals })
}
