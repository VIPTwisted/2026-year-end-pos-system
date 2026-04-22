import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const blocked = searchParams.get('blocked')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}
    if (blocked === 'false') where.blocked = false
    if (blocked === 'true') where.blocked = true

    const rows = await prisma.itemAttribute.findMany({
      where,
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(rows)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      name: string
      attributeType?: string
      unitOfMeasure?: string
      blocked?: boolean
    }

    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    const validTypes = ['Text', 'Integer', 'Decimal', 'Option']
    const attributeType = validTypes.includes(body.attributeType ?? '') ? body.attributeType! : 'Text'

    const row = await prisma.itemAttribute.create({
      data: {
        name: body.name.trim(),
        attributeType,
        unitOfMeasure: body.unitOfMeasure ?? null,
        blocked: body.blocked ?? false,
      },
    })

    return NextResponse.json(row, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
