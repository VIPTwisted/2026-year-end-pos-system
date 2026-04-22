import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const article = await prisma.knowledgeArticle.update({
    where: { id },
    data: { status: 'published', publishedAt: new Date() },
  })
  return NextResponse.json(article)
}
