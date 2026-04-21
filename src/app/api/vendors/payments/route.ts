import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const payments = await prisma.vendorPayment.findMany({
    include: { vendor: true },
    orderBy: { paymentDate: 'desc' },
  })
  return NextResponse.json(payments)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  const { vendorId, paymentDate, amount, paymentMethod, bankAccountId, checkNumber, notes } = body

  if (!vendorId || !paymentDate || !amount || amount <= 0) {
    return NextResponse.json(
      { error: 'vendorId, paymentDate, and a positive amount are required' },
      { status: 400 }
    )
  }

  // Verify vendor exists
  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } })
  if (!vendor) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
  }

  // Load oldest open invoices for this vendor to auto-settle
  const openInvoices = await prisma.vendorInvoice.findMany({
    where: {
      vendorId,
      status: { in: ['posted', 'matched', 'partial'] },
    },
    orderBy: { dueDate: 'asc' },
  })

  const paymentNumber = `VPAY-${Date.now()}`

  const payment = await prisma.$transaction(async tx => {
    // Create the payment
    const newPayment = await tx.vendorPayment.create({
      data: {
        paymentNumber,
        vendorId,
        paymentDate:   new Date(paymentDate),
        amount,
        paymentMethod: paymentMethod ?? 'Check',
        bankAccountId: bankAccountId ?? null,
        checkNumber:   checkNumber ?? null,
        status:        'posted',
        notes:         notes ?? null,
      },
    })

    // Auto-settle against oldest open invoices
    let remaining = amount

    for (const inv of openInvoices) {
      if (remaining <= 0) break

      const outstandingBalance = inv.totalAmount - inv.paidAmount
      if (outstandingBalance <= 0) continue

      const settledAmount = Math.min(remaining, outstandingBalance)
      remaining -= settledAmount

      // Create settlement record
      await tx.vendorPaymentSettlement.create({
        data: {
          paymentId:     newPayment.id,
          invoiceId:     inv.id,
          settledAmount,
          discountTaken: 0,
        },
      })

      // Update invoice paidAmount and status
      const newPaidAmount = inv.paidAmount + settledAmount
      const newStatus =
        newPaidAmount >= inv.totalAmount
          ? 'paid'
          : newPaidAmount > 0
          ? 'partial'
          : inv.status

      await tx.vendorInvoice.update({
        where: { id: inv.id },
        data: {
          paidAmount: newPaidAmount,
          status:     newStatus,
        },
      })
    }

    return tx.vendorPayment.findUnique({
      where: { id: newPayment.id },
      include: {
        vendor:      true,
        settlements: { include: { invoice: true } },
      },
    })
  })

  return NextResponse.json(payment, { status: 201 })
}
