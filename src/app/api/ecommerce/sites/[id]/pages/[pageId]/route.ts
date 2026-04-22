import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; pageId: string }> }) {
  try {
    const { id, pageId } = await params
    const body = await req.json()

    const page = await prisma.sitePage.updateMany({
      where: { id: pageId, siteId: id },
      data: {
        status: body.status,
        urlPath: body.urlPath,
        pageName: body.pageName,
      },
    })
    return NextResponse.json(page)
  } catch {
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; pageId: string }> }) {
  try {
    const { id, pageId } = await params
    await prisma.sitePage.deleteMany({ where: { id: pageId, siteId: id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 })
  }
}
