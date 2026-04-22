import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const purchaseOrderId = sp.get('purchaseOrderId')

    const charges = await prisma.itemCharge.findMany({
      where: purchaseOrderId ? { purchaseOrderId } : {},
      include: {
        chargeType: true,
        purchaseOrder: {
          select: { id: true, poNumber: true, supplierId: true, supplier: { select: { name: true } } },
        },
        lines: {
          include: { product: { select: { id: true, name: true, sku: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })

    return NextResponse.json(charges)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      chargeTypeId: string
      purchaseOrderId?: string
      description: string
      amount: number
      currency?: string
      allocationType?: string
      vendorId?: string
      invoiceRef?: string
      chargeDate?: string
      notes?: string
    }

    const {
      chargeTypeId,
      purchaseOrderId,
      description,
      amount,
      currency = 'USD',
      allocationType = 'quantity',
      vendorId,
      invoiceRef,
      chargeDate,
      notes,
    } = body

    if (!chargeTypeId || !description || amount == null) {
      return NextResponse.json({ error: 'chargeTypeId, description, and amount are required' }, { status: 400 })
    }

    // Auto-allocate to PO lines if a PO is linked
    let allocationLines: { productId: string; allocatedAmt: number }[] = []

    if (purchaseOrderId) {
      const po = await prisma.purchaseOrder.findUnique({
        where: { id: purchaseOrderId },
        include: { items: { include: { product: { select: { id: true } } } } },
      })

      if (po && po.items.length > 0) {
        const totalAmt = Number(amount)

        if (allocationType === 'quantity') {
          const totalQty = po.items.reduce((sum, i) => sum + i.orderedQty, 0)
          if (totalQty > 0) {
            allocationLines = po.items.map(i => ({
              productId: i.productId,
              allocatedAmt: parseFloat(((i.orderedQty / totalQty) * totalAmt).toFixed(4)),
            }))
          }
        } else if (allocationType === 'amount') {
          const totalLineValue = po.items.reduce((sum, i) => sum + i.lineTotal, 0)
          if (totalLineValue > 0) {
            allocationLines = po.items.map(i => ({
              productId: i.productId,
              allocatedAmt: parseFloat(((i.lineTotal / totalLineValue) * totalAmt).toFixed(4)),
            }))
          }
        } else {
          // Equal distribution (weight or fallback)
          const share = parseFloat((totalAmt / po.items.length).toFixed(4))
          allocationLines = po.items.map(i => ({
            productId: i.productId,
            allocatedAmt: share,
          }))
        }

        // Fix rounding: assign any remaining cents to first line
        if (allocationLines.length > 0) {
          const allocated = allocationLines.reduce((s, l) => s + l.allocatedAmt, 0)
          const diff = parseFloat((totalAmt - allocated).toFixed(4))
          if (diff !== 0) allocationLines[0].allocatedAmt += diff
        }
      }
    }

    const charge = await prisma.itemCharge.create({
      data: {
        chargeTypeId,
        purchaseOrderId: purchaseOrderId || null,
        description: description.trim(),
        amount,
        currency,
        allocationType,
        vendorId: vendorId || null,
        invoiceRef: invoiceRef?.trim() || null,
        chargeDate: chargeDate ? new Date(chargeDate) : new Date(),
        notes: notes?.trim() || null,
        lines:
          allocationLines.length > 0
            ? { create: allocationLines }
            : undefined,
      },
      include: {
        chargeType: true,
        purchaseOrder: { select: { id: true, poNumber: true } },
        lines: {
          include: { product: { select: { id: true, name: true, sku: true } } },
        },
      },
    })

    return NextResponse.json(charge, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
