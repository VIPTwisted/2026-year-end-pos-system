import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const invoices = await prisma.vendorInvoice.findMany({
      where: {
        status: { in: ['posted', 'partial', 'matched'] },
      },
      include: {
        vendor: {
          select: { id: true, name: true, vendorCode: true },
        },
      },
      orderBy: { dueDate: 'asc' },
    })

    const rows = invoices
      .map((inv) => {
        const balance = inv.totalAmount - inv.paidAmount
        const due = new Date(inv.dueDate)
        due.setHours(0, 0, 0, 0)
        const msDiff = today.getTime() - due.getTime()
        const daysPastDue = Math.floor(msDiff / (1000 * 60 * 60 * 24))

        let agingBucket: string
        if (daysPastDue <= 0) agingBucket = 'Current (0-30)'
        else if (daysPastDue <= 30) agingBucket = 'Current (0-30)'
        else if (daysPastDue <= 60) agingBucket = '31-60 Days'
        else if (daysPastDue <= 90) agingBucket = '61-90 Days'
        else agingBucket = '90+ Days'

        return { inv, balance, daysPastDue, agingBucket }
      })
      .filter((r) => r.balance > 0.005)

    const escape = (v: string | number) => {
      const s = String(v)
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`
      }
      return s
    }

    const headers = [
      'Vendor Name',
      'Vendor Code',
      'Bill #',
      'Bill Date',
      'Due Date',
      'Status',
      'Total Amount',
      'Paid Amount',
      'Balance Due',
      'Days Past Due',
      'Aging Bucket',
    ]

    const fmtDate = (d: Date) =>
      new Intl.DateTimeFormat('en-US', { dateStyle: 'short' }).format(d)

    const dataLines = rows.map(({ inv, balance, daysPastDue, agingBucket }) =>
      [
        inv.vendor.name,
        inv.vendor.vendorCode,
        inv.invoiceNumber,
        fmtDate(inv.invoiceDate),
        fmtDate(inv.dueDate),
        inv.status,
        inv.totalAmount.toFixed(2),
        inv.paidAmount.toFixed(2),
        balance.toFixed(2),
        daysPastDue > 0 ? String(daysPastDue) : '0',
        agingBucket,
      ]
        .map(escape)
        .join(',')
    )

    const csv = [headers.join(','), ...dataLines].join('\r\n')

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="ap-aging-${today.toISOString().slice(0, 10)}.csv"`,
      },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
