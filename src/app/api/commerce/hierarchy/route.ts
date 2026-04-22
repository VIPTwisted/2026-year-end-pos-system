import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.productCategory.findMany({
      orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        children: {
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
          include: {
            children: {
              orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
              include: {
                _count: { select: { products: true } },
              },
            },
            _count: { select: { products: true } },
          },
        },
        _count: { select: { products: true } },
      },
    })
    const roots = categories.filter(c => !c.parentId)
    return NextResponse.json(roots)
  } catch (err) {
    console.error('[commerce/hierarchy GET]', err)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, slug, parentId, color, icon, sortOrder = 0 } = body as {
      name: string
      slug: string
      parentId?: string
      color?: string
      icon?: string
      sortOrder?: number
    }

    if (!name?.trim()) return NextResponse.json({ error: 'name is required' }, { status: 400 })
    if (!slug?.trim()) return NextResponse.json({ error: 'slug is required' }, { status: 400 })

    const category = await prisma.productCategory.create({
      data: {
        name: name.trim(),
        slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
        parentId: parentId || null,
        color: color || null,
        icon: icon || null,
        sortOrder,
        isActive: true,
      },
    })
    return NextResponse.json(category, { status: 201 })
  } catch (err: unknown) {
    const e = err as { code?: string }
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }
    console.error('[commerce/hierarchy POST]', err)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
