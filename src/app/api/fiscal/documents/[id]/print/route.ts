import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const existing = await prisma.fiscalDocument.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const doc = await prisma.fiscalDocument.update({
      where: { id },
      data: { status: 'printed' },
      include: { device: { select: { name: true } } },
    })
    return NextResponse.json(doc)
  } catch (error) {
    console.error('[POST /api/fiscal/documents/[id]/print]', error)
    return NextResponse.json({ error: 'Failed to mark as printed' }, { status: 500 })
  }
}
