import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json() as {
      amount: number
      method: string
      reference?: string | null
      notes?: string | null
    }

    const { amount, method, reference, notes } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Payment amount must be greater than zero' }, { status: 400 })
    }
    if (!method) {
      return NextResponse.json({ error: 'Payment method is required' }, { status: 400 })
    }

    const invoice = await prisma.customerInvoice.findUnique({
      where: { id },
      select: {
        id: true,
        customerId: true,
        totalAmount: true,
        paidAmount: true,
        status: true,
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    if (['void', 'cancelled'].includes(invoice.status)) {
      return NextResponse.json(
        { error: 'Cannot record payment on a voided or cancelled invoice' },
        { status: 400 }
      )
    }

    const newPaidAmount = invoice.paidAmount + amount
    const newStatus =
      newPaidAmount >= invoice.totalAmount - 0.005
        ? 'paid'
        : newPaidAmount > 0
        ? 'partial'
        : invoice.status

    const [settlement, updatedInvoice] = await prisma.$transaction([
      prisma.customerPaymentSettlement.create({
        data: {
          customerId: invoice.customerId,
          invoiceId: id,
          paymentRef: reference ?? null,
          settledAmount: amount,
          discountTaken: 0,
        },
      }),
      prisma.customerInvoice.update({
        where: { id },
        data: {
          paidAmount: newPaidAmount,
          status: newStatus,
        },
        include: {
          customer: {
            select: { id: true, firstName: true, lastName: true },
          },
          lines: true,
          settlements: { orderBy: { settledAt: 'asc' } },
        },
      }),
    ])

    return NextResponse.json({ settlement, invoice: updatedInvoice }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/finance/invoices/[id]/payment]', err)
    return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 })
  }
}
