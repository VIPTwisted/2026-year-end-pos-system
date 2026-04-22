import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const period = await prisma.fiscalPeriod.findUnique({ where: { id } })
    if (!period) return NextResponse.json({ error: 'Period not found' }, { status: 404 })
    if (period.status === 'closed') return NextResponse.json({ error: 'Period already closed' }, { status: 400 })
    const updated = await prisma.fiscalPeriod.update({
      where: { id },
      data: { status: 'closed', closedAt: new Date() },
    })
    return NextResponse.json(updated)
  } catch (err) {
    console.error('[periods close POST]', err)
    return NextResponse.json({ error: 'Failed to close period' }, { status: 500 })
  }
}
