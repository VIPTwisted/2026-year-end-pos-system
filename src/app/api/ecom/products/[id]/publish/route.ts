import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await prisma.ecomProduct.update({
    where: { id },
    data: { status: 'active', publishedAt: new Date() },
  })
  return NextResponse.json(product)
}
