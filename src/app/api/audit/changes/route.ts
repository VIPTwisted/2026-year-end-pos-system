import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const entityType = searchParams.get('entityType')
  const entityId = searchParams.get('entityId')
  const field = searchParams.get('field')
  const changedBy = searchParams.get('changedBy')
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const take = Math.min(parseInt(searchParams.get('take') ?? '200'), 500)
  const skip = parseInt(searchParams.get('skip') ?? '0')

  const where: Record<string, unknown> = {}
  if (entityType) where.entityType = entityType
  if (entityId) where.entityId = entityId
  if (field) where.field = field
  if (changedBy) where.changedBy = changedBy
  if (from || to) {
    where.createdAt = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    }
  }

  const [changes, total] = await Promise.all([
    prisma.changeLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    }),
    prisma.changeLog.count({ where }),
  ])

  return NextResponse.json({ changes, total, take, skip })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { entityType, entityId, field, oldValue, newValue, changedBy, reason } = body

  if (!entityType || !entityId || !field) {
    return NextResponse.json({ error: 'entityType, entityId, field are required' }, { status: 400 })
  }

  const change = await prisma.changeLog.create({
    data: {
      entityType,
      entityId,
      field,
      oldValue: oldValue ?? null,
      newValue: newValue ?? null,
      changedBy: changedBy ?? null,
      reason: reason ?? null,
    },
  })

  return NextResponse.json(change, { status: 201 })
}
