import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const page = await prisma.sitePage.findUnique({
      where: { id },
      include: {
        modules: { orderBy: { position: 'asc' } },
        fragments: true,
        versions: { orderBy: { version: 'desc' }, take: 10 },
      },
    })
    if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    return NextResponse.json(page)
  } catch (err) {
    console.error('[site/pages/[id] GET]', err)
    return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, title, description, pageType, template, metaTitle, metaDesc, robotsIndex } = body as {
      name?: string; title?: string; description?: string; pageType?: string; template?: string; metaTitle?: string; metaDesc?: string; robotsIndex?: boolean
    }
    const page = await prisma.sitePage.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description }),
        ...(pageType !== undefined && { pageType }),
        ...(template !== undefined && { template }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDesc !== undefined && { metaDesc }),
        ...(robotsIndex !== undefined && { robotsIndex }),
      },
    })
    return NextResponse.json(page)
  } catch (err) {
    console.error('[site/pages/[id] PATCH]', err)
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.sitePage.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[site/pages/[id] DELETE]', err)
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 })
  }
}
