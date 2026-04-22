import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const attributes = await prisma.productVariantAttribute.findMany({
    include: { values: true },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(attributes)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  const attribute = await prisma.productVariantAttribute.create({
    data: {
      name: body.name,
      values: body.values
        ? {
            create: body.values.map((v: string) => ({ value: v })),
          }
        : undefined,
    },
    include: { values: true },
  })
  return NextResponse.json(attribute, { status: 201 })
}
