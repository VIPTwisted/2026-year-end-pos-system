import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface StatementTransaction {
  date: string
  type: 'order' | 'invoice' | 'payment' | 'credit'
  reference: string
  description: string
  debit: number
  credit: number
  balance: number
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const sp = req.nextUrl.searchParams

    const now = new Date()
    const fromDefault = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
    const toDefault = now.toISOString().slice(0, 10)

    const fromStr = sp.get('from') ?? fromDefault
    const toStr = sp.get('to') ?? toDefault

    const from = new Date(`${fromStr}T00:00:00.000Z`)
    const to = new Date(`${toStr}T23:59:59.999Z`)

    const customer = await prisma.customer.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zip: true,
        loyaltyPoints: true,
        loyaltyCard: {
          select: { availablePoints: true, status: true },
        },
      },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Fetch orders in period (exclude voided/returned)
    const orders = await prisma.order.findMany({
      where: {
        customerId: id,
        createdAt: { gte: from, lte: to },
        status: { notIn: ['voided', 'returned'] },
      },
      include: {
        payments: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    // Fetch invoices in period
    const invoices = await prisma.customerInvoice.findMany({
      where: {
        customerId: id,
        invoiceDate: { gte: from, lte: to },
        status: { not: 'cancelled' },
      },
      include: {
        settlements: true,
      },
      orderBy: { invoiceDate: 'asc' },
    })

    // Build raw events list
    interface RawEvent {
      date: Date
      type: 'order' | 'invoice' | 'payment' | 'credit'
      reference: string
      description: string
      debit: number
      credit: number
    }

    const events: RawEvent[] = []

    for (const order of orders) {
      // The order itself is a debit (purchase)
      events.push({
        date: order.createdAt,
        type: 'order',
        reference: order.orderNumber,
        description: `Sale — Order ${order.orderNumber}`,
        debit: Number(order.totalAmount),
        credit: 0,
      })

      // Each payment on this order is a credit
      for (const pmt of order.payments) {
        if (pmt.status === 'completed') {
          events.push({
            date: pmt.createdAt,
            type: 'payment',
            reference: pmt.reference ?? order.orderNumber,
            description: `Payment — ${pmt.method.replace(/-/g, ' ')} on ${order.orderNumber}`,
            debit: 0,
            credit: Number(pmt.amount),
          })
        }
      }
    }

    for (const inv of invoices) {
      // Invoice is a debit
      events.push({
        date: inv.invoiceDate,
        type: 'invoice',
        reference: inv.invoiceNumber,
        description: `Invoice ${inv.invoiceNumber}${inv.notes ? ` — ${inv.notes}` : ''}`,
        debit: Number(inv.totalAmount),
        credit: 0,
      })

      // Settlements are credits
      for (const s of inv.settlements) {
        events.push({
          date: s.settledAt,
          type: 'credit',
          reference: s.paymentRef ?? inv.invoiceNumber,
          description: `Payment settlement on Invoice ${inv.invoiceNumber}`,
          debit: 0,
          credit: Number(s.settledAmount),
        })
      }
    }

    // Sort all events by date
    events.sort((a, b) => a.date.getTime() - b.date.getTime())

    // Build running balance
    let balance = 0
    const transactions: StatementTransaction[] = events.map(e => {
      balance = balance + e.debit - e.credit
      return {
        date: e.date.toISOString().slice(0, 10),
        type: e.type,
        reference: e.reference,
        description: e.description,
        debit: e.debit,
        credit: e.credit,
        balance,
      }
    })

    // Summary totals
    const totalPurchases = events.filter(e => e.type === 'order').reduce((s, e) => s + e.debit, 0)
    const totalInvoices = events.filter(e => e.type === 'invoice').reduce((s, e) => s + e.debit, 0)
    const totalPayments = events.filter(e => e.type === 'payment' || e.type === 'credit').reduce((s, e) => s + e.credit, 0)

    const loyaltyPointsBalance =
      customer.loyaltyCard
        ? customer.loyaltyCard.availablePoints
        : customer.loyaltyPoints

    return NextResponse.json({
      customer: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        address: [customer.address, customer.city, customer.state, customer.zip]
          .filter(Boolean)
          .join(', '),
      },
      period: { from: fromStr, to: toStr },
      openingBalance: 0,
      transactions,
      closingBalance: balance,
      summary: {
        totalPurchases: totalPurchases + totalInvoices,
        totalPayments,
        outstandingBalance: balance,
        loyaltyPointsBalance,
      },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
