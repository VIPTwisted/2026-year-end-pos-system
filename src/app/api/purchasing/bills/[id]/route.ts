import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const bill = await prisma.vendorInvoice.findUnique({
      where: { id },
      include: {
        vendor:  true,
        lines:   true,
        settlements: {
          include: { payment: true },
          orderBy: { settledAt: 'desc' },
        },
      },
    })

    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 })
    }

    return NextResponse.json(bill)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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
      dueDate?: string
      notes?: string
    }

    const existing = await prisma.vendorInvoice.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 })
    }

    const updated = await prisma.vendorInvoice.update({
      where: { id },
      data: {
        ...(body.status  ? { status: body.status }           : {}),
        ...(body.dueDate ? { dueDate: new Date(body.dueDate) } : {}),
        ...(body.notes !== undefined ? { notes: body.notes } : {}),
      },
      include: { vendor: true, lines: true },
    })

    return NextResponse.json(updated)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
