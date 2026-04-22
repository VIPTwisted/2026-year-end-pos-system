import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const customerId = sp.get('customerId')

    const prepayments = await prisma.customerInvoice.findMany({
      where: {
        invoiceType: 'prepayment',
        ...(customerId ? { customerId } : {}),
      },
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        settlements: {
          select: { settledAmount: true, settledAt: true, invoiceId: true },
        },
      },
      orderBy: { invoiceDate: 'desc' },
    })

    const rows = prepayments.map((inv) => {
      const appliedAmount = inv.settlements.reduce((s, set) => {
        // Only count settlements where this is the prepayment being applied
        // In a full implementation, settlements link prepayment → invoice
        return s + set.settledAmount
      }, 0)
      const remaining = Math.max(0, inv.totalAmount - appliedAmount)
      // 90-day expiry from invoice date by default
      const expiryDate = new Date(inv.invoiceDate)
      expiryDate.setDate(expiryDate.getDate() + 90)
      const isExpired = expiryDate < new Date()

      return {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        customerId: inv.customerId,
        customerName: `${inv.customer.firstName} ${inv.customer.lastName}`,
        customerEmail: inv.customer.email,
        invoiceDate: inv.invoiceDate,
        totalAmount: inv.totalAmount,
        appliedAmount,
        remaining,
        expiryDate: expiryDate.toISOString(),
        status: inv.status,
        isExpired,
        notes: inv.notes,
      }
    })

    const kpis = {
      totalCount: rows.length,
      totalPrepaid: rows.reduce((s, r) => s + r.totalAmount, 0),
      totalApplied: rows.reduce((s, r) => s + r.appliedAmount, 0),
      totalRemaining: rows.reduce((s, r) => s + r.remaining, 0),
    }

    return NextResponse.json({ prepayments: rows, kpis })
  } catch (err) {
    console.error('[GET /api/finance/prepayments]', err)
    return NextResponse.json({ error: 'Failed to load prepayments' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      action?: string
      // Create prepayment voucher
      customerId?: string
      amount?: number
      notes?: string
      // Apply prepayment
      prepaymentId?: string
      targetInvoiceId?: string
      applyAmount?: number
    }

    if (body.action === 'apply') {
      // Apply prepayment to an invoice
      const { prepaymentId, targetInvoiceId, applyAmount } = body
      if (!prepaymentId || !targetInvoiceId || !applyAmount) {
        return NextResponse.json({ error: 'prepaymentId, targetInvoiceId, applyAmount required' }, { status: 400 })
      }

      const prepayment = await prisma.customerInvoice.findUnique({ where: { id: prepaymentId } })
      const target = await prisma.customerInvoice.findUnique({ where: { id: targetInvoiceId } })

      if (!prepayment || prepayment.invoiceType !== 'prepayment') {
        return NextResponse.json({ error: 'Prepayment not found' }, { status: 404 })
      }
      if (!target) {
        return NextResponse.json({ error: 'Target invoice not found' }, { status: 404 })
      }

      const remaining = prepayment.totalAmount - prepayment.paidAmount
      if (applyAmount > remaining + 0.005) {
        return NextResponse.json({ error: 'Apply amount exceeds remaining prepayment balance' }, { status: 400 })
      }

      // Create settlement and update both invoices
      const [settlement] = await prisma.$transaction([
        prisma.customerPaymentSettlement.create({
          data: {
            customerId: prepayment.customerId,
            invoiceId: targetInvoiceId,
            paymentRef: `PRE-${prepaymentId.slice(-6).toUpperCase()}`,
            settledAmount: applyAmount,
            discountTaken: 0,
          },
        }),
        prisma.customerInvoice.update({
          where: { id: targetInvoiceId },
          data: {
            paidAmount: { increment: applyAmount },
          },
        }),
        prisma.customerInvoice.update({
          where: { id: prepaymentId },
          data: {
            paidAmount: { increment: applyAmount },
          },
        }),
      ])

      return NextResponse.json({ settlement, success: true })
    }

    // Create new prepayment voucher
    const { customerId, amount, notes } = body
    if (!customerId || !amount || amount <= 0) {
      return NextResponse.json({ error: 'customerId and amount are required' }, { status: 400 })
    }

    const invoiceNumber = `PRE-${Date.now().toString(36).toUpperCase()}`
    const prepayment = await prisma.customerInvoice.create({
      data: {
        invoiceNumber,
        customerId,
        invoiceDate: new Date(),
        dueDate: new Date(),
        subtotal: amount,
        taxAmount: 0,
        totalAmount: amount,
        paidAmount: 0,
        status: 'posted',
        invoiceType: 'prepayment',
        notes: notes ?? null,
      },
      include: {
        customer: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return NextResponse.json({ prepayment }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/finance/prepayments]', err)
    return NextResponse.json({ error: 'Failed to process prepayment' }, { status: 500 })
  }
}
