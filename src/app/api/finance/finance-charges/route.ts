import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const customer = searchParams.get('customer')
  const dateFrom = searchParams.get('dateFrom')
  const dateTo = searchParams.get('dateTo')

  try {
    let where = `WHERE 1=1`
    if (status && status !== 'All') where += ` AND fc.status = '${status.replace(/'/g, "''")}'`
    if (customer) {
      const c = customer.replace(/'/g, "''")
      where += ` AND (fc.customerNo LIKE '%${c}%' OR fc.customerName LIKE '%${c}%')`
    }
    if (dateFrom) where += ` AND fc.postingDate >= '${dateFrom}'`
    if (dateTo) where += ` AND fc.postingDate <= '${dateTo}'`

    const rows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(`
      SELECT * FROM FinanceChargeMemo fc ${where} ORDER BY fc.createdAt DESC
    `)
    return NextResponse.json(rows)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { lines, ...h } = body
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const year = new Date().getFullYear()
    const prefix = `FCM-${year}-`

    const lastRows = await prisma.$queryRawUnsafe<{ memoNo: string }[]>(
      `SELECT memoNo FROM FinanceChargeMemo WHERE memoNo LIKE ? ORDER BY memoNo DESC LIMIT 1`,
      `${prefix}%`
    )
    const seq = lastRows.length ? parseInt(lastRows[0].memoNo.slice(prefix.length)) + 1 : 1
    const memoNo = `${prefix}${String(seq).padStart(4, '0')}`

    await prisma.$executeRawUnsafe(`
      INSERT INTO FinanceChargeMemo (id, memoNo, customerId, customerNo, customerName, postingDate, dueDate, status, amount, interestAmount, financeChargeFee, currency, notes, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      id, memoNo,
      h.customerId ?? null,
      h.customerNo ?? null,
      h.customerName ?? null,
      h.postingDate ?? new Date().toISOString().slice(0, 10),
      h.dueDate ?? null,
      h.status ?? 'Draft',
      Number(h.amount ?? 0),
      Number(h.interestAmount ?? 0),
      Number(h.financeChargeFee ?? 0),
      h.currency ?? 'USD',
      h.notes ?? null,
      now
    )

    if (Array.isArray(lines)) {
      for (let i = 0; i < lines.length; i++) {
        const l = lines[i]
        const lid = crypto.randomUUID()
        await prisma.$executeRawUnsafe(`
          INSERT INTO FinanceChargeMemoLine (id, memoId, lineNo, description, remainingAmount, interestAmount, documentType, documentNo, dueDate)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          lid, id, i + 1,
          l.description ?? null,
          Number(l.remainingAmount ?? 0),
          Number(l.interestAmount ?? 0),
          l.documentType ?? null,
          l.documentNo ?? null,
          l.dueDate ?? null
        )
      }
    }

    const created = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT * FROM FinanceChargeMemo WHERE id = ?`, id
    )
    return NextResponse.json(created[0], { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
