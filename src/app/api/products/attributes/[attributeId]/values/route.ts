import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Ctx = { params: Promise<{ attributeId: string }> }

export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const { attributeId } = await params
    const body = await req.json() as { value: string }
    if (!body.value?.trim()) {
      return NextResponse.json({ error: 'Value is required' }, { status: 400 })
    }

    const attrValue = await prisma.productVariantAttributeValue.create({
      data: {
        attributeId,
        value: body.value.trim(),
      },
    })
    return NextResponse.json(attrValue, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
