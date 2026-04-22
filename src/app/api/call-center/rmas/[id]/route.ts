import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const rma = await prisma.callCenterRMA.findUnique({
    where: { id },
    include: { order: { select: { orderNumber: true, agentName: true, customerId: true } } },
  })
  if (!rma) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(rma)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const data: Record<string, unknown> = { ...body }
  if (body.status === 'processed') data.processedAt = new Date()
  const rma = await prisma.callCenterRMA.update({ where: { id }, data })
  return NextResponse.json(rma)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.callCenterRMA.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
