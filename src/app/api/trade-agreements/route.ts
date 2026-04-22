import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const isActive = searchParams.get('isActive')

  const agreements = await prisma.tradeAgreement.findMany({
    where: {
      ...(type ? { type } : {}),
      ...(isActive !== null ? { isActive: isActive === 'true' } : {}),
    },
    include: {
      customer: { select: { id: true, firstName: true, lastName: true } },
      vendor: { select: { id: true, name: true } },
      _count: { select: { lines: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(agreements)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const agreement = await prisma.tradeAgreement.create({ data: body })
  return NextResponse.json(agreement, { status: 201 })
}
