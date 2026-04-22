import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const article = await prisma.knowledgeArticle.update({
    where: { id },
    data: { helpfulCount: { increment: 1 } },
  })
  return NextResponse.json(article)
}
