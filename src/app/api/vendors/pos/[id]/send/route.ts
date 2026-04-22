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
    if (existing.status !== 'draft') {
      return NextResponse.json({ error: 'Only draft POs can be sent' }, { status: 400 })
    }

    const po = await prisma.vendorPO.update({
      where: { id },
      data: { status: 'sent' },
    })

    return NextResponse.json(po)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to send PO' }, { status: 500 })
  }
}
