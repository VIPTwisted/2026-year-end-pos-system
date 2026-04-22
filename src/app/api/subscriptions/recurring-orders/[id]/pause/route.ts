import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await prisma.recurringOrder.update({
    where: { id },
    data: { status: 'paused' },
  })
  return NextResponse.json(order)
}
