import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/finance/cost-accounting/categories
export async function GET() {
  const categories = await prisma.costCategory.findMany({
    where: { isActive: true },
    orderBy: { code: 'asc' },
  })
  return NextResponse.json(categories)
}

// POST /api/finance/cost-accounting/categories
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { code, name, type, description, isActive = true } = body

    if (!code || !name) {
      return NextResponse.json(
        { error: 'code and name are required' },
        { status: 400 }
      )
    }

    const validTypes = ['personnel', 'overhead', 'materials', 'services', 'capex']
    if (type && !validTypes.includes(type)) {
      return NextResponse.json(
        { error: `type must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    const category = await prisma.costCategory.create({
      data: {
        code,
        name,
        type: type ?? 'overhead',
        description: description ?? null,
        isActive: Boolean(isActive),
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    if (msg.includes('Unique constraint')) {
      return NextResponse.json({ error: 'A cost category with that code already exists.' }, { status: 409 })
    }
    console.error('[POST /api/finance/cost-accounting/categories]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
