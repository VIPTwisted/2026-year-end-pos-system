import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const body = await req.json()
  const { periodStart, periodEnd } = body

  if (!periodStart || !periodEnd) {
    return NextResponse.json(
      { error: 'periodStart and periodEnd are required' },
      { status: 400 },
    )
  }

  const group = await prisma.consolidationGroup.findUnique({
    where: { id },
    include: { companies: { where: { isActive: true } } },
  })
  if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 })

  const start = new Date(periodStart)
  const end = new Date(periodEnd)

  // Create run
  const run = await prisma.consolidationRun.create({
    data: {
      groupId: id,
      periodStart: start,
      periodEnd: end,
      status: 'running',
    },
  })

  try {
    // Fetch all journal lines in the period
    const journalLines = await prisma.journalLine.findMany({
      where: {
        entry: {
          date: { gte: start, lte: end },
          status: 'posted',
        },
      },
      include: {
        account: { select: { code: true, name: true, type: true } },
      },
    })

    // Aggregate by account
    const accountMap: Record<
      string,
      { accountName: string; debit: number; credit: number }
    > = {}
    for (const line of journalLines) {
      const key = line.account.code
      if (!accountMap[key]) {
        accountMap[key] = {
          accountName: line.account.name,
          debit: 0,
          credit: 0,
        }
      }
      accountMap[key].debit += line.debit
      accountMap[key].credit += line.credit
    }

    // Build result rows per company (each active company gets a row per account)
    const primaryCompany = group.companies[0]
    const companyName = primaryCompany?.companyName ?? 'Consolidated'
    const companyId = primaryCompany?.id ?? 'consolidated'
    const resultRows: {
      runId: string
      companyId: string
      accountNo: string
      accountCode: string
      accountName: string
      companyName: string
      debit: number
      credit: number
      eliminationDebit: number
      eliminationCredit: number
      netBalance: number
    }[] = []

    for (const [code, agg] of Object.entries(accountMap)) {
      resultRows.push({
        runId: run.id,
        companyId,
        accountNo: code,
        accountCode: code,
        accountName: agg.accountName,
        companyName,
        debit: agg.debit,
        credit: agg.credit,
        eliminationDebit: 0,
        eliminationCredit: 0,
        netBalance: agg.debit - agg.credit,
      })
    }

    // Apply eliminations for IC transactions in the period
    const icTxs = await prisma.intercompanyTransaction.findMany({
      where: {
        postingDate: { gte: start, lte: end },
        isEliminated: false,
        eliminationNeeded: true,
      },
    })

    // Group eliminations — sending side: debit eliminations, receiving: credit
    for (const tx of icTxs) {
      const key = '2000' // Default intercompany clearing account
      const existing = resultRows.find(r => r.accountCode === key)
      if (existing) {
        if (tx.direction === 'sending') {
          existing.eliminationDebit += tx.amountInBase
        } else {
          existing.eliminationCredit += tx.amountInBase
        }
        existing.netBalance = existing.debit - existing.credit - existing.eliminationDebit + existing.eliminationCredit
      } else {
        resultRows.push({
          runId: run.id,
          companyId,
          accountNo: key,
          accountCode: key,
          accountName: 'Intercompany Eliminations',
          companyName: 'Eliminations',
          debit: 0,
          credit: 0,
          eliminationDebit: tx.direction === 'sending' ? tx.amountInBase : 0,
          eliminationCredit: tx.direction === 'receiving' ? tx.amountInBase : 0,
          netBalance: 0,
        })
      }
    }

    // Mark IC transactions as eliminated
    if (icTxs.length > 0) {
      await prisma.intercompanyTransaction.updateMany({
        where: {
          id: { in: icTxs.map(t => t.id) },
        },
        data: { isEliminated: true },
      })
    }

    // Save results
    if (resultRows.length > 0) {
      await prisma.consolidationResult.createMany({ data: resultRows })
    }

    // Mark run complete
    const completed = await prisma.consolidationRun.update({
      where: { id: run.id },
      data: { status: 'complete' },
      include: {
        results: { orderBy: { accountCode: 'asc' } },
      },
    })

    return NextResponse.json(completed, { status: 201 })
  } catch (err) {
    await prisma.consolidationRun.update({
      where: { id: run.id },
      data: { status: 'failed' },
    })
    console.error('Consolidation run failed:', err)
    return NextResponse.json({ error: 'Consolidation run failed' }, { status: 500 })
  }
}
