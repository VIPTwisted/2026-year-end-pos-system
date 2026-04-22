import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const shift = await prisma.cashShift.findUnique({
      where: { id },
      include: {
        register: { include: { channel: true } },
        tenders: true,
        safeDropEntries: { orderBy: { createdAt: 'desc' } },
      },
    })
    if (!shift) return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    return NextResponse.json(shift)
  } catch (err) {
    console.error('[shift GET]', err)
    return NextResponse.json({ error: 'Failed to fetch shift' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const {
      status,
      cashSales,
      cardSales,
      giftCardSales,
      returns,
      notes,
      countedCash,
      variance,
    } = body as {
      status?: string
      cashSales?: number
      cardSales?: number
      giftCardSales?: number
      returns?: number
      notes?: string
      countedCash?: number
      variance?: number
    }

    const shift = await prisma.cashShift.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(cashSales !== undefined && { cashSales }),
        ...(cardSales !== undefined && { cardSales }),
        ...(giftCardSales !== undefined && { giftCardSales }),
        ...(returns !== undefined && { returns }),
        ...(notes !== undefined && { notes }),
        ...(countedCash !== undefined && { countedCash }),
        ...(variance !== undefined && { variance }),
      },
      include: {
        register: { include: { channel: true } },
        tenders: true,
        safeDropEntries: { orderBy: { createdAt: 'desc' } },
      },
    })

    return NextResponse.json(shift)
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    }
    console.error('[shift PATCH]', err)
    return NextResponse.json({ error: 'Failed to update shift' }, { status: 500 })
  }
}
