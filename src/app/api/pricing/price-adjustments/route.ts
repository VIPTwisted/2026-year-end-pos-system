import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const adjustments = await prisma.priceAdjustment.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(adjustments)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const adjustment = await prisma.priceAdjustment.create({ data: body })
  return NextResponse.json(adjustment, { status: 201 })
}
