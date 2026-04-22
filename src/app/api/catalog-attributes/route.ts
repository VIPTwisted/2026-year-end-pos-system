import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const attributes = await prisma.productAttribute.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { values: true } } },
  })
  return NextResponse.json(attributes)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, attrType, isRequired, sortOrder } = body
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })
  const attr = await prisma.productAttribute.create({
    data: { name, attrType: attrType ?? 'text', isRequired: isRequired ?? false, sortOrder: sortOrder ?? 0 },
  })
  return NextResponse.json(attr, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, ...data } = body
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const attr = await prisma.productAttribute.update({ where: { id }, data })
  return NextResponse.json(attr)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  await prisma.productAttribute.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
