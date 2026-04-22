import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const theme = await prisma.siteTheme.findUnique({ where: { id: params.id } })
  if (!theme) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(theme)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const theme = await prisma.siteTheme.update({ where: { id: params.id }, data: body })
  return NextResponse.json(theme)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.siteTheme.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
