import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const actions = await prisma.correctiveAction.findMany({
    where: { ncId: id },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(actions)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { action, assignedTo, dueDate, notes } = body

  if (!action) {
    return NextResponse.json({ error: 'action is required' }, { status: 400 })
  }

  const nc = await prisma.nonConformance.findUnique({ where: { id } })
  if (!nc) return NextResponse.json({ error: 'NC not found' }, { status: 404 })

  const ca = await prisma.correctiveAction.create({
    data: {
      ncId: id,
      action,
      assignedTo: assignedTo ?? null,
      dueDate: dueDate ? new Date(dueDate) : null,
      notes: notes ?? null,
      status: 'open',
    },
  })

  if (nc.status === 'open') {
    await prisma.nonConformance.update({ where: { id }, data: { status: 'corrective-action' } })
  }

  return NextResponse.json(ca, { status: 201 })
}
