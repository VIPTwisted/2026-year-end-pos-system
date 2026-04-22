import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

function csvEscape(value: string | number | null | undefined): string {
  const str = value == null ? '' : String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const fromParam = sp.get('from')
    const toParam = sp.get('to')

    const now = new Date()
    const fromDate = fromParam
      ? startOfDay(new Date(fromParam))
      : startOfDay(new Date(now.getFullYear(), now.getMonth(), 1))
    const toDate = toParam ? endOfDay(new Date(toParam)) : endOfDay(now)

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: fromDate, lte: toDate },
        status: { in: ['completed', 'returned'] },
      },
      include: {
        customer: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    const headers = ['Order #', 'Date', 'Customer', 'Subtotal', 'Tax Rate %', 'Tax Amount', 'Total', 'Status']
    const rows = orders.map((o) => {
      const customerName =
        o.customer ? `${o.customer.firstName} ${o.customer.lastName}` : 'Walk-in'
      const taxRate = o.subtotal > 0 ? ((o.taxAmount / o.subtotal) * 100).toFixed(4) : '0.0000'
      return [
        csvEscape(o.orderNumber),
        csvEscape(new Date(o.createdAt).toLocaleDateString('en-US')),
        csvEscape(customerName),
        csvEscape(o.subtotal.toFixed(2)),
        csvEscape(taxRate),
        csvEscape(o.taxAmount.toFixed(2)),
        csvEscape(o.totalAmount.toFixed(2)),
        csvEscape(o.status),
      ].join(',')
    })

    const csv = [headers.map(csvEscape).join(','), ...rows].join('\r\n')

    const fromLabel = fromDate.toISOString().slice(0, 10)
    const toLabel = toDate.toISOString().slice(0, 10)

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="tax-report-${fromLabel}-to-${toLabel}.csv"`,
      },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
