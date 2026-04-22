import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const view = searchParams.get('view') // 'groups' | 'rules'

    if (view === 'rules') {
      const rules = await prisma.priceAdjustment.findMany({
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json(rules)
    }

    // Default: price groups
    const groups = await prisma.priceGroup.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { discounts: true } },
      },
    })
    return NextResponse.json(groups)
  } catch (err) {
    console.error('[commerce/pricing GET]', err)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { view = 'group' } = body as { view?: string }

    if (view === 'rule') {
      const {
        name, productId, categoryId, priceGroupId,
        adjustType = 'percent', adjustValue, startDate, endDate, isActive = true,
      } = body as {
        name: string; productId?: string; categoryId?: string; priceGroupId?: string
        adjustType?: string; adjustValue: number; startDate?: string; endDate?: string; isActive?: boolean
      }
      if (!name?.trim()) return NextResponse.json({ error: 'name is required' }, { status: 400 })
      if (adjustValue === undefined) return NextResponse.json({ error: 'adjustValue is required' }, { status: 400 })
      const rule = await prisma.priceAdjustment.create({
        data: {
          name: name.trim(),
          productId: productId || null,
          categoryId: categoryId || null,
          priceGroupId: priceGroupId || null,
          adjustType,
          adjustValue: Number(adjustValue),
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          isActive,
        },
      })
      return NextResponse.json(rule, { status: 201 })
    }

    // Default: create price group
    const { code, name, description } = body as {
      code: string; name: string; description?: string
    }
    if (!code?.trim()) return NextResponse.json({ error: 'code is required' }, { status: 400 })
    if (!name?.trim()) return NextResponse.json({ error: 'name is required' }, { status: 400 })

    const group = await prisma.priceGroup.create({
      data: {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        description: description || null,
        isActive: true,
      },
    })
    return NextResponse.json(group, { status: 201 })
  } catch (err: unknown) {
    const e = err as { code?: string }
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'Code already exists' }, { status: 409 })
    }
    console.error('[commerce/pricing POST]', err)
    return NextResponse.json({ error: 'Failed to create record' }, { status: 500 })
  }
}
