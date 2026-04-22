import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const template = await prisma.emailTemplate.findUnique({ where: { id } })
  if (!template) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(template)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const updated = await prisma.emailTemplate.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.category !== undefined && { category: body.category }),
      ...(body.subject !== undefined && { subject: body.subject }),
      ...(body.htmlBody !== undefined && { htmlBody: body.htmlBody }),
      ...(body.textBody !== undefined && { textBody: body.textBody }),
      ...(body.previewText !== undefined && { previewText: body.previewText }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.emailTemplate.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
