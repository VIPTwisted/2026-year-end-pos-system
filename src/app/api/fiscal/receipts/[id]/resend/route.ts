import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const existing = await prisma.electronicReceipt.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const receipt = await prisma.electronicReceipt.update({
      where: { id },
      data: { status: 'pending', sentAt: null, deliveredAt: null },
    })
    return NextResponse.json(receipt)
  } catch (error) {
    console.error('[POST /api/fiscal/receipts/[id]/resend]', error)
    return NextResponse.json({ error: 'Failed to queue resend' }, { status: 500 })
  }
}
