import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const assortment = await prisma.assortment.update({
    where: { id },
    data: { status: 'expired' },
  })
  return NextResponse.json(assortment)
}
