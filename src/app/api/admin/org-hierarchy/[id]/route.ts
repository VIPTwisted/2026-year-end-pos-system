import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const unit = await prisma.orgUnit.findUnique({
    where: { id: params.id },
    include: { children: true },
  })
  if (!unit) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(unit)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const unit = await prisma.orgUnit.update({
    where: { id: params.id },
    data: body,
  })
  return NextResponse.json(unit)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  // Unparent children first
  await prisma.orgUnit.updateMany({
    where: { parentId: params.id },
    data: { parentId: null },
  })
  await prisma.orgUnit.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
