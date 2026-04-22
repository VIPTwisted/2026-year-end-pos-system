import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const customer = await prisma.customer.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        creditLimit: true,
        creditStatus: true,
        arInvoices: {
          where: { status: { in: ['posted', 'partial'] } },
          select: {
            id: true,
            invoiceNumber: true,
            invoiceDate: true,
            dueDate: true,
            totalAmount: true,
            paidAmount: true,
            status: true,
          },
          orderBy: { dueDate: 'asc' },
        },
      },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const openBalance = customer.arInvoices.reduce(
      (sum, inv) => sum + (inv.totalAmount - inv.paidAmount),
      0
    )
    const available =
      customer.creditLimit > 0
        ? Math.max(0, customer.creditLimit - openBalance)
        : null
    const utilization =
      customer.creditLimit > 0
        ? Math.min(100, Math.round((openBalance / customer.creditLimit) * 100))
        : null

    return NextResponse.json({
      ...customer,
      creditBalance: openBalance,
      available,
      utilization,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = (await req.json()) as {
      creditLimit?: number
      creditStatus?: string
      notes?: string
    }

    const allowedStatuses = ['ok', 'watch', 'hold', 'blocked']
    if (
      body.creditStatus !== undefined &&
      !allowedStatuses.includes(body.creditStatus)
    ) {
      return NextResponse.json(
        { error: 'Invalid creditStatus value' },
        { status: 400 }
      )
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        ...(body.creditLimit !== undefined && {
          creditLimit: body.creditLimit,
        }),
        ...(body.creditStatus !== undefined && {
          creditStatus: body.creditStatus,
        }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        creditLimit: true,
        creditStatus: true,
        notes: true,
      },
    })

    return NextResponse.json(updated)
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
