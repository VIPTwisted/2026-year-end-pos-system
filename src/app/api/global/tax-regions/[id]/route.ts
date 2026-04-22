import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const region = await prisma.taxRegion.findUnique({
    where: { id },
    include: { codes: { orderBy: { createdAt: 'asc' } } },
  })
  if (!region) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(region)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const region = await prisma.taxRegion.update({ where: { id }, data: body })
  return NextResponse.json(region)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.taxRegion.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
