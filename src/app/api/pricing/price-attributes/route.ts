import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const active = searchParams.get('active')

  const where: Record<string, unknown> = {}
  if (type) where.attributeType = type
  if (active !== null) where.isActive = active === 'true'

  const attrs = await prisma.priceAttribute.findMany({
    where,
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  })
  return NextResponse.json(attrs)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { code, name, attributeType, dataType, optionsJson, isActive, sortOrder, description } = body

  const attr = await prisma.priceAttribute.create({
    data: {
      code,
      name,
      attributeType: attributeType ?? 'product',
      dataType: dataType ?? 'text',
      optionsJson: optionsJson ?? null,
      isActive: isActive !== false,
      sortOrder: sortOrder ?? 0,
      description: description || null,
    },
  })
  return NextResponse.json(attr, { status: 201 })
}
