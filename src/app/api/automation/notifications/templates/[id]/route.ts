import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const updated = await prisma.notificationTemplate.update({
    where: { id },
    data: {
      name: body.name,
      channel: body.channel,
      subject: body.subject,
      body: body.body,
      variables: body.variables !== undefined ? JSON.stringify(body.variables) : undefined,
      isActive: body.isActive,
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.notificationTemplate.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
