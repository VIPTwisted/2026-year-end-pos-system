/**
 * API: Lot Tracking
 * GET  /api/inventory/lot-tracking  — list lots (delegates to /api/inventory/lots)
 * POST /api/inventory/lot-tracking  — create lot
 *
 * This is the canonical endpoint for the /inventory/lot-tracking/ UI module.
 * Implementation delegates to the existing prisma.lotNumber model.
 *
 * TODO: LotNumber stub model needs these fields expanded:
 *   lotNo, productId, supplierId, quantity, quantityOnHand, manufacturedAt,
 *   expiresAt, receivedAt, isExpired, isBlocked, notes, warehouseLocation
 *   movements: LotMovement[]
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const sp         = req.nextUrl.searchParams
    const productId  = sp.get('productId')
    const supplierId = sp.get('supplierId')
    const expiring   = sp.get('expiring') // days
    const status     = sp.get('status')   // active | blocked | expired | expiring

    const now    = new Date()
    const where: Record<string, unknown> = {}
    if (productId)  where.productId  = productId
    if (supplierId) where.supplierId = supplierId
    if (status === 'expired')  where.isExpired = true
    if (status === 'blocked')  where.isBlocked = true
    if (expiring) {
      const days   = parseInt(expiring, 10)
      const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
      where.expiresAt = { lte: cutoff }
    }

    const lots = await prisma.lotNumber.findMany({
      where,
      include: {
        product:   { select: { id: true, name: true, sku: true } },
        supplier:  { select: { id: true, name: true } },
        movements: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
      orderBy: { receivedAt: 'desc' },
    })

    return NextResponse.json(lots)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      lotNo?:          string
      productId:       string
      supplierId?:     string
      quantity:        number
      manufacturedAt?: string
      expiresAt?:      string
      notes?:          string
    }

    const { productId, quantity } = body
    if (!productId)                           return NextResponse.json({ error: 'productId is required' }, { status: 400 })
    if (typeof quantity !== 'number' || quantity < 0) return NextResponse.json({ error: 'quantity must be >= 0' }, { status: 400 })

    const lotNo = body.lotNo?.trim() || `LOT-${Date.now().toString(36).toUpperCase()}`

    const lot = await prisma.lotNumber.create({
      data: {
        lotNo,
        productId,
        supplierId:    body.supplierId    ?? null,
        quantity,
        quantityOnHand: quantity,
        manufacturedAt: body.manufacturedAt ? new Date(body.manufacturedAt) : null,
        expiresAt:      body.expiresAt      ? new Date(body.expiresAt)      : null,
        notes:          body.notes          ?? null,
      },
      include: {
        product:  { select: { id: true, name: true, sku: true } },
        supplier: { select: { id: true, name: true } },
      },
    })

    // Log initial receipt movement
    await prisma.lotMovement.create({
      data: { lotId: lot.id, type: 'receipt', quantity, reference: null, notes: 'Initial receipt' },
    })

    return NextResponse.json(lot, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
