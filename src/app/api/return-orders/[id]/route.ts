import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ret = await prisma.returnOrder.findUnique({
    where: { id },
    include: { lines: true },
  })
  if (!ret) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(ret)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const ret = await prisma.returnOrder.update({
    where: { id },
    data: body,
    include: { lines: true },
  })
  return NextResponse.json(ret)
}
