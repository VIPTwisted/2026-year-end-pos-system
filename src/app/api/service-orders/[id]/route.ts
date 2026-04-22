import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const order = await prisma.serviceOrder.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        technician: { select: { id: true, firstName: true, lastName: true, position: true } },
        parts: {
          include: {
            product: { select: { id: true, name: true, sku: true } },
          },
          orderBy: { id: 'asc' },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(order)
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
    const body = await req.json()

    const current = await prisma.serviceOrder.findUnique({ where: { id } })
    if (!current) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Auto-set completedAt when transitioning to completed
    const updateData: Record<string, unknown> = { ...body }
    if (body.status === 'completed' && current.status !== 'completed') {
      updateData.completedAt = new Date()
    }

    // Recalculate totalCost if laborCost or partsCost are being updated
    const laborCost = body.laborCost !== undefined
      ? parseFloat(String(body.laborCost))
      : parseFloat(String(current.laborCost))
    const partsCost = body.partsCost !== undefined
      ? parseFloat(String(body.partsCost))
      : parseFloat(String(current.partsCost))

    if (body.laborCost !== undefined || body.partsCost !== undefined) {
      updateData.totalCost = laborCost + partsCost
    }

    const updated = await prisma.serviceOrder.update({
      where: { id },
      data: updateData,
      include: {
        customer: { select: { id: true, firstName: true, lastName: true } },
        technician: { select: { id: true, firstName: true, lastName: true } },
        parts: true,
      },
    })

    return NextResponse.json(updated)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
