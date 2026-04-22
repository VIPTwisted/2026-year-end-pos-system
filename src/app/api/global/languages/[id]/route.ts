import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  if (body.isDefault === true) {
    await prisma.language.updateMany({ where: { isDefault: true }, data: { isDefault: false } })
  }
  const language = await prisma.language.update({ where: { id }, data: body })
  return NextResponse.json(language)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.language.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
