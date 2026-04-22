import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await prisma.chatSession.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  })
  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(session)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const session = await prisma.chatSession.update({
    where: { id },
    data: body,
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  })
  return NextResponse.json(session)
}
