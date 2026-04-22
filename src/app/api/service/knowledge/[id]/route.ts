import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const article = await prisma.knowledgeArticle.findUnique({ where: { id } })
  if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await prisma.knowledgeArticle.update({ where: { id }, data: { viewCount: { increment: 1 } } })
  return NextResponse.json(article)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const article = await prisma.knowledgeArticle.update({ where: { id }, data: body })
  return NextResponse.json(article)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.knowledgeArticle.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
