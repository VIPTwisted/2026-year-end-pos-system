import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const mapping = await prisma.dualWriteMapping.findUnique({ where: { id: params.id } })
  if (!mapping) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(mapping)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const statusMap: Record<string, string> = { start: 'running', pause: 'paused', stop: 'stopped' }
  const data: Record<string, unknown> = { ...body }
  if (body._action && statusMap[body._action]) {
    data.status = statusMap[body._action]
    if (body._action === 'start') data.lastSyncAt = new Date()
    delete data._action
  }
  const mapping = await prisma.dualWriteMapping.update({ where: { id: params.id }, data })
  return NextResponse.json(mapping)
}
