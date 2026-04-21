import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/finance/cost-accounting/centers
export async function GET() {
  const centers = await prisma.costCenter.findMany({
    include: { _count: { select: { entries: true } } },
    orderBy: { code: 'asc' },
  })
  return NextResponse.json(centers)
}

// POST /api/finance/cost-accounting/centers
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { code, name, type, description, managerId, isActive = true } = body

    if (!code || !name) {
      return NextResponse.json(
        { error: 'code and name are required' },
        { status: 400 }
      )
    }

    const validTypes = ['department', 'project', 'region', 'product_line']
    if (type && !validTypes.includes(type)) {
      return NextResponse.json(
        { error: `type must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    const center = await prisma.costCenter.create({
      data: {
        code,
        name,
        type: type ?? 'department',
        description: description ?? null,
        managerId: managerId ?? null,
        isActive: Boolean(isActive),
      },
    })

    return NextResponse.json(center, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    if (msg.includes('Unique constraint')) {
      return NextResponse.json({ error: 'A cost center with that code already exists.' }, { status: 409 })
    }
    console.error('[POST /api/finance/cost-accounting/centers]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
