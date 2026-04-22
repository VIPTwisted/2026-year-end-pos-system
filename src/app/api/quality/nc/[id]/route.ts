import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const nc = await prisma.nonConformance.findUnique({
    where: { id },
    include: {
      correctiveActions: { orderBy: { createdAt: 'asc' } },
      order: { select: { id: true, orderNumber: true, productName: true, status: true } },
    },
  })
  if (!nc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(nc)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { status, disposition, assignedTo, closedAt } = body

  const updated = await prisma.nonConformance.update({
    where: { id },
    data: {
      ...(status ? { status } : {}),
      ...(disposition !== undefined ? { disposition } : {}),
      ...(assignedTo !== undefined ? { assignedTo } : {}),
      ...(closedAt ? { closedAt: new Date(closedAt) } : {}),
      ...(status === 'closed' && !closedAt ? { closedAt: new Date() } : {}),
    },
    include: { correctiveActions: true },
  })

  return NextResponse.json(updated)
}
