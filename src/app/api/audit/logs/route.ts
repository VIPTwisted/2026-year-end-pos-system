import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tableName = searchParams.get('table')
  const action = searchParams.get('action')
  const userId = searchParams.get('userId')
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const take = Math.min(parseInt(searchParams.get('take') ?? '200'), 500)
  const skip = parseInt(searchParams.get('skip') ?? '0')

  const where: Record<string, unknown> = {}
  if (tableName) where.tableName = tableName
  if (action) where.action = action
  if (userId) where.userId = userId
  if (from || to) {
    where.createdAt = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    }
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    }),
    prisma.auditLog.count({ where }),
  ])

  return NextResponse.json({ logs, total, take, skip })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { tableName, recordId, action, userId, userEmail, changedFields, metadata } = body

  if (!tableName || !recordId || !action) {
    return NextResponse.json({ error: 'tableName, recordId, action are required' }, { status: 400 })
  }

  const log = await prisma.auditLog.create({
    data: {
      tableName,
      recordId,
      action,
      userId: userId ?? null,
      userEmail: userEmail ?? null,
      changedFields: changedFields ?? null,
      metadata: metadata ?? null,
    },
  })

  return NextResponse.json(log, { status: 201 })
}
