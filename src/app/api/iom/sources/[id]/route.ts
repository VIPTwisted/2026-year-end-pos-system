import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const group = await prisma.fulfillmentGroup.findUnique({
    where: { id: params.id },
    include: {
      stores: { orderBy: { priority: 'asc' } },
      _count: { select: { stores: true } },
    },
  })
  if (!group) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(group)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json()
  const group = await prisma.fulfillmentGroup.update({
    where: { id: params.id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
      ...(body.fulfillmentType !== undefined ? { fulfillmentType: body.fulfillmentType } : {}),
      ...(body.sourceChannelName !== undefined ? { sourceChannelName: body.sourceChannelName } : {}),
    },
    include: {
      stores: { orderBy: { priority: 'asc' } },
      _count: { select: { stores: true } },
    },
  })
  return NextResponse.json(group)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.fulfillmentGroup.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
