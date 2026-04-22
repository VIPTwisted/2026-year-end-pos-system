import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { user = 'Admin' } = body as { user?: string }
    const page = await prisma.sitePage.findUnique({ where: { id } })
    if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    if (page.status === 'checked-out' && page.checkedOutBy && page.checkedOutBy !== user) {
      return NextResponse.json({ error: `Page is checked out by ${page.checkedOutBy}`, checkedOutBy: page.checkedOutBy }, { status: 409 })
    }
    const updated = await prisma.sitePage.update({ where: { id }, data: { status: 'checked-out', checkedOutBy: user, checkedOutAt: new Date() } })
    return NextResponse.json(updated)
  } catch (err) {
    console.error('[site/pages/[id]/checkout POST]', err)
    return NextResponse.json({ error: 'Failed to checkout page' }, { status: 500 })
  }
}
