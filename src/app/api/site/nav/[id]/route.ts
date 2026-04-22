import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const item = await prisma.siteNavItem.findUnique({
    where: { id: params.id },
    include: { children: true, page: true },
  })
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(item)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const item = await prisma.siteNavItem.update({ where: { id: params.id }, data: body })
  return NextResponse.json(item)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.siteNavItem.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
