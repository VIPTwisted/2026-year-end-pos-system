import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface AccountBalance {
  code: string
  name: string
  balance: number
}

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const asOfParam = sp.get('asOf')
    const asOf = asOfParam ? new Date(asOfParam + 'T23:59:59.999Z') : new Date()

    // Fetch all active accounts with their journal lines up to asOf
    const accounts = await prisma.account.findMany({
      where: { isActive: true },
      include: {
        journalLines: {
          where: {
            entry: {
              date: { lte: asOf },
              status: 'posted',
            },
          },
        },
      },
      orderBy: { code: 'asc' },
    })

    // Compute running balance per account
    // Assets: debit-normal (debit increases, credit decreases)
    // Liabilities/Equity: credit-normal (credit increases, debit decreases)
    function computeBalance(
      type: string,
      lines: { debit: number; credit: number }[]
    ): number {
      const totalDebit = lines.reduce((s, l) => s + (l.debit ?? 0), 0)
      const totalCredit = lines.reduce((s, l) => s + (l.credit ?? 0), 0)
      if (type === 'asset' || type === 'expense') {
        return totalDebit - totalCredit
      }
      return totalCredit - totalDebit
    }

    const assetAccounts = accounts.filter(a => a.type === 'asset')
    const liabilityAccounts = accounts.filter(a => a.type === 'liability')
    const equityAccounts = accounts.filter(a => a.type === 'equity')
    const revenueAccounts = accounts.filter(a => a.type === 'revenue')
    const expenseAccounts = accounts.filter(a => a.type === 'expense')

    // Retained earnings = all revenue credits - all expense debits (net income since inception)
    const totalRevenue = revenueAccounts.reduce((sum, acct) =>
      sum + acct.journalLines.reduce((ls, l) => ls + (l.credit ?? 0) - (l.debit ?? 0), 0), 0)
    const totalExpenses = expenseAccounts.reduce((sum, acct) =>
      sum + acct.journalLines.reduce((ls, l) => ls + (l.debit ?? 0) - (l.credit ?? 0), 0), 0)
    const retainedEarnings = totalRevenue - totalExpenses

    function toBalance(acct: { code: string; name: string; type: string; journalLines: { debit: number; credit: number }[] }): AccountBalance {
      return {
        code: acct.code,
        name: acct.name,
        balance: computeBalance(acct.type, acct.journalLines),
      }
    }

    // Classify assets by subtype
    const currentAssets = assetAccounts
      .filter(a => !a.subtype || a.subtype === 'current' || a.subtype === 'bank' || a.subtype === 'receivable' || a.subtype === 'inventory' || a.subtype === 'prepaid')
      .map(toBalance)
      .filter(a => a.balance !== 0)

    const fixedAssets = assetAccounts
      .filter(a => a.subtype === 'fixed' || a.subtype === 'property' || a.subtype === 'equipment' || a.subtype === 'intangible')
      .map(toBalance)
      .filter(a => a.balance !== 0)

    // If no subtype distinction, put all assets in current
    const allAssetBalances = assetAccounts.map(toBalance).filter(a => a.balance !== 0)
    const classifiedAssetCodes = new Set([...currentAssets, ...fixedAssets].map(a => a.code))
    const unclassifiedAssets = allAssetBalances.filter(a => !classifiedAssetCodes.has(a.code))

    const finalCurrentAssets = [...currentAssets, ...unclassifiedAssets]
    const totalAssets = allAssetBalances.reduce((s, a) => s + a.balance, 0)

    // Classify liabilities
    const currentLiabilities = liabilityAccounts
      .filter(a => !a.subtype || a.subtype === 'current' || a.subtype === 'payable' || a.subtype === 'accrued' || a.subtype === 'deferred')
      .map(toBalance)
      .filter(a => a.balance !== 0)

    const longTermLiabilities = liabilityAccounts
      .filter(a => a.subtype === 'long_term' || a.subtype === 'loan' || a.subtype === 'mortgage' || a.subtype === 'bond')
      .map(toBalance)
      .filter(a => a.balance !== 0)

    const allLiabilityBalances = liabilityAccounts.map(toBalance).filter(a => a.balance !== 0)
    const classifiedLiabilityCodes = new Set([...currentLiabilities, ...longTermLiabilities].map(a => a.code))
    const unclassifiedLiabilities = allLiabilityBalances.filter(a => !classifiedLiabilityCodes.has(a.code))

    const finalCurrentLiabilities = [...currentLiabilities, ...unclassifiedLiabilities]
    const totalLiabilities = allLiabilityBalances.reduce((s, a) => s + a.balance, 0)

    const equityBalances = equityAccounts.map(toBalance).filter(a => a.balance !== 0)
    const totalEquity = equityBalances.reduce((s, a) => s + a.balance, 0) + retainedEarnings

    return NextResponse.json({
      asOf: asOf.toISOString().slice(0, 10),
      assets: {
        current: finalCurrentAssets,
        fixed: fixedAssets,
        totalAssets,
      },
      liabilities: {
        current: finalCurrentLiabilities,
        longTerm: longTermLiabilities,
        totalLiabilities,
      },
      equity: {
        accounts: equityBalances,
        retainedEarnings,
        totalEquity,
      },
      totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
