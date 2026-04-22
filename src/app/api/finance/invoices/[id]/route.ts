import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const invoice = await prisma.customerInvoice.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
        lines: true,
        settlements: {
          orderBy: { settledAt: 'asc' },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    return NextResponse.json({ invoice })
  } catch (err) {
    console.error('[GET /api/finance/invoices/[id]]', err)
    return NextResponse.json({ error: 'Failed to load invoice' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json() as {
      status?: string
      notes?: string | null
      dueDate?: string | null
    }

    const existing = await prisma.customerInvoice.findUnique({
      where: { id },
      select: { id: true, status: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const allowedTransitions: Record<string, string[]> = {
      draft: ['posted', 'void'],
      posted: ['partial', 'paid', 'void'],
      partial: ['paid', 'void'],
      paid: [],
      void: [],
      cancelled: [],
    }

    if (body.status && body.status !== existing.status) {
      const allowed = allowedTransitions[existing.status] ?? []
      if (!allowed.includes(body.status)) {
        return NextResponse.json(
          { error: `Cannot transition from '${existing.status}' to '${body.status}'` },
          { status: 400 }
        )
      }
    }

    const updateData: {
      status?: string
      notes?: string | null
      dueDate?: Date
      postingDate?: Date
    } = {}

    if (body.status !== undefined) updateData.status = body.status
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.dueDate) updateData.dueDate = new Date(body.dueDate)
    if (body.status === 'posted') updateData.postingDate = new Date()

    const invoice = await prisma.customerInvoice.update({
      where: { id },
      data: updateData,
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true },
        },
        lines: true,
        settlements: true,
      },
    })

    return NextResponse.json({ invoice })
  } catch (err) {
    console.error('[PATCH /api/finance/invoices/[id]]', err)
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await prisma.customerInvoice.findUnique({
      where: { id },
      select: { id: true, status: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    if (existing.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft invoices can be deleted' },
        { status: 400 }
      )
    }

    await prisma.customerInvoice.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/finance/invoices/[id]]', err)
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 })
  }
}
