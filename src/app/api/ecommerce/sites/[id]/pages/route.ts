import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const pageType = searchParams.get('pageType')

    const where: any = { siteId: id }
    if (status) where.status = status
    if (pageType) where.pageType = pageType

    const pages = await prisma.sitePage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(pages)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { pageId, pageName, pageType, urlPath } = body

    if (!pageId || !pageName || !pageType || !urlPath) {
      return NextResponse.json({ error: 'pageId, pageName, pageType, urlPath required' }, { status: 400 })
    }

    const page = await prisma.sitePage.create({
      data: { siteId: id, pageId, pageName, pageType, urlPath, status: 'draft' },
    })
    return NextResponse.json(page, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 })
  }
}
