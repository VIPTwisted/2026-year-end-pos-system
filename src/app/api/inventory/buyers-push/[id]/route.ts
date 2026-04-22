import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const p = await prisma.buyersPush.findUnique({ where: { id }, include: { lines: true } })
  if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(p)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const p = await prisma.buyersPush.update({ where: { id }, data: body })
  return NextResponse.json(p)
}
