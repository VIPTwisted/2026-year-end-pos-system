import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string; oid: string }> }) {
  try {
    const { oid } = await params
    const order = await (prisma as any).plannedOrder.update({
      where: { id: oid },
      data: { status: 'firmed', firmedAt: new Date() },
    })
    return NextResponse.json(order)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
