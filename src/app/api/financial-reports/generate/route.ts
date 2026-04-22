import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Parses account range like "1000..1999" or "1000,1010,1020"
function parseAccountRange(range: string): string[] {
  if (range.includes('..')) {
    const [start, end] = range.split('..').map(s => s.trim())
    return [start, end] // used for gte/lte filter
  }
  return range.split(',').map(s => s.trim())
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { templateId, startDate, endDate } = body

  if (!templateId || !startDate || !endDate) {
    return NextResponse.json({ error: 'templateId, startDate, endDate are required' }, { status: 400 })
  }

  const template = await prisma.financialReportTemplate.findUnique({
    where: { id: templateId },
    include: { rows: { orderBy: { rowNo: 'asc' } } },
  })
  if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 })

  const start = new Date(startDate)
  const end = new Date(endDate)

  // Pull all GL journal lines in date range
  const journalLines = await prisma.journalLine.findMany({
    where: {
      entry: {
        date: { gte: start, lte: end },
        status: 'posted',
      },
    },
    include: { entry: true, account: true },
  })

  // Build account balance map (keyed by account code)
  const balances: Record<string, number> = {}
  for (const line of journalLines) {
    const acct = line.account.code
    if (!balances[acct]) balances[acct] = 0
    balances[acct] += line.debit - line.credit
  }

  // Evaluate each row
  const rowResults: Array<{
    rowNo: number
    description: string
    rowType: string
    amount: number | null
    bold: boolean
    underline: boolean
    indent: number
  }> = []

  const rowTotals: Record<number, number> = {}

  for (const row of template.rows) {
    let amount: number | null = null

    if (row.rowType === 'account' && row.accountRange) {
      const range = parseAccountRange(row.accountRange)
      let total = 0
      if (range.length === 2 && row.accountRange.includes('..')) {
        const [from, to] = range
        for (const [acct, bal] of Object.entries(balances)) {
          if (acct >= from && acct <= to) total += bal
        }
      } else {
        for (const acct of range) {
          total += balances[acct] ?? 0
        }
      }
      amount = row.showOpposite ? -total : total
    } else if (row.rowType === 'formula' && row.formula) {
      // Simple SUM(row1,row2) or row1+row2-row3
      try {
        const expr = row.formula.replace(/ROW\((\d+)\)/g, (_: string, n: string) => String(rowTotals[Number(n)] ?? 0))
        // eslint-disable-next-line no-eval
        amount = Function(`"use strict"; return (${expr})`)() as number
      } catch {
        amount = null
      }
    } else if (row.rowType === 'heading' || row.rowType === 'blank') {
      amount = null
    }

    if (amount !== null) rowTotals[row.rowNo] = amount

    rowResults.push({
      rowNo: row.rowNo,
      description: row.description,
      rowType: row.rowType,
      amount,
      bold: row.bold,
      underline: row.underline,
      indent: row.indent,
    })
  }

  return NextResponse.json({
    templateId,
    templateName: template.name,
    type: template.type,
    startDate,
    endDate,
    generatedAt: new Date().toISOString(),
    rows: rowResults,
  })
}
