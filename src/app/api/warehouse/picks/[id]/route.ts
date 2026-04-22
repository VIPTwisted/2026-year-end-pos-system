import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const pick = await prisma.warehousePick.findUnique({
    where: { id },
    include: {
      store: { select: { id: true, name: true } },
      lines: {
        include: { product: { select: { name: true, sku: true } } },
        orderBy: { lineNo: 'asc' },
      },
    },
  })
  if (!pick) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(pick)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { status, assignedUserId, completedAt } = body

  const data: Record<string, unknown> = {}
  if (status) data.status = status
  if (assignedUserId !== undefined) data.assignedUserId = assignedUserId
  if (completedAt !== undefined) data.completedAt = completedAt ? new Date(completedAt) : null

  const pick = await prisma.warehousePick.update({ where: { id }, data })
  return NextResponse.json(pick)
}
