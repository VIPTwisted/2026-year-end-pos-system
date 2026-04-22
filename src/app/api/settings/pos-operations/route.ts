import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const countOnly = searchParams.get('count') === 'true'

    if (countOnly) {
      const count = await prisma.pOSOperation.count()
      return NextResponse.json({ count })
    }

    const where: Record<string, unknown> = {}

    if (category && category !== 'All') {
      where.category = category
    }

    if (search) {
      where.OR = [
        { operationName: { contains: search } },
        { operationId: { equals: parseInt(search) || undefined } },
      ]
    }

    const operations = await prisma.pOSOperation.findMany({
      where,
      orderBy: [{ category: 'asc' }, { operationId: 'asc' }],
    })

    return NextResponse.json(operations)
  } catch (error) {
    console.error('GET /api/settings/pos-operations error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch POS operations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { operationId, operationName, description, category, requiresManager, allowWithoutDrawer, notes } = body

    if (!operationId || !operationName || !category) {
      return NextResponse.json(
        { error: 'operationId, operationName, and category are required' },
        { status: 400 }
      )
    }

    const existing = await prisma.pOSOperation.findUnique({
      where: { operationId: parseInt(operationId) },
    })

    if (existing) {
      return NextResponse.json(
        { error: `Operation ID ${operationId} already exists` },
        { status: 409 }
      )
    }

    const operation = await prisma.pOSOperation.create({
      data: {
        operationId: parseInt(operationId),
        operationName,
        description: description ?? null,
        category,
        requiresManager: requiresManager ?? false,
        allowWithoutDrawer: allowWithoutDrawer ?? false,
        isActive: true,
        isBuiltIn: false,
        notes: notes ?? null,
      },
    })

    return NextResponse.json(operation, { status: 201 })
  } catch (error) {
    console.error('POST /api/settings/pos-operations error:', error)
    return NextResponse.json(
      { error: 'Failed to create POS operation' },
      { status: 500 }
    )
  }
}
