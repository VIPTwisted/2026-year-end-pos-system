import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sale = await prisma.flashSale.update({
    where: { id },
    data: { status: 'ended', endedAt: new Date() },
  })
  return NextResponse.json(sale)
}
