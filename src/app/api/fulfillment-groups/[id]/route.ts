import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const group = await prisma.fulfillmentGroup.findUnique({ where: { id }, include: { stores: true } })
  if (!group) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(group)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const group = await prisma.fulfillmentGroup.update({ where: { id }, data: body })
  return NextResponse.json(group)
}
