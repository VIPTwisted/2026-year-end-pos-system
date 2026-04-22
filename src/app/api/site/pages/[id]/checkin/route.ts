import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const page = await prisma.sitePage.findUnique({ where: { id } })
    if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    const updated = await prisma.sitePage.update({
      where: { id },
      data: { status: 'checked-in', checkedOutBy: null, checkedOutAt: null },
    })
    return NextResponse.json(updated)
  } catch (err) {
    console.error('[site/pages/[id]/checkin POST]', err)
    return NextResponse.json({ error: 'Failed to check in page' }, { status: 500 })
  }
}
