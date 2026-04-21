import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const serviceCase = await prisma.serviceCase.findUnique({
    where: { id },
    include: {
      customer: true,
      notes: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!serviceCase) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 })
  }

  return NextResponse.json(serviceCase)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const { status, assignedTo } = body

  const existing = await prisma.serviceCase.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 })
  }

  const resolvedAt =
    status === 'resolved' && existing.status !== 'resolved'
      ? new Date()
      : status && status !== 'resolved'
      ? null
      : undefined

  const serviceCase = await prisma.serviceCase.update({
    where: { id },
    data: {
      ...(status !== undefined ? { status } : {}),
      ...(assignedTo !== undefined ? { assignedTo } : {}),
      ...(resolvedAt !== undefined ? { resolvedAt } : {}),
    },
    include: {
      customer: true,
      notes: { orderBy: { createdAt: 'asc' } },
    },
  })

  return NextResponse.json(serviceCase)
}
