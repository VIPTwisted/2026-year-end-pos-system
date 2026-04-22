import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest) {
  try {
    const attributes = await prisma.productVariantAttribute.findMany({
      include: {
        values: {
          orderBy: { value: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(attributes)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { productId: string; name: string; values?: string[] }
    if (!body.productId || !body.name?.trim()) {
      return NextResponse.json({ error: 'productId and name are required' }, { status: 400 })
    }

    const attribute = await prisma.productVariantAttribute.create({
      data: {
        productId: body.productId,
        name: body.name.trim(),
        values: body.values && body.values.length > 0
          ? {
              create: body.values
                .map((v: string) => v.trim())
                .filter((v: string) => v.length > 0)
                .map((value: string) => ({ value })),
            }
          : undefined,
      },
      include: { values: { orderBy: { value: 'asc' } } },
    })
    return NextResponse.json(attribute, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
