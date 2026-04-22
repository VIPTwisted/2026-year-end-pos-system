/**
 * API: Landed Costs
 * GET  /api/purchasing/landed-costs  — list all landed cost entries
 * POST /api/purchasing/landed-costs  — create a landed cost entry
 *
 * Delegates to the ItemCharge model (fully expanded in this repo).
 * TODO: Once LandedCost model is expanded with its own fields, migrate this
 *   endpoint to use prisma.landedCost directly.
 *   Required LandedCost fields to add:
 *     poNumber, vendorName, allocationMethod, status (open/posted)
 *     lines: [chargeType, description, amount, currency]
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const sp             = req.nextUrl.searchParams
    const purchaseOrderId = sp.get('purchaseOrderId')
    const status         = sp.get('status') // open | posted

    const charges = await prisma.itemCharge.findMany({
      where: {
        ...(purchaseOrderId ? { purchaseOrderId } : {}),
      },
      include: {
        chargeType: true,
        purchaseOrder: {
          select: {
            id: true, poNumber: true,
            supplier: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // TODO: filter by status once LandedCost model has a status field
    void status

    return NextResponse.json(charges)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      chargeTypeId:    string
      purchaseOrderId?: string
      description:     string
      amount:          number
      currency?:       string
      allocationType?: string
      vendorId?:       string
      invoiceRef?:     string
      chargeDate?:     string
      notes?:          string
    }

    const { chargeTypeId, description, amount } = body

    if (!chargeTypeId) return NextResponse.json({ error: 'chargeTypeId is required' }, { status: 400 })
    if (!description?.trim()) return NextResponse.json({ error: 'description is required' }, { status: 400 })
    if (typeof amount !== 'number' || amount <= 0) return NextResponse.json({ error: 'amount must be > 0' }, { status: 400 })

    const charge = await prisma.itemCharge.create({
      data: {
        chargeTypeId,
        purchaseOrderId: body.purchaseOrderId ?? null,
        description:     description.trim(),
        amount,
        currency:        body.currency        ?? 'USD',
        allocationType:  body.allocationType  ?? 'quantity',
        vendorId:        body.vendorId        ?? null,
        invoiceRef:      body.invoiceRef      ?? null,
        chargeDate:      body.chargeDate ? new Date(body.chargeDate) : new Date(),
        notes:           body.notes           ?? null,
      },
      include: {
        chargeType: true,
        purchaseOrder: {
          select: { id: true, poNumber: true, supplier: { select: { name: true } } },
        },
      },
    })

    return NextResponse.json(charge, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
