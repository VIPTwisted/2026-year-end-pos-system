/**
 * API: Physical Inventory Count Journals
 * GET  /api/inventory/physical-count  — list journals
 * POST /api/inventory/physical-count  — create journal + auto-populate lines
 *
 * Uses prisma.physicalCount model.
 * TODO: PhysicalCount + PhysicalCountLine are stub models in schema — expand fields to
 *       match: countNumber, storeId, status, notes, postedAt, lines[productId, systemQty, countedQty, variance]
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const sp      = req.nextUrl.searchParams
    const storeId = sp.get('storeId')
    const status  = sp.get('status')

    const counts = await prisma.physicalCount.findMany({
      where: {
        ...(storeId ? { storeId } : {}),
        ...(status  ? { status }  : {}),
      },
      include: { store: true, lines: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(counts)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { storeId: string; notes?: string }
    const { storeId, notes } = body

    if (!storeId) {
      return NextResponse.json({ error: 'storeId is required' }, { status: 400 })
    }

    const countNumber = `PC-${Date.now().toString(36).toUpperCase()}`

    // Auto-populate lines from current inventory at this store
    const inventories = await prisma.inventory.findMany({
      where: { storeId },
      include: { product: { select: { id: true, isActive: true } } },
    })
    const active = inventories.filter(inv => inv.product.isActive)

    const count = await prisma.physicalCount.create({
      data: {
        countNumber,
        storeId,
        notes:  notes ?? null,
        status: 'draft',
        lines: {
          create: active.map(inv => ({
            productId: inv.productId,
            systemQty: Math.round(inv.quantity),
            countedQty: null,
            variance:   null,
          })),
        },
      },
      include: {
        store: true,
        lines: { include: { product: true } },
      },
    })

    return NextResponse.json(count, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
