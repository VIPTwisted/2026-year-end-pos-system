import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const groups = await prisma.fixedAssetGroup.findMany({
    include: { assets: true },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(groups)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  if (!body.code?.trim()) {
    return NextResponse.json({ error: 'code is required' }, { status: 400 })
  }
  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  const existing = await prisma.fixedAssetGroup.findUnique({
    where: { code: body.code.trim().toUpperCase() },
  })
  if (existing) {
    return NextResponse.json(
      { error: `Group code "${body.code}" is already in use` },
      { status: 409 }
    )
  }

  const group = await prisma.fixedAssetGroup.create({
    data: {
      code: body.code.trim().toUpperCase(),
      name: body.name.trim(),
      depreciationMethod: body.depreciationMethod ?? 'straight_line',
      usefulLifeYears: typeof body.usefulLifeYears === 'number' ? body.usefulLifeYears : 5,
      salvageValuePct: typeof body.salvageValuePct === 'number' ? body.salvageValuePct : 0.1,
      glAssetAccountId: body.glAssetAccountId ?? null,
      glDeprecAccountId: body.glDeprecAccountId ?? null,
      glAccumAccountId: body.glAccumAccountId ?? null,
    },
  })

  return NextResponse.json(group, { status: 201 })
}
