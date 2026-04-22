import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const channel = await prisma.retailChannel.findUnique({
    where: { id },
    include: { languages: true, paymentAccounts: true },
  })
  if (!channel) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(channel)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const channel = await prisma.retailChannel.update({
    where: { id },
    data: body,
    include: { languages: true, paymentAccounts: true },
  })
  return NextResponse.json(channel)
}
