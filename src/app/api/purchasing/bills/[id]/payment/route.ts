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
      method?: string
      reference?: string
      paymentMethod?: string
    }

    const paymentAmount = Number(body.amount)
    if (!paymentAmount || paymentAmount <= 0) {
      return NextResponse.json({ error: 'A positive payment amount is required' }, { status: 400 })
    }

    const bill = await prisma.vendorInvoice.findUnique({
      where: { id },
      include: { vendor: true },
    })

    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 })
    }

    if (bill.status === 'paid' || bill.status === 'cancelled') {
      return NextResponse.json(
        { error: `Cannot record payment on a bill with status "${bill.status}"` },
        { status: 409 }
      )
    }

    const paymentMethod = body.method ?? body.paymentMethod ?? 'Check'
    const paymentNumber = `VPAY-${Date.now().toString(36).toUpperCase()}`

    const result = await prisma.$transaction(async tx => {
      // Create vendor payment record
      const payment = await tx.vendorPayment.create({
        data: {
          paymentNumber,
          vendorId:    bill.vendorId,
          paymentDate: new Date(),
          amount:      paymentAmount,
          paymentMethod,
          checkNumber: body.reference ?? null,
          status:      'posted',
          notes:       body.reference ? `Ref: ${body.reference}` : null,
        },
      })

      // Create settlement linking payment to bill
      await tx.vendorPaymentSettlement.create({
        data: {
          paymentId:     payment.id,
          invoiceId:     id,
          settledAmount: paymentAmount,
          discountTaken: 0,
        },
      })

      // Update bill paidAmount + status
      const newPaidAmount = bill.paidAmount + paymentAmount
      const newStatus =
        newPaidAmount >= bill.totalAmount
          ? 'paid'
          : newPaidAmount > 0
          ? 'partial'
          : bill.status

      const updatedBill = await tx.vendorInvoice.update({
        where: { id },
        data: {
          paidAmount: newPaidAmount,
          status:     newStatus,
        },
        include: {
          vendor: true,
          lines:  true,
          settlements: {
            include: { payment: true },
            orderBy: { settledAt: 'desc' },
          },
        },
      })

      return updatedBill
    })

    return NextResponse.json(result, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
