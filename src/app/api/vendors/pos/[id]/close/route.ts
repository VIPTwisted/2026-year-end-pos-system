import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await prisma.vendorPO.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'PO not found' }, { status: 404 })
    }
    if (existing.status === 'cancelled') {
      return NextResponse.json({ error: 'Cannot close a cancelled PO' }, { status: 400 })
    }

    const po = await prisma.vendorPO.update({
      where: { id },
      data: { status: 'closed' },
    })

    return NextResponse.json(po)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to close PO' }, { status: 500 })
  }
}
