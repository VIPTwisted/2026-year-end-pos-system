import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const active = searchParams.get('active')

  const where: Record<string, unknown> = {}
  if (type) where.componentType = type
  if (active !== null) where.isActive = active === 'true'

  const codes = await prisma.priceComponentCode.findMany({
    where,
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(codes)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { code, name, componentType, description, isActive } = body

  const cc = await prisma.priceComponentCode.create({
    data: {
      code,
      name,
      componentType: componentType ?? 'base',
      description: description || null,
      isActive: isActive !== false,
    },
  })
  return NextResponse.json(cc, { status: 201 })
}
