import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const parentId = searchParams.get('parentId')

    const categories = await prisma.itemCategory.findMany({
      where: parentId ? { parentId } : {},
      include: {
        parent: { select: { id: true, code: true } },
        _count: { select: { children: true } },
      },
      orderBy: [{ indentationLevel: 'asc' }, { code: 'asc' }],
    })
    return NextResponse.json(categories)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      code: string
      description?: string
      parentId?: string
      defCostingMethod?: string
      defGenProdPostingGroup?: string
    }

    if (!body.code?.trim()) {
      return NextResponse.json({ error: 'code is required' }, { status: 400 })
    }

    // Calculate indentation level
    let indentationLevel = 0
    if (body.parentId) {
      const parent = await prisma.itemCategory.findUnique({
        where: { id: body.parentId },
        select: { indentationLevel: true },
      })
      indentationLevel = (parent?.indentationLevel ?? 0) + 1
    }

    const category = await prisma.itemCategory.create({
      data: {
        code: body.code.trim().toUpperCase(),
        description: body.description ?? null,
        parentId: body.parentId ?? null,
        defCostingMethod: body.defCostingMethod ?? 'FIFO',
        defGenProdPostingGroup: body.defGenProdPostingGroup ?? null,
        indentationLevel,
        isActive: true,
      },
      include: {
        parent: { select: { id: true, code: true } },
      },
    })
    return NextResponse.json(category, { status: 201 })
  } catch (e: unknown) {
    console.error(e)
    const msg = e instanceof Error && e.message.includes('Unique constraint') ? 'Category code already exists' : 'Internal server error'
    return NextResponse.json({ error: msg }, { status: msg.includes('already') ? 409 : 500 })
  }
}
