import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const event = await prisma.lifeEvent.findUnique({ where: { id } })
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(event)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const data: Record<string, unknown> = {}
  if (body.action === 'process') {
    data.status = 'processed'
    data.processedAt = new Date()
    data.processedBy = body.processedBy ?? 'System'
  } else if (body.action === 'deny') {
    data.status = 'denied'
    data.processedAt = new Date()
    data.processedBy = body.processedBy ?? 'System'
    data.notes = body.notes ?? null
  } else {
    if (body.status) data.status = body.status
    if (body.notes) data.notes = body.notes
  }
  const event = await prisma.lifeEvent.update({ where: { id }, data })
  return NextResponse.json(event)
}
