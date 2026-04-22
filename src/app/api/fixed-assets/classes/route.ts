import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const classes = await prisma.fixedAssetClass.findMany({
    include: {
      _count: { select: { assets: true } },
    },
    orderBy: { code: 'asc' },
  })
  return NextResponse.json(classes)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  if (!body.code?.trim()) {
    return NextResponse.json({ error: 'code is required' }, { status: 400 })
  }
  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  const existing = await prisma.fixedAssetClass.findUnique({ where: { code: body.code.trim() } })
  if (existing) {
    return NextResponse.json({ error: `Class code "${body.code}" already exists` }, { status: 409 })
  }

  const cls = await prisma.fixedAssetClass.create({
    data: {
      code: body.code.trim().toUpperCase(),
      name: body.name.trim(),
      description: body.description ?? null,
    },
  })

  return NextResponse.json(cls, { status: 201 })
}
