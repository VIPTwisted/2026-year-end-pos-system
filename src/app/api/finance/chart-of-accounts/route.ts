import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const search = searchParams.get('search')

  const accounts = await prisma.account.findMany({
    where: {
      ...(type ? { type } : {}),
      ...(search ? {
        OR: [
          { code: { contains: search } },
          { name: { contains: search } },
        ],
      } : {}),
    },
    orderBy: { code: 'asc' },
  })

  return NextResponse.json(accounts)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  if (!body.code?.trim()) {
    return NextResponse.json({ error: 'code (No.) is required' }, { status: 400 })
  }
  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }
  if (!body.type) {
    return NextResponse.json({ error: 'type is required' }, { status: 400 })
  }

  // Check uniqueness
  const existing = await prisma.account.findUnique({ where: { code: body.code.trim() } })
  if (existing) {
    return NextResponse.json({ error: `Account No. "${body.code}" is already in use` }, { status: 409 })
  }

  const account = await prisma.account.create({
    data: {
      code: body.code.trim(),
      name: body.name.trim(),
      type: body.type,
      subtype: body.subtype?.trim() || null,
      mainAccountType: body.mainAccountType ?? null,
      openingAccountId: body.openingAccountId ?? null,
      balance: typeof body.balance === 'number' ? body.balance : 0,
      isActive: typeof body.isActive === 'boolean' ? body.isActive : true,
    },
  })

  return NextResponse.json(account, { status: 201 })
}
