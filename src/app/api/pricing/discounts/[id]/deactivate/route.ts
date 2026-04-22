import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const discount = await prisma.discount.update({
    where: { id },
    data: { status: 'inactive' },
  })
  return NextResponse.json(discount)
}
