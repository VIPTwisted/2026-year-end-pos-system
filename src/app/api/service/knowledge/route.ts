import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status   = searchParams.get('status')
  const category = searchParams.get('category')
  const search   = searchParams.get('search')

  const where: Record<string, unknown> = {}
  if (status)   where.status   = status
  if (category) where.category = category
  if (search) {
    where.OR = [
      { title:   { contains: search } },
      { body:    { contains: search } },
      { summary: { contains: search } },
      { tags:    { contains: search } },
    ]
  }

  const articles = await prisma.knowledgeArticle.findMany({ where, orderBy: { updatedAt: 'desc' } })
  return NextResponse.json(articles)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, category, body: articleBody, summary, tags, authorName } = body

  if (!title || !articleBody) {
    return NextResponse.json({ error: 'title and body are required' }, { status: 400 })
  }

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') + '-' + Date.now().toString(36)

  const article = await prisma.knowledgeArticle.create({
    data: {
      title, slug,
      category:  category   ?? 'general',
      body:      articleBody,
      summary:   summary    ?? null,
      tags:      tags       ?? null,
      authorName: authorName ?? null,
    },
  })
  return NextResponse.json(article, { status: 201 })
}
