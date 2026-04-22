import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; eid: string }> }) {
  const { eid } = await params
  const body = await req.json()
  const entry = await prisma.clientelingEntry.update({
    where: { id: eid },
    data: {
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.lastContact !== undefined ? { lastContact: new Date(body.lastContact) } : {}),
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
      ...(body.priority !== undefined ? { priority: body.priority } : {}),
    },
  })
  return NextResponse.json(entry)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string; eid: string }> }) {
  const { eid } = await params
  await prisma.clientelingEntry.delete({ where: { id: eid } })
  return NextResponse.json({ ok: true })
}
