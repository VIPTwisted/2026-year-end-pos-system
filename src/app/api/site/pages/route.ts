import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const pages = await prisma.sitePage.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { modules: true, versions: true } },
      },
    })
    return NextResponse.json(pages)
  } catch (err) {
    console.error('[site/pages GET]', err)
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name, slug, title, description,
      pageType = 'content', template = 'default',
      metaTitle, metaDesc, robotsIndex = true,
    } = body as {
      name: string; slug: string; title: string; description?: string;
      pageType?: string; template?: string; metaTitle?: string; metaDesc?: string; robotsIndex?: boolean
    }

    if (!name?.trim()) return NextResponse.json({ error: 'name is required' }, { status: 400 })
    if (!slug?.trim()) return NextResponse.json({ error: 'slug is required' }, { status: 400 })
    if (!title?.trim()) return NextResponse.json({ error: 'title is required' }, { status: 400 })

    const page = await prisma.sitePage.create({
      data: {
        name: name.trim(),
        slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        title: title.trim(),
        description: description || null,
        pageType, template,
        metaTitle: metaTitle || null,
        metaDesc: metaDesc || null,
        robotsIndex, status: 'draft',
      },
    })
    return NextResponse.json(page, { status: 201 })
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }
    console.error('[site/pages POST]', err)
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 })
  }
}
