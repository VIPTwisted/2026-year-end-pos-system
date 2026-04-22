import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const t = await prisma.outboundTransfer.findUnique({ where: { id }, include: { lines: true } })
  if (!t) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(t)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const t = await prisma.outboundTransfer.update({ where: { id }, data: body })
  return NextResponse.json(t)
}
