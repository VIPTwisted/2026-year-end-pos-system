import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const template = await prisma.outreachTemplate.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.channel !== undefined ? { channel: body.channel } : {}),
      ...(body.subject !== undefined ? { subject: body.subject } : {}),
      ...(body.body !== undefined ? { body: body.body } : {}),
      ...(body.occasion !== undefined ? { occasion: body.occasion } : {}),
      ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
    },
  })
  return NextResponse.json(template)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.outreachTemplate.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
