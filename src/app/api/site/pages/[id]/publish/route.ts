import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const { publishedBy = 'Admin' } = body as { publishedBy?: string }
    const page = await prisma.sitePage.findUnique({ where: { id }, include: { modules: { orderBy: { position: 'asc' } } } })
    if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    const versionCount = await prisma.sitePageVersion.count({ where: { pageId: id } })
    const snapshot = JSON.stringify({ page, modules: page.modules })
    await prisma.$transaction([
      prisma.sitePageVersion.create({ data: { pageId: id, version: versionCount + 1, snapshot, publishedBy, publishedAt: new Date() } }),
      prisma.sitePage.update({ where: { id }, data: { status: 'published', publishedAt: new Date(), checkedOutBy: null, checkedOutAt: null } }),
    ])
    const updated = await prisma.sitePage.findUnique({ where: { id } })
    return NextResponse.json(updated)
  } catch (err) {
    console.error('[site/pages/[id]/publish POST]', err)
    return NextResponse.json({ error: 'Failed to publish page' }, { status: 500 })
  }
}
