import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const groups = await prisma.customerGroup.findMany({
      include: {
        _count: { select: { customers: true, pricingRules: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(groups)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      name: string
      description?: string
      discountPct?: number
      isActive?: boolean
    }
    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }
    const group = await prisma.customerGroup.create({
      data: {
        name: body.name.trim(),
        description: body.description?.trim() ?? undefined,
        discountPct: body.discountPct ?? 0,
        isActive: body.isActive ?? true,
      },
    })
    return NextResponse.json(group, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
