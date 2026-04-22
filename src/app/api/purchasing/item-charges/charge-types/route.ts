import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest) {
  try {
    const types = await prisma.itemChargeType.findMany({
      orderBy: { code: 'asc' },
    })
    return NextResponse.json(types)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      code: string
      name: string
      description?: string
      glAccountId?: string
      isActive?: boolean
    }
    const { code, name, description, glAccountId, isActive } = body

    if (!code || !name) {
      return NextResponse.json({ error: 'code and name are required' }, { status: 400 })
    }

    const chargeType = await prisma.itemChargeType.create({
      data: {
        code: code.toUpperCase().trim(),
        name: name.trim(),
        description: description?.trim() || null,
        glAccountId: glAccountId || null,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json(chargeType, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
