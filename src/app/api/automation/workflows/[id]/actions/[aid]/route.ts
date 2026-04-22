import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; aid: string }> }) {
  const { aid } = await params
  const body = await req.json()
  const updated = await prisma.automationAction.update({
    where: { id: aid },
    data: {
      actionType: body.actionType,
      config: body.config !== undefined ? JSON.stringify(body.config) : undefined,
      position: body.position,
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; aid: string }> }) {
  const { aid } = await params
  await prisma.automationAction.delete({ where: { id: aid } })
  return NextResponse.json({ ok: true })
}
