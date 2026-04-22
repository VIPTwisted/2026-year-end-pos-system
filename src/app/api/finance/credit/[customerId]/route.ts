import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteContext {
  params: Promise<{ customerId: string }>
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { customerId } = await params

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        arInvoices: {
          include: { lines: true, settlements: true },
          orderBy: { invoiceDate: 'desc' },
        },
      },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const openInvoices = customer.arInvoices.filter(
      (i) => !['paid', 'void', 'cancelled'].includes(i.status)
    )
    const balance = openInvoices.reduce(
      (s, i) => s + Math.max(0, i.totalAmount - i.paidAmount),
      0
    )
    const utilization =
      customer.creditLimit > 0
        ? Math.round((balance / customer.creditLimit) * 100)
        : 0

    const paymentHistory = customer.arInvoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      invoiceDate: inv.invoiceDate,
      dueDate: inv.dueDate,
      totalAmount: inv.totalAmount,
      paidAmount: inv.paidAmount,
      status: inv.status,
      daysOverdue: Math.max(
        0,
        Math.floor(
          (Date.now() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24)
        )
      ),
    }))

    const paidOnTime = customer.arInvoices.filter(
      (i) => i.status === 'paid'
    ).length
    const lateCount = customer.arInvoices.filter((i) => {
      if (i.status !== 'paid') return false
      const settled = i.settlements[0]
      if (!settled) return false
      return new Date(settled.settledAt) > new Date(i.dueDate)
    }).length

    const riskScore = Math.min(
      100,
      (lateCount / Math.max(1, paidOnTime)) * 50 +
        Math.min(50, utilization / 2)
    )

    return NextResponse.json({
      customer: {
        id: customer.id,
        name: `${customer.firstName} ${customer.lastName}`,
        email: customer.email,
        creditLimit: customer.creditLimit,
        creditStatus: customer.creditStatus,
        balance,
        available: customer.creditLimit > 0 ? customer.creditLimit - balance : null,
        utilization,
        riskScore: Math.round(riskScore),
        invoiceCount: customer.arInvoices.length,
        paidOnTime,
        lateCount,
      },
      paymentHistory,
    })
  } catch (err) {
    console.error('[GET /api/finance/credit/[customerId]]', err)
    return NextResponse.json({ error: 'Failed to load customer credit' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const { customerId } = await params
    const body = await req.json() as {
      creditLimit?: number
      creditStatus?: string
      reason?: string
    }

    const updated = await prisma.customer.update({
      where: { id: customerId },
      data: {
        ...(body.creditLimit !== undefined ? { creditLimit: body.creditLimit } : {}),
        ...(body.creditStatus !== undefined ? { creditStatus: body.creditStatus } : {}),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        creditLimit: true,
        creditStatus: true,
      },
    })

    return NextResponse.json({ customer: updated })
  } catch (err) {
    console.error('[PATCH /api/finance/credit/[customerId]]', err)
    return NextResponse.json({ error: 'Failed to update credit' }, { status: 500 })
  }
}
