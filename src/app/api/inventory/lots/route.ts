import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const productId = sp.get('productId')
    const supplierId = sp.get('supplierId')
    const expiring = sp.get('expiring') // "30" means expiring within 30 days

    const now = new Date()

    const where: {
      productId?: string
      supplierId?: string
      expiresAt?: { lte: Date }
    } = {}

    if (productId) where.productId = productId
    if (supplierId) where.supplierId = supplierId
    if (expiring) {
      const days = parseInt(expiring, 10)
      if (!isNaN(days)) {
        const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
        where.expiresAt = { lte: cutoff }
      }
    }

    const lots = await prisma.lotNumber.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, sku: true } },
        supplier: { select: { id: true, name: true } },
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
      lotNo?: string
      productId: string
      supplierId?: string
      quantity: number
      manufacturedAt?: string
      expiresAt?: string
      notes?: string
    }

    const { productId, supplierId, quantity, manufacturedAt, expiresAt, notes } = body

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 })
    }
    if (typeof quantity !== 'number' || quantity < 0) {
      return NextResponse.json({ error: 'quantity must be a non-negative number' }, { status: 400 })
    }

    // Auto-generate lot number if not supplied
    const lotNo = body.lotNo?.trim() || `LOT-${Date.now().toString(36).toUpperCase()}`

    const lot = await prisma.lotNumber.create({
      data: {
        lotNo,
        productId,
        supplierId: supplierId ?? null,
        quantity,
        quantityOnHand: quantity,
        manufacturedAt: manufacturedAt ? new Date(manufacturedAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        notes: notes ?? null,
      },
      include: {
        product: { select: { id: true, name: true, sku: true } },
        supplier: { select: { id: true, name: true } },
      },
    })

    // Log the initial receipt movement
    await prisma.lotMovement.create({
      data: {
        lotId: lot.id,
        type: 'receipt',
        quantity,
        reference: null,
        notes: 'Initial receipt',
      },
    })

    return NextResponse.json(lot, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
