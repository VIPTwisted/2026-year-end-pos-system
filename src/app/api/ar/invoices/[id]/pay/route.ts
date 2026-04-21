import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const { amount, paymentRef, discountTaken } = body

  if (!amount || Number(amount) <= 0) {
    return NextResponse.json({ error: 'amount must be a positive number' }, { status: 400 })
  }

  const invoice = await prisma.customerInvoice.findUnique({
    where: { id },
  })

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  }

  if (!['posted', 'partial'].includes(invoice.status)) {
    return NextResponse.json(
      { error: `Cannot record payment on invoice with status: ${invoice.status}` },
      { status: 400 }
    )
  }

  const payAmount = Number(amount)
  const discount = Number(discountTaken) || 0
  const newPaidAmount = invoice.paidAmount + payAmount

  const newStatus =
    newPaidAmount >= invoice.totalAmount - 0.005 ? 'paid' : 'partial'

  // Create settlement record and update invoice in a transaction
  const [settlement, updated] = await prisma.$transaction([
    prisma.customerPaymentSettlement.create({
      data: {
        customerId: invoice.customerId,
        invoiceId: id,
        settledAmount: payAmount,
        discountTaken: discount,
        settledAt: new Date(),
        paymentRef: paymentRef || null,
      },
    }),
    prisma.customerInvoice.update({
      where: { id },
      data: {
        paidAmount: newPaidAmount,
        status: newStatus,
      },
      include: { customer: true, lines: true, settlements: true },
    }),
  ])

  return NextResponse.json({ settlement, invoice: updated })
}
