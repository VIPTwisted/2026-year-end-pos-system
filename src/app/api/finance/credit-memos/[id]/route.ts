import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const memo = await prisma.creditMemo.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
        salesReturn: {
          select: { id: true, returnNumber: true, createdAt: true },
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!memo) {
      return NextResponse.json({ error: 'Credit memo not found' }, { status: 404 })
    }

    return NextResponse.json(memo)
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
    const body = (await req.json()) as { status?: string; notes?: string }

    const existing = await prisma.creditMemo.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Credit memo not found' }, { status: 404 })
    }

    if (existing.status === 'voided') {
      return NextResponse.json({ error: 'Cannot modify a voided memo' }, { status: 400 })
    }

    const memo = await prisma.creditMemo.update({
      where: { id },
      data: {
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(body.notes !== undefined ? { notes: body.notes } : {}),
      },
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    })

    return NextResponse.json(memo)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
