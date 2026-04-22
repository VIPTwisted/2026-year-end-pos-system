import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    const lot = await prisma.lotNumber.findUnique({
      where: { id },
      include: {
        product: { select: { id: true, name: true, sku: true } },
        supplier: { select: { id: true, name: true } },
        movements: { orderBy: { createdAt: 'desc' } },
      },
    })

    if (!lot) {
      return NextResponse.json({ error: 'Lot not found' }, { status: 404 })
    }

    return NextResponse.json(lot)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await req.json() as {
      quantityOnHand?: number
      isBlocked?: boolean
      notes?: string
      expiresAt?: string | null
      manufacturedAt?: string | null
    }

    const existing = await prisma.lotNumber.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Lot not found' }, { status: 404 })
    }

    const data: {
      quantityOnHand?: number
      isBlocked?: boolean
      notes?: string | null
      expiresAt?: Date | null
      manufacturedAt?: Date | null
      isExpired?: boolean
    } = {}

    if (typeof body.quantityOnHand === 'number') data.quantityOnHand = body.quantityOnHand
    if (typeof body.isBlocked === 'boolean') data.isBlocked = body.isBlocked
    if (typeof body.notes === 'string') data.notes = body.notes
    if (body.expiresAt !== undefined) {
      data.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null
    }
    if (body.manufacturedAt !== undefined) {
      data.manufacturedAt = body.manufacturedAt ? new Date(body.manufacturedAt) : null
    }

    // Recompute isExpired based on new or existing expiresAt
    const finalExpiry = data.expiresAt !== undefined ? data.expiresAt : existing.expiresAt
    if (finalExpiry) {
      data.isExpired = new Date() > finalExpiry
    }

    const updated = await prisma.lotNumber.update({
      where: { id },
      data,
      include: {
        product: { select: { id: true, name: true, sku: true } },
        supplier: { select: { id: true, name: true } },
        movements: { orderBy: { createdAt: 'desc' } },
      },
    })

    return NextResponse.json(updated)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
