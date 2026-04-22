import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const s = await prisma.inboundShipment.findUnique({ where: { id }, include: { lines: true, crossDockLines: true } })
  if (!s) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(s)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const s = await prisma.inboundShipment.update({ where: { id }, data: body })
  return NextResponse.json(s)
}
