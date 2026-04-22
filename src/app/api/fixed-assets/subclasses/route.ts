import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const subclasses = await prisma.fixedAssetSubclass.findMany({
    orderBy: { code: 'asc' },
  })
  return NextResponse.json(subclasses)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  if (!body.code?.trim()) {
    return NextResponse.json({ error: 'code is required' }, { status: 400 })
  }
  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  const existing = await prisma.fixedAssetSubclass.findUnique({ where: { code: body.code.trim() } })
  if (existing) {
    return NextResponse.json({ error: `Subclass code "${body.code}" already exists` }, { status: 409 })
  }

  const subclass = await prisma.fixedAssetSubclass.create({
    data: {
      code: body.code.trim().toUpperCase(),
      name: body.name.trim(),
      classId: body.classId ?? null,
    },
  })

  return NextResponse.json(subclass, { status: 201 })
}
