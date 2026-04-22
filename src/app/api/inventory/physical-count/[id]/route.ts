/**
 * API: Physical Count Detail
 * GET   /api/inventory/physical-count/[id]  — fetch count + lines
 * PATCH /api/inventory/physical-count/[id]  — update status / notes; posting applies inventory adjustments
 * POST  /api/inventory/physical-count/[id]  — post journal (convenience alias for PATCH { status: 'posted' })
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const count = await prisma.physicalCount.findUnique({
      where: { id },
      include: {
        store: true,
        lines: {
          include: { product: true },
          orderBy: [{ countedQty: 'asc' }, { product: { name: 'asc' } }],
        },
      },
    })
    if (!count) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(count)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id }  = await params
    const body    = await req.json() as { status?: string; notes?: string }

    const existing = await prisma.physicalCount.findUnique({
      where: { id },
      include: { lines: true },
    })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const updateData: { status?: string; notes?: string; postedAt?: Date } = {}
    if (body.notes  !== undefined) updateData.notes  = body.notes
    if (body.status !== undefined) updateData.status = body.status

    if (body.status === 'posted' && existing.status !== 'posted') {
      updateData.postedAt = new Date()

      // Apply variance adjustments to inventory
      const toAdjust = existing.lines.filter(l => l.countedQty !== null && l.variance !== null && l.variance !== 0)
      for (const line of toAdjust) {
        const countedQty = line.countedQty as number
        await prisma.inventory.updateMany({
          where: { productId: line.productId, storeId: existing.storeId },
          data:  { quantity: countedQty },
        })
        await prisma.inventoryTransaction.create({
          data: {
            productId: line.productId,
            storeId:   existing.storeId,
            type:      'adjustment',
            quantity:  line.variance as number,
            beforeQty: line.systemQty,
            afterQty:  countedQty,
            reference: existing.countNumber,
            notes:     `Physical count adjustment — ${existing.countNumber}`,
          },
        })
      }
    }

    const updated = await prisma.physicalCount.update({
      where: { id },
      data:  updateData,
      include: {
        store: true,
        lines: { include: { product: true } },
      },
    })
    return NextResponse.json(updated)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** POST convenience alias: post the journal (sets status → posted) */
export async function POST(req: NextRequest, { params }: Params) {
  const body = await req.json().catch(() => ({})) as { status?: string }
  const enriched = new Request(req.url, {
    method:  'PATCH',
    headers: req.headers,
    body:    JSON.stringify({ status: body.status ?? 'posted' }),
  })
  return PATCH(enriched as NextRequest, { params })
}
