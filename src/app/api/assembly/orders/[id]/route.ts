import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await prisma.assemblyOrder.findUnique({
    where: { id },
    include: {
      bom: { select: { id: true, bomNo: true, versionCode: true } },
      lines: { orderBy: { lineNo: 'asc' } },
    },
  })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(order)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()

    const order = await prisma.assemblyOrder.findUnique({ where: { id }, select: { status: true } })
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const TRANSITIONS: Record<string, string[]> = {
      Open: ['Released'],
      Released: ['In Progress', 'Open'],
      'In Progress': ['Finished', 'Released'],
      Finished: [],
    }
    if (body.status && !TRANSITIONS[order.status]?.includes(body.status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${order.status} to ${body.status}` },
        { status: 400 }
      )
    }

    const updated = await prisma.assemblyOrder.update({
      where: { id },
      data: {
        ...(body.status ? { status: body.status } : {}),
        ...(body.qtyToAssemble !== undefined ? { qtyToAssemble: body.qtyToAssemble } : {}),
        ...(body.qtyAssembled !== undefined ? { qtyAssembled: body.qtyAssembled } : {}),
        ...(body.notes !== undefined ? { notes: body.notes } : {}),
        ...(body.dueDate !== undefined ? { dueDate: body.dueDate ? new Date(body.dueDate) : null } : {}),
        ...(body.isPosted !== undefined ? { isPosted: body.isPosted } : {}),
      },
      include: {
        bom: { select: { id: true, bomNo: true } },
        lines: { orderBy: { lineNo: 'asc' } },
      },
    })
    return NextResponse.json(updated)
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Update failed' }, { status: 500 })
  }
}
