import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const dashboard = await prisma.dashboard.findUnique({
    where: { id },
    include: { widgets: { orderBy: { position: 'asc' } } },
  })
  if (!dashboard) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(dashboard)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const dashboard = await prisma.dashboard.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.isDefault !== undefined && { isDefault: body.isDefault }),
      ...(body.layout !== undefined && { layout: body.layout }),
    },
    include: { widgets: { orderBy: { position: 'asc' } } },
  })
  return NextResponse.json(dashboard)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.dashboard.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
