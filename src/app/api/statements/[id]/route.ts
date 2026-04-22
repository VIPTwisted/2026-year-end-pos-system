import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const statement = await prisma.retailStatement.findUnique({
    where: { id },
    include: {
      store: true,
      tenderLines: true,
    },
  })
  if (!statement) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(statement)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const statement = await prisma.retailStatement.update({ where: { id }, data: body })
  return NextResponse.json(statement)
}
