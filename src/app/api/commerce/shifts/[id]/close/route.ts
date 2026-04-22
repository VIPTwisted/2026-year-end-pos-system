import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { blind, countedCash, notes } = body as {
      blind?: boolean
      countedCash?: number
      notes?: string
    }

    const shift = await prisma.cashShift.findUnique({
      where: { id },
      include: { tenders: true, safeDropEntries: true },
    })
    if (!shift) return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    if (shift.status !== 'open' && shift.status !== 'suspended') {
      return NextResponse.json({ error: 'Shift is already closed' }, { status: 400 })
    }

    const expectedCash =
      shift.openingFloat +
      shift.cashSales -
      shift.returns -
      shift.safeDrops -
      shift.bankDrops

    const finalCountedCash = blind ? null : (countedCash !== undefined ? parseFloat(String(countedCash)) : null)
    const variance = finalCountedCash !== null ? finalCountedCash - expectedCash : null

    const closed = await prisma.cashShift.update({
      where: { id },
      data: {
        status: blind ? 'blind_closed' : 'closed',
        closedAt: new Date(),
        expectedCash,
        countedCash: finalCountedCash,
        variance,
        notes: notes || shift.notes || null,
      },
      include: {
        register: { include: { channel: true } },
        tenders: true,
        safeDropEntries: { orderBy: { createdAt: 'desc' } },
      },
    })

    return NextResponse.json(closed)
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    }
    console.error('[shift close POST]', err)
    return NextResponse.json({ error: 'Failed to close shift' }, { status: 500 })
  }
}
