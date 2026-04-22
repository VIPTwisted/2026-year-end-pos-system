import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const p = await prisma.dayEndProcedure.findUnique({ where: { id } })
  if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(p)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const p = await prisma.dayEndProcedure.update({ where: { id }, data: body })
  return NextResponse.json(p)
}
