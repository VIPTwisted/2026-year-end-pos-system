import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { helpful } = await req.json()

  const article = await prisma.knowledgeArticle.update({
    where: { id },
    data: helpful
      ? { helpfulCount: { increment: 1 } }
      : { notHelpfulCount: { increment: 1 } },
  })
  return NextResponse.json({ helpfulCount: article.helpfulCount, notHelpfulCount: article.notHelpfulCount })
}
