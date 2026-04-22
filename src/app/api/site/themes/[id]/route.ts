import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const theme = await prisma.siteTheme.findUnique({ where: { id } })
  if (!theme) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(theme)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const theme = await prisma.siteTheme.update({ where: { id }, data: body })
  return NextResponse.json(theme)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.siteTheme.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
