import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string; pageId: string }> }) {
  try {
    const { id, pageId } = await params
    await prisma.sitePage.updateMany({
      where: { id: pageId, siteId: id },
      data: { status: 'published', publishedAt: new Date() },
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to publish page' }, { status: 500 })
  }
}
