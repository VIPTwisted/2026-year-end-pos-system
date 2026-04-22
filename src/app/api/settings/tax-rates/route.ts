import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const taxCodes = await prisma.taxCode.findMany({
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(taxCodes)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      code: string
      name: string
      rate: number
      taxType?: string
      description?: string
      isActive?: boolean
    }

    if (!body.code || !body.name || body.rate === undefined) {
      return NextResponse.json({ error: 'code, name, and rate are required' }, { status: 400 })
    }

    const taxCode = await prisma.taxCode.create({
      data: {
        code:        body.code,
        name:        body.name,
        rate:        Number(body.rate),
        taxType:     body.taxType ?? 'sales',
        description: body.description ?? null,
        isActive:    body.isActive ?? true,
      },
    })

    return NextResponse.json(taxCode, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
