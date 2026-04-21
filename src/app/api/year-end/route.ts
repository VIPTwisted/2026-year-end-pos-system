import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { fiscalYearId, retainedEarningsAccountId } = body

    if (!fiscalYearId || !retainedEarningsAccountId) {
      return NextResponse.json(
        { error: 'fiscalYearId and retainedEarningsAccountId are required' },
        { status: 400 }
      )
    }

    // 1. Load fiscal year and validate
    const fiscalYear = await prisma.fiscalYear.findUnique({
      where: { id: fiscalYearId },
      include: { periods: true, yearEndClose: true },
    })

    if (!fiscalYear) {
      return NextResponse.json({ error: 'Fiscal year not found' }, { status: 404 })
    }

    if (fiscalYear.status === 'closed' || fiscalYear.status === 'archived') {
      return NextResponse.json(
        { error: 'Fiscal year is already closed or archived' },
        { status: 400 }
      )
    }

    if (fiscalYear.yearEndClose && fiscalYear.yearEndClose.status === 'completed') {
      return NextResponse.json(
        { error: 'Year-end close already completed for this fiscal year' },
        { status: 409 }
      )
    }

    // Validate all periods are closed
    const openPeriods = fiscalYear.periods.filter(p => p.status !== 'closed')
    if (openPeriods.length > 0) {
      return NextResponse.json(
        {
          error: `Cannot close year — ${openPeriods.length} period(s) still open`,
          openPeriods: openPeriods.map(p => ({ id: p.id, name: p.name, status: p.status })),
        },
        { status: 400 }
      )
    }

    // Validate retained earnings account
    const retainedEarningsAccount = await prisma.account.findUnique({
      where: { id: retainedEarningsAccountId },
    })

    if (!retainedEarningsAccount) {
      return NextResponse.json(
        { error: 'Retained earnings account not found' },
        { status: 404 }
      )
    }

    if (retainedEarningsAccount.type !== 'equity') {
      return NextResponse.json(
        { error: 'Retained earnings account must be of type equity' },
        { status: 400 }
      )
    }

    // 2. Load all revenue and expense accounts with balances
    const revenueAccounts = await prisma.account.findMany({
      where: { type: 'revenue', isActive: true, balance: { not: 0 } },
    })

    const expenseAccounts = await prisma.account.findMany({
      where: { type: 'expense', isActive: true, balance: { not: 0 } },
    })

    // 3. Calculate net income
    const totalRevenue = revenueAccounts.reduce((sum, a) => sum + a.balance, 0)
    const totalExpenses = expenseAccounts.reduce((sum, a) => sum + a.balance, 0)
    const netIncome = totalRevenue - totalExpenses

    // 4. Create closing JournalEntry in a transaction
    const closingRef = `YE-CLOSE-${fiscalYear.name}-${Date.now().toString(36).toUpperCase()}`
    const openingRef = `YE-OPEN-${fiscalYear.name}-${Date.now().toString(36).toUpperCase()}`

    const result = await prisma.$transaction(async (tx) => {
      // Build journal lines:
      // - Debit each revenue account (zero it out — revenue has credit normal balance)
      // - Credit each expense account (zero it out — expense has debit normal balance)
      // - Credit/Debit retained earnings for net income
      const journalLines: {
        accountId: string
        debit: number
        credit: number
        memo: string
      }[] = []

      for (const account of revenueAccounts) {
        journalLines.push({
          accountId: account.id,
          debit: account.balance,
          credit: 0,
          memo: `Year-end close: zero revenue — ${account.name}`,
        })
      }

      for (const account of expenseAccounts) {
        journalLines.push({
          accountId: account.id,
          debit: 0,
          credit: account.balance,
          memo: `Year-end close: zero expense — ${account.name}`,
        })
      }

      // Net income to retained earnings
      if (netIncome >= 0) {
        journalLines.push({
          accountId: retainedEarningsAccountId,
          debit: 0,
          credit: netIncome,
          memo: `Year-end close: net income to retained earnings`,
        })
      } else {
        journalLines.push({
          accountId: retainedEarningsAccountId,
          debit: Math.abs(netIncome),
          credit: 0,
          memo: `Year-end close: net loss to retained earnings`,
        })
      }

      // Create closing journal entry
      const closingEntry = await tx.journalEntry.create({
        data: {
          reference: closingRef,
          description: `Year-End Closing Entry — ${fiscalYear.name}`,
          date: new Date(fiscalYear.endDate),
          status: 'posted',
          lines: { create: journalLines },
        },
      })

      // Create opening journal entry (carry-forward reference only — balances stay)
      const openingEntry = await tx.journalEntry.create({
        data: {
          reference: openingRef,
          description: `Year-End Opening Balance Reference — ${fiscalYear.name}`,
          date: new Date(fiscalYear.endDate),
          status: 'posted',
          lines: { create: [] },
        },
      })

      // Zero out revenue account balances
      for (const account of revenueAccounts) {
        await tx.account.update({
          where: { id: account.id },
          data: { balance: 0 },
        })
      }

      // Zero out expense account balances
      for (const account of expenseAccounts) {
        await tx.account.update({
          where: { id: account.id },
          data: { balance: 0 },
        })
      }

      // Update retained earnings balance
      await tx.account.update({
        where: { id: retainedEarningsAccountId },
        data: { balance: { increment: netIncome } },
      })

      // Create or update YearEndClose record
      const yearEndClose = await tx.yearEndClose.upsert({
        where: { fiscalYearId },
        create: {
          fiscalYearId,
          closingDate: new Date(),
          status: 'completed',
          retainedEarningsAccountId,
          closingVoucherId: closingEntry.id,
          openingVoucherId: openingEntry.id,
          totalRevenue,
          totalExpenses,
          netIncome,
          completedAt: new Date(),
          completedBy: 'system',
        },
        update: {
          status: 'completed',
          retainedEarningsAccountId,
          closingVoucherId: closingEntry.id,
          openingVoucherId: openingEntry.id,
          totalRevenue,
          totalExpenses,
          netIncome,
          completedAt: new Date(),
          completedBy: 'system',
        },
      })

      // Update fiscal year status to closed
      await tx.fiscalYear.update({
        where: { id: fiscalYearId },
        data: {
          status: 'closed',
          closedAt: new Date(),
          closedBy: 'system',
        },
      })

      return yearEndClose
    })

    return NextResponse.json(
      {
        yearEndClose: result,
        summary: {
          totalRevenue,
          totalExpenses,
          netIncome,
          closingRef,
          openingRef,
          revenueAccountsZeroed: revenueAccounts.length,
          expenseAccountsZeroed: expenseAccounts.length,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/year-end]', error)
    return NextResponse.json(
      { error: 'Year-end close failed — transaction rolled back' },
      { status: 500 }
    )
  }
}
