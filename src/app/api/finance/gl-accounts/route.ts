import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const typeFilter = sp.get('type')

    const accounts = await prisma.account.findMany({
      where: typeFilter ? { type: typeFilter } : undefined,
      orderBy: { code: 'asc' },
      select: {
        id: true,
        code: true,
        name: true,
        type: true,
        subtype: true,
        mainAccountType: true,
        balance: true,
        isActive: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ accounts })
  } catch (err) {
    console.error('[GET /api/finance/gl-accounts]', err)
    return NextResponse.json({ error: 'Failed to load GL accounts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      code: string
      name: string
      type: string
      subtype?: string
      mainAccountType?: string
    }

    const { code, name, type, subtype, mainAccountType } = body

    if (!code || !name || !type) {
      return NextResponse.json({ error: 'code, name, and type are required' }, { status: 400 })
    }

    const validTypes = ['asset', 'liability', 'equity', 'revenue', 'expense']
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: `type must be one of: ${validTypes.join(', ')}` }, { status: 400 })
    }

    // Enforce unique code
    const existing = await prisma.account.findUnique({ where: { code } })
    if (existing) {
      return NextResponse.json({ error: `Account code "${code}" is already in use` }, { status: 409 })
    }

    const account = await prisma.account.create({
      data: {
        code,
        name,
        type,
        subtype: subtype ?? null,
        mainAccountType: mainAccountType ?? null,
      },
    })

    return NextResponse.json({ account }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/finance/gl-accounts]', err)
    return NextResponse.json({ error: 'Failed to create GL account' }, { status: 500 })
  }
}
