import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const dateFrom = searchParams.get('dateFrom')
  const dateTo   = searchParams.get('dateTo')

  const entries = await prisma.glEntry.findMany({
    where: {
      postingDate: {
        ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
        ...(dateTo   ? { lte: new Date(dateTo + 'T23:59:59') } : {}),
      },
    },
    select: { accountId: true, accountNo: true, debitAmount: true, creditAmount: true },
  })

  const netMap = new Map<string, number>()
  for (const e of entries) {
    const key = e.accountId ?? e.accountNo ?? ''
    if (!key) continue
    netMap.set(key, (netMap.get(key) ?? 0) + (e.debitAmount ?? 0) - (e.creditAmount ?? 0))
  }

  const accounts = await prisma.account.findMany({
    where: { isActive: true },
    orderBy: { code: 'asc' },
  })

  function classify(a: typeof accounts[0]): 'operating' | 'investing' | 'financing' | null {
    if (a.type === 'revenue' || a.type === 'expense') return 'operating'
    if (a.type === 'asset') {
      if (a.subtype === 'current') return 'operating'
      if (a.subtype === 'cash') return null
      return 'investing'
    }
    if (a.type === 'liability') {
      if (a.subtype === 'current') return 'operating'
      return 'financing'
    }
    if (a.type === 'equity') return 'financing'
    return null
  }

  const operating: { accountNo: string; accountName: string; amount: number }[] = []
  const investing:  typeof operating = []
  const financing:  typeof operating = []

  for (const a of accounts) {
    const raw = netMap.get(a.id) ?? 0
    if (raw === 0) continue
    const debitNormal = ['asset', 'expense'].includes(a.type)
    const amount = debitNormal ? raw : -raw
    const section = classify(a)
    if (!section) continue
    const row = { accountNo: a.code, accountName: a.name, amount }
    if (section === 'operating') operating.push(row)
    else if (section === 'investing') investing.push(row)
    else financing.push(row)
  }

  function total(rows: typeof operating) { return rows.reduce((s, r) => s + r.amount, 0) }

  const totalOperating = total(operating)
  const totalInvesting = total(investing)
  const totalFinancing = total(financing)
  const netChange      = totalOperating + totalInvesting + totalFinancing

  return NextResponse.json({
    operating, totalOperating,
    investing, totalInvesting,
    financing, totalFinancing,
    netChange,
    dateFrom, dateTo,
  })
}
