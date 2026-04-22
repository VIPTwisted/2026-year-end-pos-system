import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const search = sp.get('search') ?? ''
    const activeOnly = sp.get('activeOnly') === 'true'

    const where: Record<string, unknown> = {}
    if (activeOnly) where.isActive = true
    if (search.trim()) {
      where.OR = [
        { code: { contains: search } },
        { name: { contains: search } },
        { email: { contains: search } },
      ]
    }

    const salespeople = await prisma.salesperson.findMany({
      where,
      orderBy: { code: 'asc' },
      include: {
        territory: { select: { id: true, code: true, name: true } },
        employee: { select: { id: true, firstName: true, lastName: true, position: true } },
      },
    })

    return NextResponse.json(salespeople)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { code, name, email, phone, employeeId, territoryId, commissionPct, isActive } = body

    if (!code || !name) {
      return NextResponse.json({ error: 'code and name are required' }, { status: 400 })
    }

    const salesperson = await prisma.salesperson.create({
      data: {
        code: code.toUpperCase(),
        name,
        email: email || null,
        phone: phone || null,
        employeeId: employeeId || null,
        territoryId: territoryId || null,
        commissionPct: commissionPct ?? 0,
        isActive: isActive ?? true,
      },
      include: {
        territory: { select: { id: true, code: true, name: true } },
        employee: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return NextResponse.json(salesperson, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
