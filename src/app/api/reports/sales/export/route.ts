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

function escapeCsv(value: string | number | null | undefined): string {
  const str = String(value ?? '')
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
    const fromDate = fromParam ? startOfDay(new Date(fromParam)) : startOfDay(new Date(now.getFullYear(), now.getMonth(), 1))
    const toDate = toParam ? endOfDay(new Date(toParam)) : endOfDay(now)

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: fromDate, lte: toDate },
        status: { not: 'voided' },
      },
      include: {
        items: true,
        payments: { select: { method: true } },
        customer: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    const headers = [
      'Order #',
      'Date',
      'Customer',
      'Items',
      'Subtotal',
      'Tax',
      'Discount',
      'Total',
      'Payment Method',
      'Status',
    ]

    const rows = orders.map(o => {
      const customerName = o.customer
        ? `${o.customer.firstName} ${o.customer.lastName}`
        : 'Walk-in'
      const itemCount = o.items.reduce((s, i) => s + i.quantity, 0)
      const methods = [...new Set(o.payments.map(p => p.method))].join('+')

      return [
        escapeCsv(o.orderNumber),
        escapeCsv(new Date(o.createdAt).toISOString().slice(0, 10)),
        escapeCsv(customerName),
        escapeCsv(itemCount),
        escapeCsv(o.subtotal.toFixed(2)),
        escapeCsv(o.taxAmount.toFixed(2)),
        escapeCsv(o.discountAmount.toFixed(2)),
        escapeCsv(o.totalAmount.toFixed(2)),
        escapeCsv(methods || o.paymentMethod || ''),
        escapeCsv(o.status),
      ].join(',')
    })

    const csvContent = [headers.join(','), ...rows].join('\n')

    const fromStr = fromParam ?? fromDate.toISOString().slice(0, 10)
    const toStr = toParam ?? toDate.toISOString().slice(0, 10)

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="sales-${fromStr}-${toStr}.csv"`,
      },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
