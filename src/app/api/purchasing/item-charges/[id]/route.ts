import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const charge = await prisma.itemCharge.findUnique({
      where: { id },
      include: {
        chargeType: true,
        purchaseOrder: {
          select: {
            id: true,
            poNumber: true,
            supplier: { select: { id: true, name: true } },
            items: {
              select: {
                id: true,
                productId: true,
                productName: true,
                sku: true,
                orderedQty: true,
                lineTotal: true,
              },
            },
          },
        },
        lines: {
          include: { product: { select: { id: true, name: true, sku: true } } },
        },
      },
    })

    if (!charge) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(charge)
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
      description?: string
      amount?: number
      currency?: string
      allocationType?: string
      vendorId?: string
      invoiceRef?: string
      chargeDate?: string
      notes?: string
    }

    const charge = await prisma.itemCharge.update({
      where: { id },
      data: {
        ...(body.description != null ? { description: body.description.trim() } : {}),
        ...(body.amount != null ? { amount: body.amount } : {}),
        ...(body.currency != null ? { currency: body.currency } : {}),
        ...(body.allocationType != null ? { allocationType: body.allocationType } : {}),
        ...(body.vendorId != null ? { vendorId: body.vendorId || null } : {}),
        ...(body.invoiceRef != null ? { invoiceRef: body.invoiceRef.trim() || null } : {}),
        ...(body.chargeDate != null ? { chargeDate: new Date(body.chargeDate) } : {}),
        ...(body.notes != null ? { notes: body.notes.trim() || null } : {}),
      },
      include: {
        chargeType: true,
        purchaseOrder: { select: { id: true, poNumber: true } },
        lines: {
          include: { product: { select: { id: true, name: true, sku: true } } },
        },
      },
    })

    return NextResponse.json(charge)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
