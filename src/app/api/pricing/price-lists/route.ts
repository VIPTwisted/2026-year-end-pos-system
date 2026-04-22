import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const search = sp.get('search') ?? ''
    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { code: { contains: search } },
          ],
        }
      : {}

    const lists = await prisma.priceList.findMany({
      where,
      include: {
        customerGroup: { select: { id: true, name: true } },
        customer: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { lines: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const [total, active, groupAssigned, customerAssigned] = await Promise.all([
      prisma.priceList.count(),
      prisma.priceList.count({ where: { isActive: true } }),
      prisma.priceList.count({ where: { customerGroupId: { not: null } } }),
      prisma.priceList.count({ where: { customerId: { not: null } } }),
    ])

    return NextResponse.json({ lists, stats: { total, active, groupAssigned, customerAssigned } })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      name: string
      code: string
      currency?: string
      customerGroupId?: string
      customerId?: string
      startDate?: string
      endDate?: string
      isActive?: boolean
      notes?: string
    }

    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    if (!body.code?.trim()) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }

    const priceList = await prisma.priceList.create({
      data: {
        name: body.name.trim(),
        code: body.code.trim().toUpperCase(),
        currency: body.currency ?? 'USD',
        customerGroupId: body.customerGroupId || null,
        customerId: body.customerId || null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        isActive: body.isActive ?? true,
        notes: body.notes?.trim() || null,
      },
    })

    return NextResponse.json(priceList, { status: 201 })
  } catch (e) {
    console.error(e)
    const msg = e instanceof Error && e.message.includes('Unique constraint')
      ? 'A price list with that code already exists'
      : 'Internal server error'
    return NextResponse.json({ error: msg }, { status: msg.includes('code') ? 409 : 500 })
  }
}
