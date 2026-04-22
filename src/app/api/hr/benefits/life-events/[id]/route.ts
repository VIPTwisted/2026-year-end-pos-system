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
  } else if (body.action === 'approve') {
    data.status = 'approved'
    data.processedAt = new Date()
    data.processedBy = body.processedBy ?? 'System'
  } else if (body.action === 'expire') {
    data.status = 'expired'
    data.processedAt = new Date()
    data.processedBy = body.processedBy ?? 'System'
  } else if (body.action === 'deny') {
    data.status = 'denied'
    data.processedAt = new Date()
    data.processedBy = body.processedBy ?? 'System'
  } else {
    if (body.status) data.status = body.status
    if (body.changesJson !== undefined) data.changesJson = body.changesJson
    if (body.processedBy) data.processedBy = body.processedBy
  }
  const event = await prisma.lifeEvent.update({ where: { id }, data })
  return NextResponse.json(event)
}
