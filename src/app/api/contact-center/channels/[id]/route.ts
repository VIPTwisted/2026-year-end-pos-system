import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const channel = await prisma.contactChannel.findUnique({
    where: { id },
    include: { _count: { select: { conversations: true } } },
  })
  if (!channel) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(channel)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const channel = await prisma.contactChannel.update({
    where: { id },
    data: {
      name: body.name,
      isActive: body.isActive,
      config: body.config ?? undefined,
    },
  })
  return NextResponse.json(channel)
}
