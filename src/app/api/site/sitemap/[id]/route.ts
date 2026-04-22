import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sitemap = await prisma.siteMap.findUnique({ where: { id } })
  if (!sitemap) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(sitemap)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const sitemap = await prisma.siteMap.update({ where: { id }, data: body })
  return NextResponse.json(sitemap)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.siteMap.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
