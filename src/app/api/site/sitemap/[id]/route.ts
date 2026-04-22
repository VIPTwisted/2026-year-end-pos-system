import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const sitemap = await prisma.siteMap.findUnique({ where: { id: params.id } })
  if (!sitemap) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(sitemap)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const sitemap = await prisma.siteMap.update({ where: { id: params.id }, data: body })
  return NextResponse.json(sitemap)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.siteMap.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
