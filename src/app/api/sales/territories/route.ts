import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const search = sp.get('search') ?? ''

    const where = search.trim()
      ? {
          OR: [
            { code: { contains: search } },
            { name: { contains: search } },
            { region: { contains: search } },
          ],
        }
      : undefined

    const territories = await prisma.salesTerritory.findMany({
      where,
      orderBy: { code: 'asc' },
      include: {
        _count: { select: { salespeople: true } },
      },
    })

    return NextResponse.json(territories)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { code, name, description, region, isActive } = body

    if (!code || !name) {
      return NextResponse.json({ error: 'code and name are required' }, { status: 400 })
    }

    const territory = await prisma.salesTerritory.create({
      data: { code: code.toUpperCase(), name, description, region, isActive: isActive ?? true },
    })

    return NextResponse.json(territory, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
